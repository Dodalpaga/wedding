// Historical texture settings, superseded by solar-rays.ts. No longer loaded.
export const BACKGROUND_TEXTURE: 1 | 2 = 2;

export const BACKGROUND_TEXTURES = {
  1: { src: '/images/textures/texture1.jpg', blend: 'screen', opacity: 0.1 },
  2: { src: '/images/textures/texture2.png', blend: 'screen', opacity: 1 },
} as const;
