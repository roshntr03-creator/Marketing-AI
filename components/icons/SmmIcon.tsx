import React from 'react';

export const SmmIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 2v4" />
    <path d="M16 2v4" />
    <rect width="18" height="18" x="3" y="4" rx="2" />
    <path d="M3 10h18" />
    <path d="M12 14v4" />
    <path d="M12 14a2 2 0 1 0 4 0" />
    <path d="M12 14a2 2 0 1 1-4 0" />
    <path d="M12 14h.01" />
  </svg>
);
