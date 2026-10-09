import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
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

};

export default config;
