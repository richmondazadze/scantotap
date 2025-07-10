// Social URL Parser Utility
// Handles extraction of usernames from full URLs and smart URL construction

export interface SocialPlatform {
  label: string;
  domains: string[];
  patterns: RegExp[];
  urlTemplate: string;
  usernamePrefix?: string;
}

// Platform configurations with URL patterns
export const SOCIAL_PLATFORMS: Record<string, SocialPlatform> = {
  instagram: {
    label: 'Instagram',
    domains: ['instagram.com', 'instagr.am'],
    patterns: [
      /(?:instagram\.com|instagr\.am)\/([^\/\?\s]+)/i,
      /^@?([a-zA-Z0-9._]+)$/
    ],
    urlTemplate: 'https://instagram.com/{username}',
  },
  x: {
    label: 'X',
    domains: ['x.com', 'twitter.com'],
    patterns: [
      /(?:x\.com|twitter\.com)\/([^\/\?\s]+)/i,
      /^@?([a-zA-Z0-9_]+)$/
    ],
    urlTemplate: 'https://x.com/{username}',
  },
  tiktok: {
    label: 'TikTok',
    domains: ['tiktok.com'],
    patterns: [
      /tiktok\.com\/@([^\/\?\s]+)/i,
      /tiktok\.com\/([^\/\?\s]+)/i,
      /^@?([a-zA-Z0-9._]+)$/
    ],
    urlTemplate: 'https://tiktok.com/@{username}',
    usernamePrefix: '@'
  },
  youtube: {
    label: 'YouTube',
    domains: ['youtube.com', 'youtu.be'],
    patterns: [
      /youtube\.com\/@([^\/\?\s]+)/i,
      /youtube\.com\/c\/([^\/\?\s]+)/i,
      /youtube\.com\/channel\/([^\/\?\s]+)/i,
      /youtube\.com\/user\/([^\/\?\s]+)/i,
      /youtu\.be\/([^\/\?\s]+)/i,
      /^@?([a-zA-Z0-9._-]+)$/
    ],
    urlTemplate: 'https://youtube.com/@{username}',
    usernamePrefix: '@'
  },
  linkedin: {
    label: 'LinkedIn',
    domains: ['linkedin.com'],
    patterns: [
      /linkedin\.com\/in\/([^\/\?\s]+)/i,
      /linkedin\.com\/company\/([^\/\?\s]+)/i,
      /^([a-zA-Z0-9-]+)$/
    ],
    urlTemplate: 'https://linkedin.com/in/{username}',
  },
  facebook: {
    label: 'Facebook',
    domains: ['facebook.com', 'fb.com'],
    patterns: [
      /(?:facebook\.com|fb\.com)\/([^\/\?\s]+)/i,
      /^([a-zA-Z0-9.]+)$/
    ],
    urlTemplate: 'https://facebook.com/{username}',
  },
  snapchat: {
    label: 'Snapchat',
    domains: ['snapchat.com'],
    patterns: [
      /snapchat\.com\/add\/([^\/\?\s]+)/i,
      /snapchat\.com\/([^\/\?\s]+)/i,
      /^([a-zA-Z0-9._-]+)$/
    ],
    urlTemplate: 'https://snapchat.com/add/{username}',
  },
  whatsapp: {
    label: 'WhatsApp',
    domains: ['wa.me', 'whatsapp.com'],
    patterns: [
      /wa\.me\/([^\/\?\s]+)/i,
      /whatsapp\.com\/([^\/\?\s]+)/i,
      /^(\+?[0-9]+)$/
    ],
    urlTemplate: 'https://wa.me/{username}',
  },
  spotify: {
    label: 'Spotify',
    domains: ['open.spotify.com', 'spotify.com'],
    patterns: [
      /open\.spotify\.com\/user\/([^\/\?\s]+)/i,
      /spotify\.com\/user\/([^\/\?\s]+)/i,
      /^([a-zA-Z0-9._-]+)$/
    ],
    urlTemplate: 'https://open.spotify.com/user/{username}',
  },
  twitch: {
    label: 'Twitch',
    domains: ['twitch.tv'],
    patterns: [
      /twitch\.tv\/([^\/\?\s]+)/i,
      /^([a-zA-Z0-9_]+)$/
    ],
    urlTemplate: 'https://twitch.tv/{username}',
  },
  pinterest: {
    label: 'Pinterest',
    domains: ['pinterest.com'],
    patterns: [
      /pinterest\.com\/([^\/\?\s]+)/i,
      /^([a-zA-Z0-9._-]+)$/
    ],
    urlTemplate: 'https://pinterest.com/{username}',
  },
  telegram: {
    label: 'Telegram',
    domains: ['t.me', 'telegram.me'],
    patterns: [
      /(?:t\.me|telegram\.me)\/([^\/\?\s]+)/i,
      /^@?([a-zA-Z0-9_]+)$/
    ],
    urlTemplate: 'https://t.me/{username}',
    usernamePrefix: '@'
  },
  discord: {
    label: 'Discord',
    domains: ['discord.gg', 'discord.com'],
    patterns: [
      /discord\.gg\/([^\/\?\s]+)/i,
      /discord\.com\/invite\/([^\/\?\s]+)/i,
      /discord\.com\/users\/([^\/\?\s]+)/i,
      /^([a-zA-Z0-9._-]+)$/
    ],
    urlTemplate: 'https://discord.gg/{username}',
  },
  threads: {
    label: 'Threads',
    domains: ['threads.net'],
    patterns: [
      /threads\.net\/@([^\/\?\s]+)/i,
      /threads\.net\/([^\/\?\s]+)/i,
      /^@?([a-zA-Z0-9._]+)$/
    ],
    urlTemplate: 'https://threads.net/@{username}',
    usernamePrefix: '@'
  }
};

