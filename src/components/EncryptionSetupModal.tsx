import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Shield, ShieldCheck, Loader2, AlertCircle, Copy, Check, X, Lock, Eye, EyeOff } from 'lucide-react';
import { useCrypto } from '../context/CryptoContext';
import { reencryptAll } from '../lib/storage';
import { Button } from './ui/Button';

type View = 'menu' | 'enable' | 'enable-recovery' | 'disable' | 'change';

/** Password input with a show/hide toggle, used throughout this modal. */
function PasswordField({
    value,
    onChange,
    placeholder,
    autoComplete,
}: {
    value: string;
    onChange: (v: string) => void;
    placeholder: string;
    autoComplete: string;
}) {
    const [visible, setVisible] = useState(false);
    return (
        <div className="relative">
            <input
                type={visible ? 'text' : 'password'}
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="input pr-10"
                autoComplete={autoComplete}
            />
            <button
                type="button"
                onClick={() => setVisible((v) => !v)}
                tabIndex={-1}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-slate-500"
            >
                {visible ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
        </div>
    );
}

export function EncryptionSetupModal({ onClose }: { onClose: () => void }) {
    const { t } = useTranslation();
    const { isEncryptionEnabled, enableEncryption, disableEncryption, changePassword, lock } = useCrypto();

    const [view, setView] = useState<View>('menu');
    const [pwd, setPwd] = useState('');
    const [pwd2, setPwd2] = useState('');
    const [oldPwd, setOldPwd] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [recoveryCode, setRecoveryCode] = useState('');
    const [copied, setCopied] = useState(false);

    const reset = useCallback(() => {
        setPwd(''); setPwd2(''); setOldPwd(''); setError(''); setCopied(false);
    }, []);

    const handleEnable = useCallback(async () => {
        if (pwd.length < 6) { setError(t('encryption.pwdTooShort')); return; }
        if (pwd !== pwd2) { setError(t('encryption.pwdMismatch')); return; }
        setLoading(true); setError('');
        try {
            const code = await enableEncryption(pwd, (newKey) => reencryptAll(null, newKey));
            setRecoveryCode(code);
            setView('enable-recovery');
        } catch {
            setError(t('encryption.genericError'));
        } finally {
            setLoading(false);
        }
    }, [enableEncryption, pwd, pwd2, t]);

    const handleDisable = useCallback(async () => {
        setLoading(true); setError('');
        try {
            await disableEncryption(pwd, (key) => reencryptAll(key, null));
            onClose();
        } catch {
            setError(t('unlock.pwdError'));
        } finally {
            setLoading(false);
        }
    }, [disableEncryption, onClose, pwd, t]);

    const handleChangePassword = useCallback(async () => {
        if (pwd.length < 6) { setError(t('encryption.pwdTooShort')); return; }
        if (pwd !== pwd2) { setError(t('encryption.pwdMismatch')); return; }
        setLoading(true); setError('');
        try {
            const code = await changePassword(oldPwd, pwd, (oldKey, newKey) => reencryptAll(oldKey, newKey));
            setRecoveryCode(code);
            setView('enable-recovery');
        } catch {
            setError(t('unlock.pwdError'));
        } finally {
            setLoading(false);
        }
    }, [changePassword, oldPwd, pwd, pwd2, t]);

    const copyCode = useCallback(() => {
        navigator.clipboard.writeText(recoveryCode).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    }, [recoveryCode]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
            <div className="w-full max-w-sm bg-white dark:bg-[#1a2e27] rounded-2xl p-5 relative">
                {view !== 'enable-recovery' && (
                    <button onClick={onClose} className="absolute right-4 top-4 text-slate-400 hover:text-slate-600">
                        <X size={18} />
                    </button>
                )}

                {/* ── Menu ─────────────────────────────────────────────────────── */}
                {view === 'menu' && (
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-2 mb-1">
                            {isEncryptionEnabled ? <ShieldCheck size={22} className="text-green-600" /> : <Shield size={22} className="text-slate-400" />}
                            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">{t('encryption.title')}</h2>
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            {isEncryptionEnabled ? t('encryption.statusOn') : t('encryption.statusOff')}
                        </p>

                        {!isEncryptionEnabled ? (
                            <Button fullWidth onClick={() => { reset(); setView('enable'); }}>
                                <Shield size={14} className="mr-1.5" /> {t('encryption.enableBtn')}
                            </Button>
                        ) : (
                            <div className="flex flex-col gap-2">
                                <Button fullWidth onClick={() => { reset(); setView('change'); }}>
                                    {t('encryption.changePwdBtn')}
                                </Button>
                                <Button fullWidth variant="danger" onClick={() => { reset(); setView('disable'); }}>
                                    {t('encryption.disableBtn')}
                                </Button>
                                <Button fullWidth variant="ghost" onClick={() => { lock(); onClose(); }}>
                                    <Lock size={14} className="mr-1.5" /> {t('encryption.lockNowBtn')}
                                </Button>
                            </div>
                        )}
                    </div>
                )}

                {/* ── Enable (set password) ───────────────────────────────────── */}
                {view === 'enable' && (
                    <div className="flex flex-col gap-3">
                        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">{t('encryption.enableBtn')}</h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{t('encryption.enableDesc')}</p>
                        <PasswordField
                            value={pwd} onChange={setPwd}
                            placeholder={t('encryption.newPwdPlaceholder')} autoComplete="new-password"
                        />
                        <PasswordField
                            value={pwd2} onChange={setPwd2}
                            placeholder={t('encryption.confirmPwdPlaceholder')} autoComplete="new-password"
                        />
                        {error && <div className="flex items-center gap-1.5 text-red-500 text-xs"><AlertCircle size={14} />{error}</div>}
                        <Button fullWidth onClick={handleEnable} disabled={loading || !pwd || !pwd2}>
                            {loading ? <Loader2 size={16} className="animate-spin" /> : t('encryption.enableBtn')}
                        </Button>
                        <button onClick={() => setView('menu')} className="text-xs text-slate-400 hover:text-slate-600">
                            {t('common.back')}
                        </button>
                    </div>
                )}

                {/* ── Show recovery code (after enable/change) ────────────────── */}
                {view === 'enable-recovery' && (
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-2">
                            <ShieldCheck size={22} className="text-green-600" />
                            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">{t('encryption.recoveryTitle')}</h2>
                        </div>
                        <p className="text-sm text-amber-600 dark:text-amber-400 font-medium leading-relaxed">
                            {t('encryption.recoveryWarning')}
                        </p>
                        <div className="flex items-center gap-2 bg-slate-100 dark:bg-[#243d36] rounded-xl p-3">
                            <code className="flex-1 text-center font-mono text-base tracking-wider text-slate-800 dark:text-slate-100">
                                {recoveryCode}
                            </code>
                            <button onClick={copyCode} className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400">
                                {copied ? <Check size={16} className="text-green-600" /> : <Copy size={16} />}
                            </button>
                        </div>
                        <Button fullWidth onClick={onClose}>{t('encryption.recoverySavedBtn')}</Button>
                    </div>
                )}

                {/* ── Disable ──────────────────────────────────────────────────── */}
                {view === 'disable' && (
                    <div className="flex flex-col gap-3">
                        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">{t('encryption.disableBtn')}</h2>
                        <p className="text-xs text-red-500 dark:text-red-400 leading-relaxed">{t('encryption.disableWarning')}</p>
                        <PasswordField
                            value={pwd} onChange={setPwd}
                            placeholder={t('unlock.pwdPlaceholder')} autoComplete="current-password"
                        />
                        {error && <div className="flex items-center gap-1.5 text-red-500 text-xs"><AlertCircle size={14} />{error}</div>}
                        <Button fullWidth variant="danger" onClick={handleDisable} disabled={loading || !pwd}>
                            {loading ? <Loader2 size={16} className="animate-spin" /> : t('encryption.disableBtn')}
                        </Button>
                        <button onClick={() => setView('menu')} className="text-xs text-slate-400 hover:text-slate-600">
                            {t('common.back')}
                        </button>
                    </div>
                )}

                {/* ── Change password ─────────────────────────────────────────── */}
                {view === 'change' && (
                    <div className="flex flex-col gap-3">
                        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">{t('encryption.changePwdBtn')}</h2>
                        <PasswordField
                            value={oldPwd} onChange={setOldPwd}
                            placeholder={t('encryption.currentPwdPlaceholder')} autoComplete="current-password"
                        />
                        <PasswordField
                            value={pwd} onChange={setPwd}
                            placeholder={t('encryption.newPwdPlaceholder')} autoComplete="new-password"
                        />
                        <PasswordField
                            value={pwd2} onChange={setPwd2}
                            placeholder={t('encryption.confirmPwdPlaceholder')} autoComplete="new-password"
                        />
                        {error && <div className="flex items-center gap-1.5 text-red-500 text-xs"><AlertCircle size={14} />{error}</div>}
                        <Button fullWidth onClick={handleChangePassword} disabled={loading || !oldPwd || !pwd || !pwd2}>
                            {loading ? <Loader2 size={16} className="animate-spin" /> : t('encryption.changePwdBtn')}
                        </Button>
                        <button onClick={() => setView('menu')} className="text-xs text-slate-400 hover:text-slate-600">
                            {t('common.back')}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}