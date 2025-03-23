import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'AllergyGuard',
    short_name: 'AllergyGuard',
    description:
      "AllergyGuard is a mobile web-based app that helps manage children's food allergies. It centralizes allergy profiles, detects allergens in real time, plans safe meals, and supports emergency care using AI.",
    start_url: '/',
    display: 'standalone',
    theme_color: '#8936FF',
    background_color: '#2EC6FE',
    orientation: 'any',
    dir: 'auto',
    lang: 'en-US',
    scope: '/',
    id: 'allergy-guard',
    icons: [
      {
        purpose: 'maskable',
        sizes: '512x512',
        src: '/icon512_maskable.png',
        type: 'image/png',
      },
      { purpose: 'any', sizes: '512x512', src: '/icon512_rounded.png', type: 'image/png' },
    ],
  };
}
