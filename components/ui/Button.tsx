import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'danger';
}

export const Button: React.FC<ButtonProps> = ({ children, className = '', size = 'md', variant = 'primary', ...props }) => {
  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-2.5 text-base',
    lg: 'px-8 py-3 text-lg',
  };

  const variantClasses = {
    primary: 'bg-[--primary] text-[--primary-text] hover:bg-[--primary-hover] focus:ring-[--primary]',
    danger: 'bg-[--danger] text-white hover:bg-[--danger-hover] focus:ring-[--danger]',
  }

  return (
    <button
      className={`
        inline-flex items-center justify-center font-semibold rounded-full shadow-lg
        transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2
        focus:ring-offset-[--background]
        disabled:bg-gray-500 disabled:cursor-not-allowed disabled:shadow-none
        transform hover:scale-105 active:scale-100
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
};