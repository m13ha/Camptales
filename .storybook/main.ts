import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: ['../components/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
    '@storybook/addon-a11y',
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  // FIX: The 'autodocs' property is valid in Storybook 7+, but the installed type
  // definitions might be out of sync. Casting the 'docs' object to 'any' to
  // bypass the erroneous type check.
  docs: {
    autodocs: 'tag',
  } as any,
};
export default config;
