import { useState, useCallback, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Lock, Loader2, AlertCircle, ShieldCheck, Eye, EyeOff, AlertTriangle, Trash2 } from 'lucide-react';
import { useCrypto } from '../context/CryptoContext';

type Mode = 'password' | 'recovery';

const RESET_PHRASE: Record<string, string> = {
    ko: '초기화', en: 'RESET', fr: 'RÉINITIALISER', sw: 'WEKA UPYA',
};

export function UnlockModal() {
    const { t, i18n } = useTranslation();
    const lang = i18n.language in RESET_PHRASE ? i18n.language : 'en';
    const { unlock, unlockWithRecoveryCode, resetForgotten } = useCrypto();

    const [mode, setMode] = useState<Mode>('password');
    const [value, setValue] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const [showReset, setShowReset] = useState(false);
    const [resetConfirmText, setResetConfirmText] = useState('');
    const [resetting, setResetting] = useState(false);

    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setValue('');
        setError('');
        setShowPassword(false);
        setTimeout(() => inputRef.current?.focus(), 50);
    }, [mode]);

    const handleSubmit = useCallback(async () => {
        if (!value.trim() || loading) return;
        setLoading(true);
        setError('');
        try {
            const ok =
                mode === 'password'
                    ? await unlock(value)
                    : await unlockWithRecoveryCode(value.trim().replace(/\s/g, '').toUpperCase());
            if (!ok) setError(mode === 'password' ? t('unlock.pwdError') : t('unlock.recoveryError'));
        } finally {
            setLoading(false);
        }
    }, [loading, mode, t, unlock, unlockWithRecoveryCode, value]);

    const handleKey = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleSubmit();
    }, [handleSubmit]);

    const requiredPhrase = RESET_PHRASE[lang];
    const canReset = resetConfirmText.trim() === requiredPhrase;

    const handleReset = useCallback(async () => {
        if (!canReset || resetting) return;
        setResetting(true);
        try {
            await resetForgotten();
        } finally {
            setResetting(false);
        }
    }, [canReset, resetForgotten, resetting]);

    if (showReset) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/95 backdrop-blur-md px-6">
                <div className="w-full max-w-sm flex flex-col items-center gap-5">
                    <div className="w-20 h-20 rounded-full bg-red-600/20 border-2 border-red-500/40 flex items-center justify-center">
                        <AlertTriangle size={36} className="text-red-400" />
                    </div>
                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-white">{t('unlock.resetTitle')}</h1>
                        <p className="text-sm text-gray-300 mt-2 leading-relaxed">{t('unlock.resetDesc')}</p>
                    </div>
                    <div className="w-full">
                        <label className="block text-xs font-medium text-gray-400 mb-1.5">
                            {t('unlock.resetPrompt', { phrase: requiredPhrase })}
                        </label>
                        <input
                            type="text"
                            value={resetConfirmText}
                            onChange={(e) => setResetConfirmText(e.target.value)}
                            spellCheck={false}
                            autoComplete="off"
                            className="w-full h-12 px-4 rounded-xl border border-red-800 bg-gray-800 text-white placeholder-gray-600 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent font-mono"
                            placeholder={requiredPhrase}
                        />
                    </div>
                    <div className="w-full flex flex-col gap-2">
                        <button
                            type="button"
                            disabled={!canReset || resetting}
                            onClick={handleReset}
                            className="w-full h-12 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-500 disabled:bg-red-900 text-white disabled:text-red-400/60 rounded-xl font-semibold text-sm active:bg-red-700 touch-manipulation transition-colors"
                        >
                            {resetting ? <Loader2 size={18} className="animate-spin" /> : (
                                <><Trash2 size={18} />{t('unlock.resetConfirmBtn')}</>
                            )}
                        </button>
                        <button
                            type="button"
                            onClick={() => { setShowReset(false); setResetConfirmText(''); }}
                            className="w-full h-11 text-sm text-gray-300 hover:text-white touch-manipulation"
                        >
                            {t('unlock.resetCancel')}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/95 backdrop-blur-md px-6 dark:bg-gray-900">
            <div className="w-full max-w-sm flex flex-col items-center gap-6">
                <div className="w-20 h-20 rounded-full bg-teal-600/20 border-2 border-teal-500/40 flex items-center justify-center">
                    <Lock size={36} className="text-teal-400" />
                </div>
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-white">{t('unlock.title')}</h1>
                    <p className="text-sm text-gray-400 mt-1.5 leading-relaxed dark:text-gray-300">{t('unlock.desc')}</p>
                </div>
                <div className="w-full flex flex-col gap-3">
                    <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1.5 dark:text-gray-300">
                            {mode === 'password' ? t('unlock.pwdLabel') : t('unlock.recoveryLabel')}
                        </label>
                        <div className="relative">
                            <input
                                ref={inputRef}
                                type={mode === 'password' ? (showPassword ? 'text' : 'password') : 'text'}
                                value={value}
                                onChange={(e) => setValue(
                                    mode === 'recovery'
                                        ? e.target.value.replace(/\s/g, '').toUpperCase().replace(/[^A-Z0-9]/g, '')
                                        : e.target.value,
                                )}
                                onKeyDown={handleKey}
                                placeholder={mode === 'password' ? t('unlock.pwdPlaceholder') : t('unlock.recoveryPlaceholder')}
                                autoComplete={mode === 'password' ? 'current-password' : 'off'}
                                spellCheck={false}
                                className="w-full h-12 px-4 pr-12 rounded-xl border border-gray-700 bg-gray-800 text-white placeholder-gray-600 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent font-mono dark:bg-gray-800 dark:text-white dark:border-gray-600"
                            />
                            {mode === 'password' && (
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((v) => !v)}
                                    tabIndex={-1}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-teal-400 hover:text-teal-300 transition-colors"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            )}
                        </div>
                    </div>
                    {error && (
                        <div className="flex items-center gap-2 text-red-400 text-sm">
                            <AlertCircle size={16} className="shrink-0" />{error}
                        </div>
                    )}
                    <button
                        type="button"
                        disabled={!value.trim() || loading}
                        onClick={handleSubmit}
                        className="w-full h-12 flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-500 disabled:bg-teal-900 text-white disabled:text-teal-600/60 rounded-xl font-semibold text-sm active:bg-teal-700 touch-manipulation transition-colors"
                    >
                        {loading ? <Loader2 size={18} className="animate-spin" /> : (
                            <><ShieldCheck size={18} />{t('unlock.unlockBtn')}</>
                        )}
                    </button>
                </div>
                <button
                    type="button"
                    onClick={() => setMode(mode === 'password' ? 'recovery' : 'password')}
                    className="text-sm text-teal-400 hover:text-teal-300 touch-manipulation dark:text-teal-400"
                >
                    {mode === 'password' ? t('unlock.switchToRecovery') : t('unlock.switchToPwd')}
                </button>
                <button
                    type="button"
                    onClick={() => setShowReset(true)}
                    className="text-xs text-gray-500 hover:text-gray-300 touch-manipulation underline underline-offset-2"
                >
                    {t('unlock.forgotBoth')}
                </button>
            </div>
        </div>
    );
}