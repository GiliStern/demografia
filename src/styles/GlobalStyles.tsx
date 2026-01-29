import { css } from "@linaria/core";

export const globalStyles = css`
  :global() {
    :root {
      font-family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif;
      line-height: 1.5;
      font-weight: 400;

      color-scheme: light dark;
      color: rgba(255, 255, 255, 0.87);
      background-color: #242424;

      font-synthesis: none;
      text-rendering: optimizeLegibility;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      -webkit-text-size-adjust: 100%;
    }

    html {
      overflow: hidden;
      height: 100%;
      width: 100%;
    }

    body {
      margin: 0;
      overflow: hidden;
      height: 100%;
      width: 100%;
      position: fixed;
      -webkit-overflow-scrolling: touch;
    }

    #root {
      margin: 0;
      text-align: center;
      display: flex;
      align-items: center;
      justify-content: center;
      min-width: 320px;
      min-height: 100vh;
      height: 100vh;
      width: 100vw;
      overflow: hidden;
    }

    #root * {
      font-family: "Playpen Sans Hebrew", cursive;
    }
  }
`;
