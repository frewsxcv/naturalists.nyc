import type { Meta, StoryObj } from '@storybook/react';
import { Charts } from '../components/charts';

const meta = {
  title: 'Charts',
  component: Charts,
} satisfies Meta<typeof Charts>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    placeId: 674,
    filter: undefined,
  },
};

/*
export const Secondary: Story = {
  args: {
    label: 'Button',
  },
};

export const Large: Story = {
  args: {
    size: 'large',
    label: 'Button',
  },
};

export const Small: Story = {
  args: {
    size: 'small',
    label: 'Button',
  },
};
*/
