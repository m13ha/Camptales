import React from 'react';
import type { GeneratedStory } from '../types';
import { Card } from './ui/Card';
import { useSettings } from '../contexts/SettingsContext';

interface StoryDisplayProps {
  story: GeneratedStory;
}

export const StoryDisplay: React.FC<StoryDisplayProps> = ({ story }) => {
  const { fontStyle } = useSettings();

  return (
    <div className="mt-10">
      <div className="text-center mb-8">
          <h2 className={`text-3xl font-bold text-[--text-primary] ${fontStyle === 'Serif' ? 'font-serif' : 'font-sans'}`}>
            {story.title}
          </h2>
      </div>

      <div className="space-y-12">
        {story.parts.map((part, index) => (
          <Card key={index} className={`flex flex-col md:flex-row gap-6 items-center ${index % 2 === 1 ? 'md:flex-row-reverse' : ''}`}>
            <div className="md:w-1/2 flex-shrink-0">
              <img 
                src={part.imageUrl} 
                alt={`Illustration for story part ${index + 1}`} 
                className="rounded-lg w-full h-auto object-cover aspect-square shadow-lg border-2 border-[--border] hover:border-[--primary] transition-colors"
              />
            </div>
            <div className="md:w-1/2">
              <p className="text-lg leading-relaxed text-[--text-secondary]">
                {part.paragraph}
              </p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};