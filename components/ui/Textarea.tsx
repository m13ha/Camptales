import React from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  id: string;
}

export const Textarea: React.FC<TextareaProps> = ({ label, id, className = '', ...props }) => {
  return (
    <div>
      <label htmlFor={id} className="block mb-2 text-sm font-medium text-[--text-secondary]">
        {label}
      </label>
      <textarea
        id={id}
        className={`
          w-[90%] px-4 py-2 bg-[--input-background] border-2 border-[--border] rounded-lg
          text-[--text-primary] placeholder-[--text-secondary]
          transition duration-200 ease-in-out
          focus:outline-none focus:ring-2 focus:ring-[--primary] focus:border-[--primary]
          disabled:bg-gray-700 disabled:cursor-not-allowed
          ${className}
        `}
        {...props}
      ></textarea>
    </div>
  );
};