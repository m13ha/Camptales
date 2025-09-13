export interface UserPrompt {
  character: string;
  setting: string;
  plot: string;
  concept: string;
}

export interface StoryPart {
  paragraph: string;
  imageUrl: string;
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
  title: string;
  parts: StoryPart[];
  prompt: UserPrompt;
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