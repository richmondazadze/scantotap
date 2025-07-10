import { supabase } from '@/lib/supabaseClient';
import { toast } from 'sonner';

// Types for custom themes
export interface CustomTheme {
  id: string;
  name: string;
  description: string | null;
  theme_config: any; // Using any to match database Json type
  created_by: string | null;
  is_public: boolean;
  is_premium: boolean;
  usage_count: number;
  created_at: string;
  updated_at: string;
}

export interface ThemeConfig {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
    textSecondary: string;
  };
  typography: {
    fontFamily: string;
    headingWeight: string;
    bodyWeight: string;
  };
  layout: {
    borderRadius: string;
    spacing: 'compact' | 'comfortable' | 'relaxed';
    cardShadow: string;
  };
}

export interface ThemePreset {
  id: string;
  name: string;
  description: string;
  config: ThemeConfig;
  isPremium: boolean;
  preview?: string; // Base64 or URL for preview image
}

class CustomThemeService {
  // Get all available themes (public + user's own themes)
  async getAvailableThemes(profileId?: string): Promise<{ success: boolean; data?: CustomTheme[]; error?: string }> {
    try {
      let query = supabase
        .from('custom_themes')
        .select('*')
        .eq('is_public', true);

      // If user is authenticated, also get their private themes
      if (profileId) {
        const { data: userThemes, error: userError } = await supabase
          .from('custom_themes')
          .select('*')
          .eq('created_by', profileId);

        const { data: publicThemes, error: publicError } = await supabase
          .from('custom_themes')
          .select('*')
          .eq('is_public', true);

        if (publicError || userError) {
          console.error('Error fetching themes:', publicError || userError);
          return { success: false, error: (publicError || userError)?.message };
        }

        // Combine and deduplicate themes
        const allThemes = [...(publicThemes || []), ...(userThemes || [])];
        const uniqueThemes = allThemes.filter((theme, index, self) => 
          index === self.findIndex(t => t.id === theme.id)
        );

        return { success: true, data: uniqueThemes };
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching themes:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data: data || [] };
    } catch (error) {
      console.error('Error fetching themes:', error);
      return { success: false, error: 'Failed to fetch themes' };
    }
  }

