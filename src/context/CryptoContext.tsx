/**
 * CryptoContext — app-wide encryption state manager for EpiAid.
 *
 * What lives in localStorage:
 *   epiaid-crypto-enabled      : 'true'
 *   epiaid-crypto-salt         : base64  — PBKDF2 salt for password → main key
 *   epiaid-crypto-recovery-hash: hex     — SHA-256 of the recovery code (verification only)
 *   epiaid-crypto-recovery-salt: base64  — PBKDF2 salt for recovery code → recovery key
 *   epiaid-crypto-recovery-blob: base64  — main key raw bytes encrypted with recovery key
 *   epiaid-crypto-verifier     : base64  — known plaintext encrypted with main key (unlock check)
 *
 * What NEVER leaves memory:
 *   CryptoKey — held only in React state, never serialised or persisted.
 */

import {
    createContext,
    useCallback,
    useContext,
    useState,
    type ReactNode,
} from 'react';
import {
    decryptData,
    encryptData,
    generateRecoveryCode,
    generateSalt,
    hashRecoveryCode,
} from '../utils/crypto';

// ─── localStorage keys ──────────────────────────────────────────────────────

const LS_ENABLED = 'epiaid-crypto-enabled';
const LS_SALT = 'epiaid-crypto-salt';
const LS_RECOVERY_HASH = 'epiaid-crypto-recovery-hash';
const LS_RECOVERY_SALT = 'epiaid-crypto-recovery-salt';
const LS_RECOVERY_BLOB = 'epiaid-crypto-recovery-blob';
const LS_VERIFIER = 'epiaid-crypto-verifier';

const VERIFIER_PLAINTEXT = 'epiaid-verified';
const PBKDF2_ITERATIONS = 310_000;

// ─── Internal crypto helpers ─────────────────────────────────────────────────

function toBase64(bytes: Uint8Array): string {
    return btoa(String.fromCharCode(...bytes));
}

function fromBase64(b64: string): Uint8Array {
    return Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
}

async function pbkdf2DeriveKey(
    password: string,
    salt: Uint8Array,
    extractable: boolean,
): Promise<CryptoKey> {
    const enc = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
        'raw',
        enc.encode(password),
        'PBKDF2',
        false,
        ['deriveKey'],
    );
    return crypto.subtle.deriveKey(
        { name: 'PBKDF2', salt: salt as unknown as Uint8Array<ArrayBuffer>, iterations: PBKDF2_ITERATIONS, hash: 'SHA-256' },
        keyMaterial,
        { name: 'AES-GCM', length: 256 },
        extractable,
        ['encrypt', 'decrypt'],
    );
}

async function wrapRawKey(rawKey: ArrayBuffer, wrapKey: CryptoKey): Promise<string> {
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const wrapped = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, wrapKey, rawKey);
    const combined = new Uint8Array(iv.byteLength + wrapped.byteLength);
    combined.set(iv, 0);
    combined.set(new Uint8Array(wrapped), iv.byteLength);
    return toBase64(combined);
}

async function unwrapRawKey(blob: string, wrapKey: CryptoKey): Promise<ArrayBuffer> {
    const combined = fromBase64(blob);
    const iv = combined.slice(0, 12);
    const ciphertext = combined.slice(12);
    return crypto.subtle.decrypt({ name: 'AES-GCM', iv }, wrapKey, ciphertext);
}

async function importRawKey(rawKey: ArrayBuffer): Promise<CryptoKey> {
    return crypto.subtle.importKey('raw', rawKey, { name: 'AES-GCM', length: 256 }, false, [
        'encrypt',
        'decrypt',
    ]);
}

// ─── Context types ────────────────────────────────────────────────────────────

