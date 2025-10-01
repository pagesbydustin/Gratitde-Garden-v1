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
      <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2z" />
      <path d="M12.5 13.062V16h-1v-2.938A4.528 4.528 0 0 1 8 8.5a4.5 4.5 0 0 1 4.5-4.5 4.5 4.5 0 0 1 3.5 7.062" />
      <path d="M12 16v-4" />
      <path d="M12 8h.01" />
    </svg>
  );
}
