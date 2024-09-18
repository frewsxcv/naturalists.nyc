import type { Meta, StoryObj } from "@storybook/react";
import { Charts } from "../components/Charts";

const meta = {
  title: "Charts",
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
