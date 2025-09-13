import React from 'react';
import { ChevronDownIcon } from '../icons/ChevronDownIcon';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  id: string;
  containerClassName?: string;
}

export const Select: React.FC<SelectProps> = ({ label, id, className = '', containerClassName = '', children, ...props }) => {
  return (
    <div className={containerClassName}>
      {label && (
        <label htmlFor={id} className="block mb-2 text-sm font-medium text-[--text-secondary]">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          id={id}
          className={`
            w-full appearance-none px-4 py-2.5 bg-[--input-background] border-2 border-[--border] rounded-lg
            text-[--text-primary]
            transition duration-200 ease-in-out
            focus:outline-none focus:ring-2 focus:ring-[--primary] focus:border-[--primary]
            disabled:bg-gray-700 disabled:cursor-not-allowed
            pr-10 /* Make space for the icon */
            ${className}
          `}
          {...props}
        >
          {children}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-[--text-secondary]">
          <ChevronDownIcon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
};