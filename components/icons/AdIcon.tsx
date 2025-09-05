
import React from 'react';

export const AdIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="14" x="2" y="3" rx="2" />
    <path d="M6 15v-2" />
    <path d="M10 15v-4" />
    <path d="M14 15v-6" />
    <path d="M18 15v-8" />
    <path d="M2 21h20" />
  </svg>
);