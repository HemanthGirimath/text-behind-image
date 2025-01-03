export interface PlatformPreset {
  id: string;
  name: string;
  width: number;
  height: number;
  description?: string;
}

export interface Platform {
  name: string;
  presets: PlatformPreset[];
}

export const platformPresets: PlatformPreset[] = [
  {
    id: 'instagram-square',
    name: 'Instagram Square',
    width: 1080,
    height: 1080,
    description: 'Perfect for Instagram feed posts'
  },
  {
    id: 'instagram-portrait',
    name: 'Instagram Portrait',
    width: 1080,
    height: 1350,
    description: 'Optimal for Instagram portrait posts'
  },
  {
    id: 'instagram-landscape',
    name: 'Instagram Landscape',
    width: 1080,
    height: 608,
    description: 'Best for Instagram landscape posts'
  },
  {
    id: 'youtube-thumbnail',
    name: 'YouTube Thumbnail',
    width: 1280,
    height: 720,
    description: 'Standard YouTube thumbnail size'
  },
  {
    id: 'youtube-banner',
    name: 'YouTube Banner',
    width: 2560,
    height: 1440,
    description: 'YouTube channel banner size'
  }
];
