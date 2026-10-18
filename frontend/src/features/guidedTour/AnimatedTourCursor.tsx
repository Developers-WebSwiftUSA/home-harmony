type Props = {
  x: number;
  y: number;
  visible: boolean;
};

/** Pointing hand that bobs toward the highlighted control. */
export const AnimatedTourCursor = ({ x, y, visible }: Props) => {
  if (!visible) return null;

  return (
    <div
      className="guided-tour-cursor pointer-events-none fixed z-[10060]"
      style={{ left: x, top: y }}
      aria-hidden
    >
      <div className="guided-tour-cursor-ring" />
      <svg
        width="48"
        height="48"
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative drop-shadow-xl"
      >
        <path
          d="M14 10v22.5c0 1.2.97 2.2 2.2 2.2.45 0 .88-.14 1.24-.4l4.5-3.3 2.55 6.7c.35.9 1.4 1.35 2.3 1L30 37.5c.9-.35 1.35-1.4 1-2.3l-2.4-6.35H34c1.4 0 2.15-1.7 1.2-2.7L18.2 9.4C17.1 8.4 15.4 8.95 14.85 10.3 14.55 10.15 14.3 10.05 14 10z"
          fill="hsl(var(--primary))"
          stroke="white"
          strokeWidth="1.75"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
};
