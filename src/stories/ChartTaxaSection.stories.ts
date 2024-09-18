import type { Meta, StoryObj } from "@storybook/react";
import { ChartTaxaSection } from "../components/Charts";
import { taxa } from "../fixtures";

const meta = {
  title: "ChartTaxaSection",
  component: ChartTaxaSection,
} satisfies Meta<typeof ChartTaxaSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    placeId: 674,
    taxon: {
      taxon: taxa.treeOfHeaven,
      count: 1,
    },
  },
};
