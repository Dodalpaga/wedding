// 1 = subtle light leak, 2 = diagonal shadows. Only the selected file is loaded.
export const BACKGROUND_TEXTURE: 1 | 2 = 2;

export const BACKGROUND_TEXTURES = {
  1: { src: '/images/textures/texture1.jpg', blend: 'screen', opacity: 0.1 },
  2: { src: '/images/textures/texture2.png', blend: 'screen', opacity: 1 },
} as const;
