import React from 'react';
import { ArrowLeft } from 'lucide-react';

interface TopbarProps {
  title: string;
  showBackButton?: boolean;
  onBack?: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ title, showBackButton = false, onBack }) => {
  return (
    <header className="sticky top-0 h-16 bg-[--background]/80 backdrop-blur-sm border-b border-[--border] z-40 flex items-center flex-shrink-0">
        <div className="w-full max-w-5xl mx-auto px-4 md:px-6 lg:px-8 flex items-center relative h-full">
            {showBackButton && (
                <button 
                    onClick={onBack} 
                    className="absolute left-4 md:left-6 lg:left-8 p-2 rounded-full hover:bg-white/10 transition-colors"
                    aria-label="Go back"
                >
                    <ArrowLeft className="w-6 h-6" />
                </button>
            )}
            <h1 className="text-2xl font-bold text-[--text-primary] text-center w-full">
                {title}
            </h1>
        </div>
    </header>
  );
};