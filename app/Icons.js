"use client";

// Small self-authored inline SVG icons (no icon font / external dependency
// -- one less thing that can break a Vercel build). Outline style, 18px
// default, inherits currentColor.

function base({ size = 18, className, ...rest }) {
  return {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.75,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    className,
    "aria-hidden": true,
    ...rest,
  };
}

export function IconMail(props) {
  return (
    <svg {...base(props)}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 7l9 6 9-6" />
    </svg>
  );
}

export function IconCopy(props) {
  return (
    <svg {...base(props)}>
      <rect x="9" y="9" width="12" height="12" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

export function IconX(props) {
  return (
    <svg {...base(props)}>
      <path d="M18 6L6 18" />
      <path d="M6 6l12 12" />
    </svg>
  );
}

export function IconMapPin(props) {
  return (
    <svg {...base(props)}>
      <path d="M12 21s7-6.5 7-11.5A7 7 0 0 0 5 9.5C5 14.5 12 21 12 21z" />
      <circle cx="12" cy="9.5" r="2.25" />
    </svg>
  );
}

export function IconRefresh(props) {
  return (
    <svg {...base(props)}>
      <path d="M21 12a9 9 0 1 1-3-6.7" />
      <path d="M21 4v5h-5" />
    </svg>
  );
}

export function IconBulb(props) {
  return (
    <svg {...base(props)}>
      <path d="M9 18h6" />
      <path d="M10 21h4" />
      <path d="M12 3a6 6 0 0 0-3.5 10.9c.6.45 1 1.2 1 2.1h5c0-.9.4-1.65 1-2.1A6 6 0 0 0 12 3z" />
    </svg>
  );
}

export function IconMotorcycle(props) {
  return (
    <svg {...base(props)}>
      <circle cx="6.5" cy="17" r="2.75" />
      <circle cx="17.5" cy="17" r="2.75" />
      <path d="M8.5 17h6.5l-1.8-6.2H9.8" />
      <path d="M12.8 10.8L15.5 6h3.2" />
      <path d="M4.5 12.5h3.2" />
      <path d="M15.2 6h2.4c.7 0 1.2.4 1.4 1l.6 2" />
    </svg>
  );
}

export function IconHeartPulse(props) {
  return (
    <svg {...base(props)}>
      <path d="M19.5 13.2C21 11.8 22.5 10 22.5 8a4.5 4.5 0 0 0-8.2-2.5L12 7.8l-2.3-2.3A4.5 4.5 0 0 0 1.5 8c0 2 1.5 3.8 3 5.2L12 21z" />
      <path d="M4.8 12.5H8l1.4-2.2 2.2 4.4 1.4-2.2h3.4" />
    </svg>
  );
}

export function IconMedicalCross(props) {
  return (
    <svg {...base(props)}>
      <rect x="9" y="3" width="6" height="18" rx="1.5" />
      <rect x="3" y="9" width="18" height="6" rx="1.5" />
    </svg>
  );
}
