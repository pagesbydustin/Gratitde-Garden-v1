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

export function HeroTreeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M50 90V40" />
      <path d="M50 40C40 40 35 30 35 25c0-8.28 6.72-15 15-15s15 6.72 15 15c0 5-5 15-15 15z" />
      <path d="M50 55c-7.5 0-12.5-7.5-12.5-15" />
      <path d="M50 55c7.5 0 12.5-7.5 12.5-15" />
      <path d="M42 65c-5 0-8-5-8-10" />
      <path d="M58 65c5 0 8-5 8-10" />
      <path d="M35 75c-4 0-6-4-6-8" />
      <path d="M65 75c4 0 6-4 6-8" />
    </svg>
  );
}
