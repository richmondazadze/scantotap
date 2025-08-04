import { supabase } from '@/lib/supabaseClient';

export interface Wallpaper {
  id: string;
  name: string;
  filename: string;
  description: string;
  category: string;
  url: string;
  isPro: boolean;
}

// Available wallpapers from /public/walls/ directory
export const AVAILABLE_WALLPAPERS: Wallpaper[] = [
  {
    id: 'navy_geom',
    name: 'Deep Navy Pattern',
    filename: 'navy_geom.webp',
    description: 'Professional navy blue geometric design',
    category: 'geometric',
    url: '/walls/navy_geom.webp',
    isPro: true
  },
  {
    id: 'orange_geom',
    name: 'Sunset Orange',
    filename: 'orange_geom.webp',
    description: 'Warm orange geometric background',
    category: 'geometric',
    url: '/walls/orange_geom.webp',
    isPro: false
  },
  {
    id: 'orange_green_geom',
    name: 'Tropical Blend',
    filename: 'orange_green_geom.webp',
    description: 'Dynamic orange and green geometric mix',
    category: 'geometric',
    url: '/walls/orange_green_geom.webp',
    isPro: true
  },
  {
    id: 'white_dia_geom',
    name: 'Crystal Diamond',
    filename: 'white_dia-geom.webp',
    description: 'Clean white diamond geometric pattern',
    category: 'geometric',
    url: '/walls/white_dia-geom.webp',
    isPro: false
  },
  {
    id: 'white_scribble',
    name: 'Artistic Flow',
    filename: 'white_scribble.webp',
    description: 'Creative white scribble artwork',
    category: 'artistic',
    url: '/walls/white_scribble.webp',
    isPro: true
  }
];

export class WallpaperService {
  /**
   * Get all available wallpapers
   */
  static async getAvailableWallpapers(): Promise<Wallpaper[]> {
    return AVAILABLE_WALLPAPERS;
  }

  /**
   * Get wallpaper by ID
   */
  static async getWallpaperById(id: string): Promise<Wallpaper | null> {
    return AVAILABLE_WALLPAPERS.find(wallpaper => wallpaper.id === id) || null;
  }

  /**
   * Update user's wallpaper preference
   */
  static async updateWallpaperPreference(
    profileId: string, 
    wallpaperId: string | null
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const wallpaperPath = wallpaperId 
        ? `/walls/${AVAILABLE_WALLPAPERS.find(w => w.id === wallpaperId)?.filename}`
        : null;

      const { error } = await supabase
        .from('profiles')
        .update({ wallpaper_preference: wallpaperPath })
        .eq('id', profileId);

      if (error) {
        console.error('Error updating wallpaper preference:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (err) {
      console.error('Error updating wallpaper preference:', err);
      return { success: false, error: 'Failed to update wallpaper preference' };
    }
  }

  /**
   * Get user's current wallpaper preference
   */
  static async getWallpaperPreference(profileId: string): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('wallpaper_preference')
        .eq('id', profileId)
        .single();

      if (error) {
        console.error('Error fetching wallpaper preference:', error);
        return null;
      }

      return data?.wallpaper_preference || null;
    } catch (err) {
      console.error('Error fetching wallpaper preference:', err);
      return null;
    }
  }

  /**
   * Validate wallpaper file exists
   */
  static async validateWallpaperFile(filename: string): Promise<boolean> {
    try {
      const response = await fetch(`/walls/${filename}`);
      return response.ok;
    } catch (err) {
      console.error('Error validating wallpaper file:', err);
      return false;
    }
  }

  /**
   * Get wallpaper URL by ID
   */
  static getWallpaperUrl(wallpaperId: string): string | null {
    const wallpaper = AVAILABLE_WALLPAPERS.find(w => w.id === wallpaperId);
    return wallpaper ? wallpaper.url : null;
  }

  /**
   * Get wallpaper by filename
   */
  static getWallpaperByFilename(filename: string): Wallpaper | null {
    return AVAILABLE_WALLPAPERS.find(w => w.filename === filename) || null;
  }

  /**
   * Get wallpapers by category
   */
  static getWallpapersByCategory(category: string): Wallpaper[] {
    return AVAILABLE_WALLPAPERS.filter(w => w.category === category);
  }

  /**
   * Get all wallpaper categories
   */
  static getWallpaperCategories(): string[] {
    return [...new Set(AVAILABLE_WALLPAPERS.map(w => w.category))];
  }
} 