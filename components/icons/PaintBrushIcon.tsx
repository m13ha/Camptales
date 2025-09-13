import React from 'react';

export const PaintBrushIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
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
        <path d="M18.2 3.8c.6-.6 1.6-.6 2.2 0l1.8 1.8c.6.6.6 1.6 0 2.2L7.2 22.8c-.6.6-1.6.6-2.2 0L3.2 21c-.6-.6-.6-1.6 0-2.2l15-15z"></path>
        <path d="m14 6 6 6"></path>
        <path d="m3 21 8-8"></path>
    </svg>
);