interface CryptoContextValue {
    isEncryptionEnabled: boolean;
    isUnlocked: boolean;
    cryptoKey: CryptoKey | null;
    enableEncryption(password: string): Promise<string>;
    disableEncryption(password: string): Promise<void>;
    unlock(password: string): Promise<boolean>;
    unlockWithRecoveryCode(code: string): Promise<boolean>;
    lock(): void;
    changePassword(
        oldPassword: string,
        newPassword: string,
        onBeforeCommit?: (oldKey: CryptoKey, newKey: CryptoKey) => Promise<void>,
    ): Promise<string>;
    /**
     * Last-resort escape hatch: when both password and recovery code are lost,
     * clears all encryption metadata AND deletes stored patient records
     * (encrypted ones would otherwise sit forever as unreadable ciphertext).
     * Irreversible — caller must obtain explicit confirmation first.
     */
    resetForgotten(): Promise<void>;
}

const CryptoContext = createContext<CryptoContextValue>({
    isEncryptionEnabled: false,
    isUnlocked: false,
    cryptoKey: null,
    enableEncryption: async () => '',
    disableEncryption: async () => { },
    unlock: async () => false,
    unlockWithRecoveryCode: async () => false,
    lock: () => { },
    changePassword: async () => '',
    resetForgotten: async () => { },
});

// ─── Provider ────────────────────────────────────────────────────────────────

