import React from 'react';

// FIX: Extend div HTML attributes to allow passing props like onPointerDown.
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ children, className = '', onClick, ...props }) => {
  const isClickable = !!onClick;
  
  return (
    <div
      onClick={onClick}
      className={`
        bg-[--card-background] backdrop-blur-sm border border-[--border] 
        rounded-xl shadow-lg p-6
        transition-all duration-300
        ${isClickable ? 'cursor-pointer hover:border-[--primary] hover:shadow-lg hover:shadow-[--primary]/10 hover:-translate-y-1' : ''}
        ${className}
      `}
      // FIX: Spread remaining props to the underlying div element.
      {...props}
    >
      {children}
    </div>
  );
};
