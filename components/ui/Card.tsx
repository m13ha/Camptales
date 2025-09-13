import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({ children, className = '', onClick }) => {
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
    >
      {children}
    </div>
  );
};