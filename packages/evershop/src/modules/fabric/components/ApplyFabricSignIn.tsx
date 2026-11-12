import { CustomerLoginForm } from '@components/frontStore/customer/LoginForm.js';
import { CustomerRegistrationForm } from '@components/frontStore/customer/RegistrationForm.js';
import React from 'react';
import { APPLY_FABRIC_STAY_URL } from '../services/applyFabricGate.js';

function messageOf(failure: unknown): string {
  if (failure instanceof Error && failure.message) return failure.message;
  if (typeof failure === 'string' && failure.trim()) return failure.trim();
  const message = (failure as { message?: unknown } | null)?.message;
  if (typeof message === 'string' && message.trim()) return message.trim();
  return 'Sign-in failed. Try again.';
}

/**
 * Sign-in stays on this page. An empty redirect keeps the generated image
 * in memory instead of sending the browser to the account page.
 */
export function ApplyFabricSignIn({ onClose }: { onClose: () => void }) {
  const [mode, setMode] = React.useState<'login' | 'register'>('login');
  const [error, setError] = React.useState('');
  const dialogRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    dialogRef.current?.focus();
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="apply-fabric-sign-in-title"
        tabIndex={-1}
        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-lg border border-border bg-card p-5 shadow-lg outline-none"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2
              id="apply-fabric-sign-in-title"
              className="text-lg font-semibold tracking-tight"
            >
              {mode === 'login'
                ? 'Sign in to see your design'
                : 'Create an account to see your design'}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Your image stays on this page. It appears as soon as you finish.
            </p>
          </div>
          <button
            type="button"
            className="cursor-pointer text-sm text-muted-foreground"
            onClick={onClose}
            aria-label="Close"
          >
            Close
          </button>
        </div>
        {error ? (
          <p className="mb-3 text-sm text-red-700" role="alert">
            {error}
          </p>
        ) : null}
        {mode === 'login' ? (
          <CustomerLoginForm
            redirectUrl={APPLY_FABRIC_STAY_URL}
            onError={(failure) => setError(messageOf(failure))}
          />
        ) : (
          <CustomerRegistrationForm
            className=""
            redirectUrl={APPLY_FABRIC_STAY_URL}
            onError={(failure) => setError(messageOf(failure))}
          />
        )}
        <button
          type="button"
          className="mt-3 cursor-pointer text-sm underline"
          onClick={() => {
            setError('');
            setMode((current) => (current === 'login' ? 'register' : 'login'));
          }}
        >
          {mode === 'login'
            ? 'Need an account? Register'
            : 'Already registered? Sign in'}
        </button>
      </div>
    </div>
  );
}
