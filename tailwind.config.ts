import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Existing white and pale-neutral utilities share the site's warm paper.
        white: '#ffffff',
        paper: '#fff8df',
        canvas: '#eeeadd',
        gray: { 50: '#fff8df', 100: '#eeeadd', 200: '#dedbcc' },
        slate: { 50: '#fff8df', 100: '#eeeadd', 200: '#dedbcc' },
      },
    },
  },

  plugins: [
    // add plugin usage later if needed
  ],
};

export default config;
