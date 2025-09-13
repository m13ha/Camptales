import React from 'react';

interface TopbarProps {
  title: string;
}

export const Topbar: React.FC<TopbarProps> = ({ title }) => {
  return (
    <header className="sticky top-0 h-16 bg-[--background]/80 backdrop-blur-sm border-b border-[--border] z-40 flex items-center flex-shrink-0">
        <div className="w-full max-w-5xl px-3">
            <h1 className="text-2xl font-bold text-[--text-primary] text-center md:text-left">
                {title}
            </h1>
        </div>
    </header>
  );
};