export function CryptoProvider({ children }: { children: ReactNode }) {
    const [isEncryptionEnabled, setIsEncryptionEnabled] = useState<boolean>(
        () => localStorage.getItem(LS_ENABLED) === 'true',
    );
    const [cryptoKey, setCryptoKey] = useState<CryptoKey | null>(null);

    const enableEncryption = useCallback(async (password: string): Promise<string> => {
        const salt = generateSalt();
        const mainKey = await pbkdf2DeriveKey(password, salt, true);
        const verifier = await encryptData(VERIFIER_PLAINTEXT, mainKey);

        const recoveryCode = generateRecoveryCode();
        const recoveryCodeHash = await hashRecoveryCode(recoveryCode);
        const recoverySalt = generateSalt();
        const recoveryKey = await pbkdf2DeriveKey(recoveryCode, recoverySalt, false);
        const rawMainKey = await crypto.subtle.exportKey('raw', mainKey);
        const recoveryBlob = await wrapRawKey(rawMainKey, recoveryKey);

        localStorage.setItem(LS_ENABLED, 'true');
        localStorage.setItem(LS_SALT, toBase64(salt));
        localStorage.setItem(LS_RECOVERY_HASH, recoveryCodeHash);
        localStorage.setItem(LS_RECOVERY_SALT, toBase64(recoverySalt));
        localStorage.setItem(LS_RECOVERY_BLOB, recoveryBlob);
        localStorage.setItem(LS_VERIFIER, verifier);

        const runtimeKey = await importRawKey(rawMainKey);
        setIsEncryptionEnabled(true);
        setCryptoKey(runtimeKey);

        return recoveryCode;
    }, []);

    const disableEncryption = useCallback(async (password: string): Promise<void> => {
        const saltB64 = localStorage.getItem(LS_SALT);
        const verifier = localStorage.getItem(LS_VERIFIER);
        if (!saltB64 || !verifier) throw new Error('Encryption metadata missing.');

        const salt = fromBase64(saltB64);
        const key = await pbkdf2DeriveKey(password, salt, false);

        try {
            const result = await decryptData(verifier, key);
            if (result !== VERIFIER_PLAINTEXT) throw new Error();
        } catch {
            throw new Error('Incorrect password.');
        }

        for (const k of [LS_ENABLED, LS_SALT, LS_RECOVERY_HASH, LS_RECOVERY_SALT, LS_RECOVERY_BLOB, LS_VERIFIER]) {
            localStorage.removeItem(k);
        }

        setIsEncryptionEnabled(false);
        setCryptoKey(null);
    }, []);

    const unlock = useCallback(async (password: string): Promise<boolean> => {
        const saltB64 = localStorage.getItem(LS_SALT);
        const verifier = localStorage.getItem(LS_VERIFIER);
        if (!saltB64 || !verifier) return false;

        try {
            const salt = fromBase64(saltB64);
            const key = await pbkdf2DeriveKey(password, salt, false);
            const result = await decryptData(verifier, key);
            if (result !== VERIFIER_PLAINTEXT) return false;
            setCryptoKey(key);
            return true;
        } catch {
            return false;
        }
    }, []);

    const unlockWithRecoveryCode = useCallback(async (code: string): Promise<boolean> => {
        const storedHash = localStorage.getItem(LS_RECOVERY_HASH);
        const recoverySaltB64 = localStorage.getItem(LS_RECOVERY_SALT);
        const recoveryBlob = localStorage.getItem(LS_RECOVERY_BLOB);
        if (!storedHash || !recoverySaltB64 || !recoveryBlob) return false;

        try {
            const codeHash = await hashRecoveryCode(code);
            if (codeHash !== storedHash) return false;

            const recoverySalt = fromBase64(recoverySaltB64);
            const recoveryKey = await pbkdf2DeriveKey(code, recoverySalt, false);
            const rawMainKey = await unwrapRawKey(recoveryBlob, recoveryKey);
            const runtimeKey = await importRawKey(rawMainKey);
            setCryptoKey(runtimeKey);
            return true;
        } catch {
            return false;
        }
    }, []);

    const lock = useCallback((): void => {
        setCryptoKey(null);
    }, []);

    const changePassword = useCallback(async (
        oldPassword: string,
        newPassword: string,
        onBeforeCommit?: (oldKey: CryptoKey, newKey: CryptoKey) => Promise<void>,
    ): Promise<string> => {
        const saltB64 = localStorage.getItem(LS_SALT);
        const verifier = localStorage.getItem(LS_VERIFIER);
        if (!saltB64 || !verifier) throw new Error('Encryption metadata missing.');

        const oldSalt = fromBase64(saltB64);
        const oldKey = await pbkdf2DeriveKey(oldPassword, oldSalt, false);
        try {
            const result = await decryptData(verifier, oldKey);
            if (result !== VERIFIER_PLAINTEXT) throw new Error();
        } catch {
            throw new Error('Incorrect current password.');
        }

        const newSalt = generateSalt();
        const newMainKey = await pbkdf2DeriveKey(newPassword, newSalt, true);
        const newVerifier = await encryptData(VERIFIER_PLAINTEXT, newMainKey);

        const recoveryCode = generateRecoveryCode();
        const recoveryCodeHash = await hashRecoveryCode(recoveryCode);
        const newRecoverySalt = generateSalt();
        const newRecoveryKey = await pbkdf2DeriveKey(recoveryCode, newRecoverySalt, false);
        const rawNewKey = await crypto.subtle.exportKey('raw', newMainKey);
        const recoveryBlob = await wrapRawKey(rawNewKey, newRecoveryKey);

        const runtimeKey = await importRawKey(rawNewKey);
        if (onBeforeCommit) await onBeforeCommit(oldKey, runtimeKey);

        localStorage.setItem(LS_SALT, toBase64(newSalt));
        localStorage.setItem(LS_VERIFIER, newVerifier);
        localStorage.setItem(LS_RECOVERY_HASH, recoveryCodeHash);
        localStorage.setItem(LS_RECOVERY_SALT, toBase64(newRecoverySalt));
        localStorage.setItem(LS_RECOVERY_BLOB, recoveryBlob);

        setCryptoKey(runtimeKey);
        return recoveryCode;
    }, []);

    const resetForgotten = useCallback(async (): Promise<void> => {
        // No key available — encrypted rows can never be decrypted again, so we
        // clear the patient list along with the crypto metadata rather than
        // leave permanently-orphaned ciphertext.
        localStorage.removeItem('epiaid_patients');
        for (const k of [LS_ENABLED, LS_SALT, LS_RECOVERY_HASH, LS_RECOVERY_SALT, LS_RECOVERY_BLOB, LS_VERIFIER]) {
            localStorage.removeItem(k);
        }
        setIsEncryptionEnabled(false);
        setCryptoKey(null);
    }, []);

    return (
        <CryptoContext.Provider
            value={{
                isEncryptionEnabled,
                isUnlocked: cryptoKey !== null,
                cryptoKey,
                enableEncryption,
                disableEncryption,
                unlock,
                unlockWithRecoveryCode,
                lock,
                changePassword,
                resetForgotten,
            }}
        >
            {children}
        </CryptoContext.Provider>
    );
}

export function useCrypto(): CryptoContextValue {
    return useContext(CryptoContext);
}