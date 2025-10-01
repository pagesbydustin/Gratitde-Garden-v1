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
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M12 22V12" />
      <path d="M12 12a5 5 0 0 1-5-5c0-2.76 2.24-5 5-5s5 2.24 5 5a5 5 0 0 1-5 5z" />
      <path d="M12 12a5 5 0 0 0-5-5" />
      <path d="M12 12a5 5 0 0 1 5-5" />
    </svg>
  );
}
