import React, { useMemo } from 'react';
import { Moon } from 'lucide-react';

interface SplashScreenProps {
  isFadingOut: boolean;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ isFadingOut }) => {
  const stars = useMemo(() => {
    const starCount = 25;
    return Array.from({ length: starCount }).map((_, i) => ({
      id: i,
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      size: `${Math.random() * 2 + 1}px`, // Stars from 1px to 3px
      animationDelay: `${Math.random() * 5}s`,
      animationDuration: `${Math.random() * 3 + 2}s`, // Twinkle speed from 2s to 5s
    }));
  }, []);

  return (
    <div
      className={`
        fixed inset-0 z-[100] flex flex-col items-center justify-center
        transition-opacity duration-500 ease-out overflow-hidden
        ${isFadingOut ? 'opacity-0' : 'opacity-100'}
      `}
      style={{ backgroundColor: 'rgb(139, 92, 246)' }}
    >
      {/* Starfield */}
      {stars.map(star => (
        <div
          key={star.id}
          className="absolute rounded-full bg-white"
          style={{
            top: star.top,
            left: star.left,
            width: star.size,
            height: star.size,
            animation: `twinkle ${star.animationDuration} linear infinite`,
            animationDelay: star.animationDelay,
          }}
        />
      ))}

      {/* Moon and Title */}
      <div className="relative text-center z-10">
        <Moon className="w-24 h-24 text-white mb-4 mx-auto" fill="white" />
        <h1
          className="text-9xl font-bold font-handwritten"
          style={{ color: '#ffffff' }}
        >
          BedTales
        </h1>
      </div>
    </div>
  );
};