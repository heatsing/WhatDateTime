type IconName =
  | "arrow"
  | "cake"
  | "calendar"
  | "check"
  | "chevron"
  | "difference"
  | "globe"
  | "menu"
  | "search"
  | "spark"
  | "timer";

export function Icon({
  name,
  className = "h-5 w-5",
}: {
  name: IconName | string;
  className?: string;
}) {
  const paths: Record<string, React.ReactNode> = {
    arrow: <path d="M5 12h14m-5-5 5 5-5 5" />,
    cake: (
      <>
        <path d="M4 11h16v9H4zM4 15c2 0 2 1.5 4 1.5s2-1.5 4-1.5 2 1.5 4 1.5 2-1.5 4-1.5M8 11V8m4 3V7m4 4V8" />
        <path d="M8 5c0-1 1-2 1-2s1 1 1 2a1 1 0 0 1-2 0Zm4-1c0-1 1-2 1-2s1 1 1 2a1 1 0 0 1-2 0Zm4 1c0-1 1-2 1-2s1 1 1 2a1 1 0 0 1-2 0Z" />
      </>
    ),
    calendar: (
      <>
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M16 3v4M8 3v4M3 10h18M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01" />
      </>
    ),
    check: <path d="m5 12 4 4L19 6" />,
    chevron: <path d="m9 18 6-6-6-6" />,
    difference: (
      <>
        <circle cx="8" cy="8" r="5" />
        <circle cx="16" cy="16" r="5" />
        <path d="M8 5v3l2 1M16 13v3l2 1" />
      </>
    ),
    globe: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
      </>
    ),
    menu: <path d="M4 7h16M4 12h16M4 17h16" />,
    search: (
      <>
        <circle cx="11" cy="11" r="7" />
        <path d="m16.5 16.5 4 4" />
      </>
    ),
    spark: <path d="m12 3 1.4 4.2L18 9l-4.6 1.8L12 15l-1.4-4.2L6 9l4.6-1.8L12 3Zm6 12 .7 2.3L21 18l-2.3.7L18 21l-.7-2.3L15 18l2.3-.7L18 15Z" />,
    timer: (
      <>
        <circle cx="12" cy="13" r="8" />
        <path d="M12 9v4l3 2M9 2h6M12 2v3" />
      </>
    ),
  };

  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths[name] || paths.calendar}
    </svg>
  );
}
