/**
 * Low-level AES-GCM encryption helpers, shared by CryptoContext and the
 * storage layer. Adapted from the EpiLog implementation.
 */

function toBase64(bytes: Uint8Array): string {
    return btoa(String.fromCharCode(...bytes));
}

function fromBase64(b64: string): Uint8Array {
    return Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
}

/** Encrypts a plaintext string with an AES-GCM key. Returns base64 (IV + ciphertext). */
export async function encryptData(plaintext: string, key: CryptoKey): Promise<string> {
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const enc = new TextEncoder().encode(plaintext);
    const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, enc);
    const combined = new Uint8Array(iv.byteLength + ciphertext.byteLength);
    combined.set(iv, 0);
    combined.set(new Uint8Array(ciphertext), iv.byteLength);
    return toBase64(combined);
}

/** Decrypts a base64 (IV + ciphertext) blob with an AES-GCM key. Returns plaintext string. */
export async function decryptData(blob: string, key: CryptoKey): Promise<string> {
    const combined = fromBase64(blob);
    const iv = combined.slice(0, 12);
    const ciphertext = combined.slice(12);
    const plainBuf = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ciphertext);
    return new TextDecoder().decode(plainBuf);
}

/** Generates a random 16-byte salt for PBKDF2. */
export function generateSalt(): Uint8Array {
    return crypto.getRandomValues(new Uint8Array(16));
}

/** Generates a 16-character recovery code (uppercase alphanumeric, no ambiguous chars). */
export function generateRecoveryCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no 0/O/1/I
    const bytes = crypto.getRandomValues(new Uint8Array(16));
    return Array.from(bytes, (b) => chars[b % chars.length]).join('');
}

/** SHA-256 hash of the recovery code, for verification without storing it. */
export async function hashRecoveryCode(code: string): Promise<string> {
    const enc = new TextEncoder().encode(code);
    const hashBuf = await crypto.subtle.digest('SHA-256', enc);
    return Array.from(new Uint8Array(hashBuf))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
}