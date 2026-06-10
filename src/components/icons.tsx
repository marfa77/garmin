export function IconHeart({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    </svg>
  );
}

export function IconMoon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 3a9 9 0 109 9c0-.46-.04-.92-.1-1.36a5.5 5.5 0 01-4.4 2.26 5.5 5.5 0 01-5.44-6.32A9 9 0 0112 3z" />
    </svg>
  );
}

export function IconBolt({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M11 21h-1l1-7H7.5c-.58 0-.57-.32-.38-.66L11 3h1l-1 7h3.5c.49 0 .56.33.47.51l-4 10.5z" />
    </svg>
  );
}

export function IconPulse({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 12h4l2-7 4 14 2-7h6" />
    </svg>
  );
}
