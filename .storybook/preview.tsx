import React, { useEffect } from 'react';
import type { Preview, Decorator } from '@storybook/react';
import { SettingsProvider, useSettings } from '../src/contexts/SettingsContext';
import { themes, fonts, fontSizes } from '../src/themes';

// Wrapper to apply dynamic theme variables from SettingsContext
const ThemeWrapper = ({ children }: { children: React.ReactNode }) => {
  const { theme, fontStyle, fontSize } = useSettings();

  useEffect(() => {
    const root = document.documentElement;
    
    // Apply colors
    for (const [key, value] of Object.entries(theme.colors)) {
      root.style.setProperty(key, value);
    }

    // Apply font family and size
    root.style.setProperty('--font-family', fonts[fontStyle]);
    root.style.setProperty('--font-size-base', fontSizes[fontSize]);
    
    // Set body styles to match the app
    document.body.style.backgroundColor = 'var(--background)';
    document.body.style.color = 'var(--text-primary)';
    document.body.style.fontFamily = 'var(--font-family)';

  }, [theme, fontStyle, fontSize]);

  return <>{children}</>;
};

const withSettings: Decorator = (Story) => (
  <SettingsProvider>
    <ThemeWrapper>
      <Story />
    </ThemeWrapper>
  </SettingsProvider>
);

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
  decorators: [withSettings],
};

export default preview;
