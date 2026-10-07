interface PrivacyNoticeProps {
  className?: string;
}

export function PrivacyNotice({ className }: PrivacyNoticeProps) {
  return (
    <aside
      className={[
        'flex items-start gap-2 rounded-lg border px-3 py-2.5 text-xs',
        'border-green-200 bg-green-50 text-green-800',
        'dark:border-green-800 dark:bg-green-950/20 dark:text-green-400',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      role="note"
      aria-label="Privacy notice"
    >
      <svg
        className="mt-0.5 h-3.5 w-3.5 shrink-0"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
        />
      </svg>
      <span>
        Your data is processed locally in your browser and is not uploaded to our servers.
      </span>
    </aside>
  );
}
