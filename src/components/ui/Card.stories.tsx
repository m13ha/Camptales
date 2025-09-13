import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Card } from './Card';
import { Logo } from '../Logo';

const meta: Meta<typeof Card> = {
  title: 'UI/Card',
  component: Card,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ width: '350px' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: (
      <div>
        <Logo />
        <p className="mt-4 text-[--text-secondary]">
          This is the content inside a standard card. It's a versatile container for any kind of content.
        </p>
      </div>
    ),
  },
};

export const Clickable: Story = {
  args: {
    children: (
      <div className="text-center">
        <p className="font-bold text-lg">Click Me</p>
        <p className="text-[--text-secondary] text-sm">This card has an onClick handler and shows hover effects.</p>
      </div>
    ),
    onClick: () => alert('Card clicked!'),
  },
};