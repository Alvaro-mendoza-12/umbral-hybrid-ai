interface UmbralMarkProps {
  size?: number;
  className?: string;
}

export function UmbralMark({ size = 40, className }: UmbralMarkProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 48 48"
      width={size}
      height={size}
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <rect width="48" height="48" rx="12" fill="#0F4C3A" />
      <path
        d="M14 36V21a10 10 0 0 1 20 0v15"
        stroke="#F6F7F5"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M19 36V22a5 5 0 0 1 10 0v14"
        stroke="#D9ED6F"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <path
        d="M10 36h28"
        stroke="#F6F7F5"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <circle cx="24" cy="21" r="2.75" fill="#D9ED6F" />
    </svg>
  );
}
