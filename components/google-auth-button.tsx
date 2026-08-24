import { signInWithGoogle } from '@/app/actions/auth';

// Plain server-rendered form — no client state needed, the whole OAuth
// kick-off happens in the signInWithGoogle server action (which redirects
// to Supabase's authorize URL).
export function GoogleAuthButton({ next, label = 'Continue with Google' }: { next: string; label?: string }) {
  return (
    <form action={signInWithGoogle}>
      <input type="hidden" name="next" value={next} />
      <button
        type="submit"
        className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-brand-950/10 px-4 py-3 text-sm font-semibold text-brand-800 transition hover:bg-brand-50"
      >
        <GoogleIcon />
        {label}
      </button>
    </form>
  );
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden="true">
      <path
        fill="#FFC107"
        d="M43.6 20.5H42V20.4H24v7.2h11.3c-1.6 4.6-6 7.9-11.3 7.9-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.1-5.1C34 6 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.5z"
      />
      <path
        fill="#FF3D00"
        d="m6.3 14.7 5.9 4.3C13.7 15.5 18.5 12 24 12c3.1 0 5.9 1.2 8 3.1l5.1-5.1C34 6 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.5 26.7 36.4 24 36.4c-5.3 0-9.7-3.4-11.3-8.1l-6.1 4.7C9.5 39.6 16.2 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.5H42V20.4H24v7.2h11.3c-.8 2.2-2.2 4.1-4.1 5.4l6.2 5.2C40.9 35.6 44 30.4 44 24c0-1.3-.1-2.7-.4-3.5z"
      />
    </svg>
  );
}

export function AuthDivider() {
  return (
    <div className="flex items-center gap-3 text-xs text-brand-400">
      <span className="h-px flex-1 bg-brand-950/10" />
      or
      <span className="h-px flex-1 bg-brand-950/10" />
    </div>
  );
}