  // Get theme presets (built-in themes that users can use as starting points)
  getThemePresets(): ThemePreset[] {
    return [
      {
        id: 'default',
        name: 'SCAN2TAP Default',
        description: 'The classic SCAN2TAP gradient theme',
        isPremium: false,
        config: {
          colors: {
            primary: '#0066CC',
            secondary: '#8B5CF6',
            accent: '#00BFFF',
            background: 'linear-gradient(135deg, #0066CC 0%, #8B5CF6 100%)',
            text: '#FFFFFF',
            textSecondary: '#E6F2FF'
          },
          typography: {
            fontFamily: 'Inter, sans-serif',
            headingWeight: '700',
            bodyWeight: '400'
          },
          layout: {
            borderRadius: '16px',
            spacing: 'comfortable',
            cardShadow: '0 10px 25px rgba(0,102,204,0.2)'
          }
        }
      },
      {
        id: 'minimalist',
        name: 'Minimalist',
        description: 'Clean and simple monochrome design',
        isPremium: false,
        config: {
          colors: {
            primary: '#000000',
            secondary: '#333333',
            accent: '#666666',
            background: 'linear-gradient(135deg, #ffffff 0%, #f5f5f5 100%)',
            text: '#000000',
            textSecondary: '#666666'
          },
          typography: {
            fontFamily: 'Helvetica, sans-serif',
            headingWeight: '300',
            bodyWeight: '300'
          },
          layout: {
            borderRadius: '0px',
            spacing: 'compact',
            cardShadow: 'none'
          }
        }
      },
      {
        id: 'neon',
        name: 'Neon Glow',
        description: 'Vibrant neon colors perfect for creators',
        isPremium: true,
        config: {
          colors: {
            primary: '#00FFFF',
            secondary: '#FF00FF',
            accent: '#FFFF00',
            background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 100%)',
            text: '#00FFFF',
            textSecondary: '#CCCCCC'
          },
          typography: {
            fontFamily: 'Orbitron, monospace',
            headingWeight: '700',
            bodyWeight: '400'
          },
          layout: {
            borderRadius: '8px',
            spacing: 'relaxed',
            cardShadow: '0 0 20px rgba(0,255,255,0.3)'
          }
        }
      },
      {
        id: 'earth',
        name: 'Earth Tones',
        description: 'Warm, natural colors inspired by nature',
        isPremium: true,
        config: {
          colors: {
            primary: '#8B4513',
            secondary: '#D2691E',
            accent: '#CD853F',
            background: 'linear-gradient(135deg, #F4A460 0%, #DEB887 100%)',
            text: '#FFFFFF',
            textSecondary: '#FFF8DC'
          },
          typography: {
            fontFamily: 'Georgia, serif',
            headingWeight: '600',
            bodyWeight: '400'
          },
          layout: {
            borderRadius: '20px',
            spacing: 'comfortable',
            cardShadow: '0 8px 25px rgba(139,69,19,0.3)'
          }
        }
      }
    ];
  }

  // Create a new custom theme
  async createTheme(
    profileId: string,
    name: string,
    description: string,
    themeConfig: any,
    isPublic: boolean = false
  ): Promise<{ success: boolean; data?: CustomTheme; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('custom_themes')
        .insert({
          name,
          description,
          theme_config: themeConfig,
          created_by: profileId,
          is_public: isPublic,
          is_premium: true // Custom themes are Pro feature
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating theme:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Error creating theme:', error);
      return { success: false, error: 'Failed to create theme' };
    }
  }

  // Update an existing theme
  async updateTheme(
    themeId: string,
    updates: Partial<Pick<CustomTheme, 'name' | 'description' | 'theme_config' | 'is_public'>>
  ): Promise<{ success: boolean; data?: CustomTheme; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('custom_themes')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', themeId)
        .select()
        .single();

      if (error) {
        console.error('Error updating theme:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Error updating theme:', error);
      return { success: false, error: 'Failed to update theme' };
    }
  }

  // Delete a theme
  async deleteTheme(themeId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('custom_themes')
        .delete()
        .eq('id', themeId);

      if (error) {
        console.error('Error deleting theme:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Error deleting theme:', error);
      return { success: false, error: 'Failed to delete theme' };
    }
  }

  // Apply theme to user's profile
  async applyThemeToProfile(
    profileId: string,
    themeConfig: any
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          custom_theme: themeConfig,
          updated_at: new Date().toISOString()
        })
        .eq('id', profileId);

      if (error) {
        console.error('Error applying theme to profile:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Error applying theme to profile:', error);
      return { success: false, error: 'Failed to apply theme' };
    }
  }

  // Get theme applied to a profile
  async getProfileTheme(profileId: string): Promise<{ success: boolean; data?: any | null; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('custom_theme')
        .eq('id', profileId)
        .single();

      if (error) {
        console.error('Error fetching profile theme:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data: data?.custom_theme || null };
    } catch (error) {
      console.error('Error fetching profile theme:', error);
      return { success: false, error: 'Failed to fetch profile theme' };
    }
  }

  // Increment usage count for a theme
  async incrementThemeUsage(themeId: string): Promise<{ success: boolean; error?: string }> {
    try {
      // First get current usage count
      const { data: currentTheme, error: fetchError } = await supabase
        .from('custom_themes')
        .select('usage_count')
        .eq('id', themeId)
        .single();

      if (fetchError) {
        console.error('Error fetching current theme:', fetchError);
        return { success: false, error: fetchError.message };
      }

      // Then increment it
      const { error } = await supabase
        .from('custom_themes')
        .update({
          usage_count: (currentTheme?.usage_count || 0) + 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', themeId);

      if (error) {
        console.error('Error incrementing theme usage:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Error incrementing theme usage:', error);
      return { success: false, error: 'Failed to increment theme usage' };
    }
  }

  // Convert theme config to CSS variables
  generateThemeCSS(themeConfig: any): string {
    const { colors, typography, layout } = themeConfig;
    
    return `
      :root {
        /* Colors */
        --theme-primary: ${colors.primary};
        --theme-secondary: ${colors.secondary};
        --theme-accent: ${colors.accent};
        --theme-background: ${colors.background};
        --theme-text: ${colors.text};
        --theme-text-secondary: ${colors.textSecondary};
        
        /* Typography */
        --theme-font-family: ${typography.fontFamily};
        --theme-heading-weight: ${typography.headingWeight};
        --theme-body-weight: ${typography.bodyWeight};
        
        /* Layout */
        --theme-border-radius: ${layout.borderRadius};
        --theme-card-shadow: ${layout.cardShadow};
        --theme-spacing: ${layout.spacing === 'compact' ? '0.5rem' : layout.spacing === 'comfortable' ? '1rem' : '1.5rem'};
      }
      
      .custom-theme-profile {
        background: var(--theme-background);
        color: var(--theme-text);
        font-family: var(--theme-font-family);
        font-weight: var(--theme-body-weight);
      }
      
      .custom-theme-profile h1,
      .custom-theme-profile h2,
      .custom-theme-profile h3 {
        font-weight: var(--theme-heading-weight);
        color: var(--theme-text);
      }
      
      .custom-theme-profile .theme-card {
        background: rgba(255, 255, 255, 0.1);
        border-radius: var(--theme-border-radius);
        box-shadow: var(--theme-card-shadow);
        backdrop-filter: blur(10px);
      }
      
      .custom-theme-profile .theme-button {
        background: var(--theme-primary);
        color: var(--theme-text);
        border-radius: var(--theme-border-radius);
        border: 1px solid var(--theme-accent);
        transition: all 0.3s ease;
      }
      
      .custom-theme-profile .theme-button:hover {
        background: var(--theme-secondary);
        box-shadow: var(--theme-card-shadow);
      }
      
      .custom-theme-profile .theme-text-secondary {
        color: var(--theme-text-secondary);
      }
    `;
  }

  // Validate theme config
  validateThemeConfig(config: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check required color fields
    if (!config.colors) {
      errors.push('Colors configuration is required');
    } else {
      const requiredColors = ['primary', 'secondary', 'accent', 'background', 'text', 'textSecondary'];
      requiredColors.forEach(color => {
        if (!config.colors![color as keyof typeof config.colors]) {
          errors.push(`Color '${color}' is required`);
        }
      });
    }

    // Check typography
    if (!config.typography) {
      errors.push('Typography configuration is required');
    } else {
      if (!config.typography.fontFamily) errors.push('Font family is required');
      if (!config.typography.headingWeight) errors.push('Heading weight is required');
      if (!config.typography.bodyWeight) errors.push('Body weight is required');
    }

    // Check layout
    if (!config.layout) {
      errors.push('Layout configuration is required');
    } else {
      if (!config.layout.borderRadius) errors.push('Border radius is required');
      if (!config.layout.spacing) errors.push('Spacing is required');
      if (!['compact', 'comfortable', 'relaxed'].includes(config.layout.spacing!)) {
        errors.push('Spacing must be compact, comfortable, or relaxed');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Generate theme preview (returns base64 image or CSS for preview)
  generateThemePreview(themeConfig: any): string {
    // Generate a simple HTML preview
    return `
      <div style="
        background: ${themeConfig.colors.background};
        color: ${themeConfig.colors.text};
        font-family: ${themeConfig.typography.fontFamily};
        padding: 20px;
        border-radius: ${themeConfig.layout.borderRadius};
        min-height: 200px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        text-align: center;
      ">
        <h3 style="
          color: ${themeConfig.colors.primary};
          font-weight: ${themeConfig.typography.headingWeight};
          margin: 0 0 10px 0;
        ">John Doe</h3>
        <p style="
          color: ${themeConfig.colors.textSecondary};
          font-weight: ${themeConfig.typography.bodyWeight};
          margin: 0 0 15px 0;
        ">Software Developer</p>
        <div style="
          background: ${themeConfig.colors.primary};
          color: ${themeConfig.colors.text};
          padding: 8px 16px;
          border-radius: ${themeConfig.layout.borderRadius};
          font-size: 14px;
        ">Follow</div>
      </div>
    `;
  }

  // Export theme (for sharing)
  exportTheme(theme: CustomTheme): string {
    return JSON.stringify({
      name: theme.name,
      description: theme.description,
      config: theme.theme_config,
      exportedAt: new Date().toISOString(),
      version: '1.0'
    }, null, 2);
  }

  // Import theme (from exported JSON)
  importTheme(themeJson: string): { success: boolean; theme?: Partial<CustomTheme>; error?: string } {
    try {
      const parsed = JSON.parse(themeJson);
      
      if (!parsed.config) {
        return { success: false, error: 'Invalid theme format: missing config' };
      }

      const validation = this.validateThemeConfig(parsed.config);
      if (!validation.isValid) {
        return { success: false, error: `Invalid theme config: ${validation.errors.join(', ')}` };
      }

      return {
        success: true,
        theme: {
          name: parsed.name || 'Imported Theme',
          description: parsed.description || 'Imported custom theme',
          theme_config: parsed.config,
          is_public: false,
          is_premium: true
        }
      };
    } catch (error) {
      return { success: false, error: 'Invalid JSON format' };
    }
  }
}

// Export singleton instance
export const customThemeService = new CustomThemeService();
export default customThemeService; 