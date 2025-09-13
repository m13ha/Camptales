export type StoryLayout = 'classic' | 'cinematic' | 'portrait' | 'full-page';
export type AspectRatio = '1:1' | '16:9' | '3:4' | '4:3' | '9:16';

export interface LayoutConfig {
  name: string;
  description: string;
  aspectRatio: AspectRatio;
}

export const storyLayouts: Record<StoryLayout, LayoutConfig> = {
  classic: {
    name: 'Classic',
    description: 'Image and text side-by-side.',
    aspectRatio: '1:1',
  },
  cinematic: {
    name: 'Cinematic',
    description: 'Wide illustration above each paragraph.',
    aspectRatio: '16:9',
  },
  portrait: {
    name: 'Portrait',
    description: 'Tall, vertical image next to the text.',
    aspectRatio: '3:4',
  },
  'full-page': {
    name: 'Full Page',
    description: 'Text overlaid on a full-page illustration.',
    aspectRatio: '3:4',
  }
};