import type { SVGProps } from 'react';

export function GratitudeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
      <path d="M8.5 12a5.93 5.93 0 0 0 4-8.5" />
      <path d="M15.5 12a5.93 5.93 0 0 1-4 8.5" />
      <path d="M12 15.5a5.93 5.93 0 0 0 0-7" />
    </svg>
  );
}
