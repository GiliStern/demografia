import type { Preview } from "@storybook/react";
import "./preview.css";

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
      expanded: true,
    },
    backgrounds: {
      default: "dark",
      values: [
        {
          name: "dark",
          value: "#1a1a1a",
        },
        {
          name: "light",
          value: "#ffffff",
        },
      ],
    },
  },
};

export default preview;

