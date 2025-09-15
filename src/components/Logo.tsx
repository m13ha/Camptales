import React from 'react';
import { Moon } from 'lucide-react';

export const Logo: React.FC = () => {
    return (
        <div className="flex items-center justify-start gap-3">
          <div className="w-10 h-10 bg-[--primary] rounded-full flex items-center justify-center">
            <Moon className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-[--text-primary]">
            BedTales
          </h1>
        </div>
    );
};