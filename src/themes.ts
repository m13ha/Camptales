export interface Theme {
  name: string;
  mode: 'dark' | 'light';
  colors: {
    '--background': string;
    '--text-primary': string;
    '--text-secondary': string;
    '--primary': string;
    '--primary-hover': string;
    '--primary-text': string;
    '--card-background': string;
    '--border': string;
    '--input-background': string;
    '--gradient-from': string;
    '--gradient-to': string;
    '--danger': string;
    '--danger-hover': string;
  };
}

export const themes: Record<string, Theme> = {
  cosmicNight: {
    name: 'Cosmic Night',
    mode: 'dark',
    colors: {
      '--background': '#0c0a1a',
      '--text-primary': '#e0e0e0',
      '--text-secondary': '#a0aec0',
      '--primary': '#8B5CF6',
      '--primary-hover': '#7C3AED',
      '--primary-text': '#ffffff',
      '--card-background': 'rgba(23, 25, 48, 0.5)',
      '--border': '#2d3748',
      '--input-background': 'rgba(15, 17, 38, 0.5)',
      '--gradient-from': '#8B5CF6',
      '--gradient-to': '#4f46e5',
      '--danger': '#e53e3e',
      '--danger-hover': '#c53030',
    },
  },
  starlight: {
    name: 'Starlight',
    mode: 'dark',
    colors: {
      '--background': '#1A202C',
      '--text-primary': '#EDF2F7',
      '--text-secondary': '#A0AEC0',
      '--primary': '#3182CE',
      '--primary-hover': '#2B6CB0',
      '--primary-text': '#ffffff',
      '--card-background': 'rgba(45, 55, 72, 0.5)',
      '--border': '#4A5568',
      '--input-background': 'rgba(26, 32, 44, 0.5)',
      '--gradient-from': '#3182CE',
      '--gradient-to': '#2C5282',
      '--danger': '#e53e3e',
      '--danger-hover': '#c53030',
    }
  },
  daydream: {
    name: 'Daydream',
    mode: 'light',
    colors: {
      '--background': '#F7FAFC',
      '--text-primary': '#2D3748',
      '--text-secondary': '#718096',
      '--primary': '#9F7AEA',
      '--primary-hover': '#805AD5',
      '--primary-text': '#ffffff',
      '--card-background': 'rgba(255, 255, 255, 0.7)',
      '--border': '#E2E8F0',
      '--input-background': 'rgba(255, 255, 255, 0.5)',
      '--gradient-from': '#9F7AEA',
      '--gradient-to': '#6B46C1',
      '--danger': '#e53e3e',
      '--danger-hover': '#c53030',
    }
  },
  storybook: {
    name: 'Storybook',
    mode: 'light',
    colors: {
      '--background': '#FFFAF0',
      '--text-primary': '#4A5568',
      '--text-secondary': '#718096',
      '--primary': '#4299E1',
      '--primary-hover': '#3182CE',
      '--primary-text': '#ffffff',
      '--card-background': 'rgba(255, 255, 255, 0.8)',
      '--border': '#CBD5E0',
      '--input-background': '#FFFFFF',
      '--gradient-from': '#4299E1',
      '--gradient-to': '#3182CE',
      '--danger': '#e53e3e',
      '--danger-hover': '#c53030',
    }
  }
};

export const fonts: Record<string, string> = {
  'Sans Serif': '"Inter", sans-serif',
  'Serif': '"Lora", serif',
  'Playful': '"Comic Neue", cursive',
};

export const fontSizes: Record<string, string> = {
  'Small': '12px',
  'Medium': '14px',
  'Large': '16px',
};