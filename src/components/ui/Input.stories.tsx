import type { Meta, StoryObj } from '@storybook/react';
import { Input } from './Input';

const meta: Meta<typeof Input> = {
  title: 'UI/Input',
  component: Input,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ width: '300px' }}>
        <Story />
      </div>
    ),
  ],
  argTypes: {
    label: { control: 'text' },
    placeholder: { control: 'text' },
    disabled: { control: 'boolean' },
    value: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    id: 'default-input',
    label: 'Your Name',
    placeholder: 'e.g., Jane Doe',
  },
};

export const WithValue: Story = {
  args: {
    id: 'value-input',
    label: 'Your Quest',
    value: 'To seek the Holy Grail',
  },
};

export const Disabled: Story = {
  args: {
    id: 'disabled-input',
    label: 'Disabled Field',
    placeholder: 'You cannot edit this',
    disabled: true,
  },
};