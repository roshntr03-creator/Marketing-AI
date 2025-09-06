import React from 'react';

export const ContentIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="8" height="8" x="3" y="3" rx="1" />
    <path d="M21 3h-8" />
    <path d="M21 7h-8" />
    <path d="M21 11h-8" />
    <path d="M3 13h18" />
    <path d="M3 17h18" />
    <path d="M3 21h18" />
  </svg>
);