/**
 * Extract username from a social media URL or input
 */
export function extractUsername(input: string, platformKey: string): string {
  if (!input || !platformKey) return '';
  
  const platform = SOCIAL_PLATFORMS[platformKey.toLowerCase()];
  if (!platform) return input;
  
  const cleanInput = input.trim();
  
  // Try each pattern for the platform
  for (const pattern of platform.patterns) {
    const match = cleanInput.match(pattern);
    if (match && match[1]) {
      return match[1].replace(/^@/, ''); // Remove @ prefix if present
    }
  }
  
  // If no pattern matches, return the original input cleaned
  return cleanInput.replace(/^@/, '');
}

/**
 * Generate a proper social media URL from username and platform
 */
export function generateSocialUrl(username: string, platformKey: string): string {
  if (!username || !platformKey) return '';
  
  const platform = SOCIAL_PLATFORMS[platformKey.toLowerCase()];
  if (!platform) return username;
  
  const cleanUsername = username.replace(/^@/, '');
  return platform.urlTemplate.replace('{username}', cleanUsername);
}

/**
 * Smart social URL processor - handles both URLs and usernames
 */
export function processSocialInput(input: string, platformKey: string): { url: string; username: string; isValid: boolean } {
  if (!input || !platformKey) {
    return { url: '', username: '', isValid: false };
  }
  
  const platform = SOCIAL_PLATFORMS[platformKey.toLowerCase()];
  if (!platform) {
    return { url: input, username: input, isValid: false };
  }
  
  const cleanInput = input.trim();
  
  // Check if input contains any of the platform domains (likely a URL)
  const containsDomain = platform.domains.some(domain => 
    cleanInput.toLowerCase().includes(domain.toLowerCase())
  );
  
  if (containsDomain) {
    // Input is likely a URL, extract username and ensure proper format
    const username = extractUsername(cleanInput, platformKey);
    const properUrl = generateSocialUrl(username, platformKey);
    return {
      url: properUrl,
      username: username,
      isValid: !!username
    };
  } else {
    // Input is likely just a username
    const username = extractUsername(cleanInput, platformKey);
    const url = generateSocialUrl(username, platformKey);
    return {
      url: url,
      username: username,
      isValid: !!username
    };
  }
}

/**
 * Extract display username for profile pages (with @ prefix if needed)
 */
export function getDisplayUsername(url: string, platformKey: string): string {
  const username = extractUsername(url, platformKey);
  const platform = SOCIAL_PLATFORMS[platformKey.toLowerCase()];
  
  if (platform?.usernamePrefix && username) {
    return platform.usernamePrefix + username;
  }
  
  return username;
}

/**
 * Validate if a social input is valid for a platform
 */
export function validateSocialInput(input: string, platformKey: string): boolean {
  const result = processSocialInput(input, platformKey);
  return result.isValid;
}

/**
 * Get platform key from URL (for reverse lookup)
 */
export function getPlatformFromUrl(url: string): string | null {
  const cleanUrl = url.toLowerCase().replace(/^https?:\/\/(www\.)?/, '');
  
  for (const [key, platform] of Object.entries(SOCIAL_PLATFORMS)) {
    if (platform.domains.some(domain => cleanUrl.includes(domain))) {
      return key;
    }
  }
  
  return null;
} 