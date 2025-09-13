import React from 'react';
import type { GeneratedStory } from '../types';
import { Card } from './ui/Card';
import { useSettings } from '../contexts/SettingsContext';

interface StoryDisplayProps {
  story: GeneratedStory;
  isSpeaking?: boolean;
  currentSpeechIndex?: number;
}

export const StoryDisplay: React.FC<StoryDisplayProps> = ({ story, isSpeaking = false, currentSpeechIndex = -1 }) => {
  const { fontStyle } = useSettings();
  const layout = story.layout || 'classic';

  const getPartCard = (part: any, index: number) => {
    const isHighlighted = isSpeaking && currentSpeechIndex === index;

    switch (layout) {
      case 'cinematic':
        return (
          <Card key={index} className={`${isHighlighted ? 'border-[--primary] shadow-lg shadow-[--primary]/20 scale-105' : ''}`}>
            <img 
              src={part.imageUrl} 
              alt={`Illustration for story part ${index + 1}`} 
              className="rounded-lg w-full h-auto object-cover aspect-[16/9] shadow-lg border-2 border-[--border] mb-4"
            />
            <p className="text-lg leading-relaxed text-[--text-secondary]">
              {part.paragraph}
            </p>
          </Card>
        );

      case 'portrait':
        return (
           <Card 
            key={index} 
            className={`
              flex flex-col md:flex-row gap-6 items-center 
              ${index % 2 === 1 ? 'md:flex-row-reverse' : ''}
              ${isHighlighted ? 'border-[--primary] shadow-lg shadow-[--primary]/20 scale-105' : ''}
            `}
          >
            <div className="md:w-1/3 flex-shrink-0">
              <img 
                src={part.imageUrl} 
                alt={`Illustration for story part ${index + 1}`} 
                className="rounded-lg w-full h-auto object-cover aspect-[3/4] shadow-lg border-2 border-[--border] hover:border-[--primary] transition-colors"
              />
            </div>
            <div className="md:w-2/3">
              <p className="text-lg leading-relaxed text-[--text-secondary]">
                {part.paragraph}
              </p>
            </div>
          </Card>
        );

      case 'full-page':
        return (
          <Card 
            key={index} 
            className={`
              relative min-h-[80vh] flex items-end justify-center p-0 overflow-hidden
              ${isHighlighted ? 'border-[--primary] shadow-lg shadow-[--primary]/20 scale-105' : ''}
            `}
          >
            <img 
              src={part.imageUrl} 
              alt={`Illustration for story part ${index + 1}`} 
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent"></div>
            <div className="relative z-10 p-6 text-center">
              <p className="text-lg leading-relaxed text-white drop-shadow-md">
                {part.paragraph}
              </p>
            </div>
          </Card>
        );

      case 'classic':
      default:
        return (
          <Card 
            key={index} 
            className={`
              flex flex-col md:flex-row gap-6 items-center 
              ${index % 2 === 1 ? 'md:flex-row-reverse' : ''}
              ${isHighlighted ? 'border-[--primary] shadow-lg shadow-[--primary]/20 scale-105' : ''}
            `}
          >
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
        );
    }
  };

  return (
    <div className="mt-10">
      <div className="text-center mb-8">
          <h2 className={`text-3xl font-bold text-[--text-primary] ${fontStyle === 'Serif' ? 'font-serif' : 'font-sans'}`}>
            {story.title}
          </h2>
      </div>
      <div className="space-y-12">
        {story.parts.map((part, index) => getPartCard(part, index))}
      </div>
    </div>
  );
};