// FIX: Import StoryLayout to use it within this file and re-export for other modules.
import type { StoryLayout } from './layouts';
export type { StoryLayout };

export type AspectRatio = '1:1' | '16:9' | '3:4' | '4:3' | '9:16';

export interface UserPrompt {
  character: string;
  setting: string;
  plot: string;
  concept: string;
}

export interface StoryPart {
  paragraph: string;
  imageUrl?: string; // Made optional to allow storing parts in history without images
  imagePrompt: string;
}

export interface StoryApiResponse {
  title: string;
  story: {
      paragraph: string;
      imagePrompt: string;
  }[];
}

export interface GeneratedStory {
  title:string;
  parts: StoryPart[];
  prompt: UserPrompt;
  layout: StoryLayout;
}

export interface SavedStory extends GeneratedStory {
  id: string;
  createdAt: string;
}

export interface HistoryItem extends GeneratedStory {
  id: string; // A temporary ID for list management
  readAt: string;
}

export interface Character {
  id: string;
  name: string;
  description: string;
  imageUrl?: string;
}
