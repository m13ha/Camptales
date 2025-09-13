import React from 'react';

export const EarIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg 
        {...props}
        xmlns="http://www.w3.org/2000/svg" 
        width="24" 
        height="24" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
    >
        <path d="M6 8.5a6.5 6.5 0 1 1 13 0c0 6-6.5 11.5-6.5 11.5S6 14.5 6 8.5Z"></path>
        <path d="M14.5 9a2.5 2.5 0 0 1-5 0"></path>
    </svg>
);