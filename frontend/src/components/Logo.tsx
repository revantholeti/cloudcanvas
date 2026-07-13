interface LogoProps {
  size?: number
  className?: string
}

export function LogoMark({ size = 28, className = '' }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="cc-grad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#818cf8" />
          <stop offset="100%" stopColor="#a855f7" />
        </linearGradient>
      </defs>
      {/* Cloud shape */}
      <path
        d="M24.5 20H9.5C7.0 20 5 18.0 5 15.5C5 13.3 6.6 11.5 8.7 11.1C8.6 10.7 8.5 10.4 8.5 10C8.5 7.5 10.5 5.5 13 5.5C14.1 5.5 15.1 5.9 15.8 6.6C16.6 5.1 18.2 4 20 4C22.8 4 25 6.2 25 9C25 9.2 25.0 9.4 24.9 9.6C26.7 10.3 28 12.0 28 14C28 17.3 26.6 20 24.5 20Z"
        fill="url(#cc-grad)"
        opacity="0.15"
      />
      <path
        d="M24.5 20H9.5C7.0 20 5 18.0 5 15.5C5 13.3 6.6 11.5 8.7 11.1C8.6 10.7 8.5 10.4 8.5 10C8.5 7.5 10.5 5.5 13 5.5C14.1 5.5 15.1 5.9 15.8 6.6C16.6 5.1 18.2 4 20 4C22.8 4 25 6.2 25 9C25 9.2 25.0 9.4 24.9 9.6C26.7 10.3 28 12.0 28 14C28 17.3 26.6 20 24.5 20Z"
        stroke="url(#cc-grad)"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      {/* Diagram nodes */}
      <circle cx="11" cy="25" r="2" fill="url(#cc-grad)" />
      <circle cx="21" cy="25" r="2" fill="url(#cc-grad)" />
      <circle cx="16" cy="22" r="2" fill="url(#cc-grad)" />
      {/* Connecting lines */}
      <line x1="13" y1="24" x2="15" y2="23" stroke="url(#cc-grad)" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="17" y1="23" x2="19" y2="24" stroke="url(#cc-grad)" strokeWidth="1.5" strokeLinecap="round" />
      {/* Drop from cloud to diagram */}
      <line x1="16" y1="20" x2="16" y2="20" stroke="url(#cc-grad)" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

export function LogoFull({ size = 28, className = '' }: LogoProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <LogoMark size={size} />
      <span
        className="font-bold tracking-tight"
        style={{ fontSize: size * 0.65, lineHeight: 1 }}
      >
        CloudCanvas
      </span>
    </div>
  )
}
