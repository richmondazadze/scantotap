import OpenAI from 'openai';

export interface BioEnhancementOptions {
  currentBio: string;
  title: string;
  name?: string;
  style?: 'professional' | 'creative' | 'casual' | 'technical';
}

export interface BioSuggestion {
  text: string;
  style: string;
  reasoning?: string;
}

export interface AIResponse {
  success: boolean;
  suggestions: BioSuggestion[];
  error?: string;
}

class AIService {
  private static readonly MAX_BIO_LENGTH = 80;
  private static openai: OpenAI | null = null;

  // Initialize OpenRouter client
  private static getOpenAI(): OpenAI | null {
    if (this.openai) return this.openai;

    const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
    const siteUrl = import.meta.env.VITE_SITE_URL || window.location.origin;
    const siteName = import.meta.env.VITE_SITE_NAME || 'Scan2Tap';

    if (!apiKey) {
      console.warn('OpenRouter API key not found. AI features will use fallback templates.');
      return null;
    }

    this.openai = new OpenAI({
      baseURL: "https://openrouter.ai/api/v1",
      apiKey: apiKey,
      dangerouslyAllowBrowser: true,
      defaultHeaders: {
        "HTTP-Referer": siteUrl,
        "X-Title": siteName,
      },
    });

    return this.openai;
  }

  /**
   * Enhance bio using AI
   */
  static async enhanceBio(options: BioEnhancementOptions): Promise<AIResponse> {
    try {
      const openai = this.getOpenAI();
      
      if (openai) {
        // Try AI enhancement first
        const aiResult = await this.enhanceWithAI(options, openai);
        if (aiResult.success) {
          return aiResult;
        }
      }

      // Fallback to template-based enhancement
      return this.enhanceWithTemplates(options);
    } catch (error) {
      console.error('AI bio enhancement error:', error);
      return this.enhanceWithTemplates(options);
    }
  }

  /**
   * Generate bio from scratch using AI
   */
  static async generateBio(title: string, name?: string, style: string = 'professional'): Promise<AIResponse> {
    try {
      const openai = this.getOpenAI();
      
      if (openai) {
        const aiResult = await this.generateWithAI({ title, name, style }, openai);
        if (aiResult.success) {
          return aiResult;
        }
      }

      // Fallback to template generation
      return this.generateWithTemplates({ title, name, style });
    } catch (error) {
      console.error('AI bio generation error:', error);
      return this.generateWithTemplates({ title, name, style });
    }
  }

  /**
   * Enhance bio using OpenRouter AI
   */
  private static async enhanceWithAI(options: BioEnhancementOptions, openai: OpenAI): Promise<AIResponse> {
    const { currentBio, title, name, style = 'professional' } = options;

    const prompt = this.buildEnhancementPrompt(currentBio, title, name, style);

    try {
      const completion = await openai.chat.completions.create({
        model: "deepseek/deepseek-r1-0528-qwen3-8b:free",
        messages: [
          {
            role: "system",
            content: `You are a professional bio writer specializing in concise, impactful profiles. Your task is to enhance bios to be more engaging while staying under 80 characters. Focus on action words, achievements, and personality. Return exactly 3 different enhanced versions, each on a new line, numbered 1-3.`
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 300,
        temperature: 0.8,
      });

      const content = completion.choices[0]?.message?.content || '';
      return this.parseAIResponse(content, 'enhanced');
    } catch (error) {
      console.error('OpenRouter API error:', error);
      throw error;
    }
  }

  /**
   * Generate bio from scratch using AI
   */
  private static async generateWithAI(options: { title: string; name?: string; style: string }, openai: OpenAI): Promise<AIResponse> {
    const { title, name, style } = options;

    const prompt = this.buildGenerationPrompt(title, name, style);

    try {
      const completion = await openai.chat.completions.create({
        model: "deepseek/deepseek-r1-0528-qwen3-8b:free",
        messages: [
          {
            role: "system",
            content: `You are an expert professional bio writer specializing in creating compelling, concise bios for digital profiles. Your task is to create engaging professional bios that are EXACTLY under 80 characters.

CRITICAL REQUIREMENTS:
- Each bio must be under 80 characters (including spaces)
- Return EXACTLY 3 different variations
- Format: Just the bio text, one per line, no numbering or bullets
- Make each bio unique and compelling
- Use active voice and power words
- Include personality while maintaining professionalism

EXAMPLES OF GREAT BIOS:
- "Marketing strategist turning data into growth stories that captivate audiences"
- "Full-stack developer building scalable solutions that users love"
- "Creative designer crafting visual experiences that inspire and engage"
- "Sales leader driving revenue through authentic relationship building"

Focus on: Action verbs, specific value, personality, and impact.`
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 400,
        temperature: 0.8,
      });

      const content = completion.choices[0]?.message?.content || '';
      return this.parseAIResponse(content, style);
    } catch (error) {
      console.error('OpenRouter API error:', error);
      throw error;
    }
  }

  /**
   * Build enhancement prompt
   */
  private static buildEnhancementPrompt(currentBio: string, title: string, name?: string, style: string = 'professional'): string {
    let prompt = `Transform this bio into something more compelling and engaging:\n\n"${currentBio}"\n\n`;
    
    prompt += `CONTEXT:\n`;
    prompt += `- Role: ${title}\n`;
    if (name) {
      prompt += `- Name: ${name}\n`;
    }
    prompt += `- Style: ${style}\n\n`;
    
    prompt += `ENHANCEMENT GOALS:\n`;
    prompt += `- Make it more engaging and memorable\n`;
    prompt += `- Add personality while staying professional\n`;
    prompt += `- Use stronger action words\n`;
    prompt += `- Highlight unique value proposition\n`;
    prompt += `- Keep under 80 characters\n\n`;
    
    prompt += `Create 3 enhanced versions that are more impactful than the original:`;

    return prompt;
  }

  /**
   * Build generation prompt
   */
  private static buildGenerationPrompt(title: string, name?: string, style: string = 'professional'): string {
    let prompt = `Create compelling professional bios for a ${title}`;
    
    if (name) {
      prompt += ` named ${name}`;
    }
    
    prompt += `.\n\n`;
    
    // Style-specific guidance
    const styleGuides = {
      professional: `PROFESSIONAL STYLE - Focus on expertise, results, and leadership. Use terms like "strategic," "results-driven," "experienced," "specialized."`,
      creative: `CREATIVE STYLE - Emphasize innovation, vision, and artistic thinking. Use terms like "innovative," "visionary," "imaginative," "transforms ideas."`,
      casual: `CASUAL STYLE - Be friendly and approachable while professional. Use terms like "passionate," "loves," "enjoys," "dedicated to helping."`,
      technical: `TECHNICAL STYLE - Highlight technical skills and problem-solving. Use terms like "develops," "optimizes," "builds," "engineers," "specializes in."`
    };
    
    prompt += `${styleGuides[style as keyof typeof styleGuides] || styleGuides.professional}\n\n`;
    
    prompt += `SPECIFIC REQUIREMENTS:\n`;
    prompt += `- Each bio must be under 80 characters\n`;
    prompt += `- Start with an action verb or compelling descriptor\n`;
    prompt += `- Include what makes them unique\n`;
    prompt += `- Show impact or value they provide\n`;
    prompt += `- Make it memorable and engaging\n\n`;
    
    prompt += `Generate 3 different bio variations:`;

    return prompt;
  }

  /**
   * Parse AI response into suggestions
   */
  private static parseAIResponse(content: string, style: string): AIResponse {
    try {
      console.log('Raw AI response:', content);
      
      const lines = content.split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .filter(line => !line.match(/^(here are|here's|bio|variation|option)/i));

      const suggestions: BioSuggestion[] = [];

      for (const line of lines) {
        // Clean up the line - remove numbers, bullets, quotes, common prefixes
        let cleanLine = line
          .replace(/^\d+[\.)]\s*/, '')           // Remove "1. " or "1) "
          .replace(/^[-*•]\s*/, '')             // Remove bullet points
          .replace(/^["'`]|["'`]$/g, '')        // Remove quotes
          .replace(/^(bio|option|variation)\s*\d*:?\s*/i, '') // Remove "Bio 1:", "Option:", etc.
          .trim();

        // Skip if empty, too short, or too long
        if (cleanLine.length > 10 && cleanLine.length <= this.MAX_BIO_LENGTH) {
          suggestions.push({
            text: cleanLine,
            style: style,
            reasoning: `AI-generated ${style} bio optimized for engagement and character limit`
          });
        }
      }

      console.log('Parsed suggestions:', suggestions);

      if (suggestions.length > 0) {
        return {
          success: true,
          suggestions: suggestions.slice(0, 3) // Limit to 3 suggestions
        };
      }

      throw new Error('No valid suggestions generated from AI response');
    } catch (error) {
      console.error('Failed to parse AI response:', error);
      return { success: false, suggestions: [], error: 'Failed to parse AI response' };
    }
  }

  /**
   * Fallback template-based enhancement
   */
  private static enhanceWithTemplates(options: BioEnhancementOptions): AIResponse {
    const { currentBio, title, style = 'professional' } = options;
    const suggestions: BioSuggestion[] = [];

    // Enhancement patterns based on style
    const enhancements = {
      professional: [
        `${title} focused on delivering exceptional results and driving innovation.`,
        `Experienced ${title} passionate about excellence and strategic growth.`,
        `Results-driven ${title} with expertise in transforming challenges to opportunities.`
      ],
      creative: [
        `Creative ${title} who transforms ideas into reality with innovative thinking.`,
        `Visionary ${title} passionate about pushing boundaries and inspiring others.`,
        `Imaginative ${title} dedicated to creating meaningful and impactful experiences.`
      ],
      casual: [
        `Friendly ${title} who loves connecting with people and making a difference.`,
        `Enthusiastic ${title} always excited to learn, grow, and collaborate.`,
        `Genuine ${title} who values authenticity and building lasting relationships.`
      ],
      technical: [
        `Technical ${title} specialized in developing robust, scalable solutions.`,
        `Detail-oriented ${title} focused on optimizing systems and processes.`,
        `Analytical ${title} passionate about leveraging technology for impact.`
      ]
    };

    const templates = enhancements[style as keyof typeof enhancements] || enhancements.professional;

    templates.forEach((template, index) => {
      const enhanced = this.truncateBio(template, this.MAX_BIO_LENGTH);
      suggestions.push({
        text: enhanced,
        style: `template-${style}`,
        reasoning: `Enhanced using ${style} style template`
      });
    });

    return {
      success: true,
      suggestions
    };
  }

  /**
   * Fallback template-based generation
   */
  private static generateWithTemplates(options: { title: string; name?: string; style: string }): AIResponse {
    const { title, style = 'professional' } = options;
    const suggestions: BioSuggestion[] = [];

    const templates = {
      professional: [
        `Experienced ${title} with a proven track record of delivering exceptional results.`,
        `Dedicated ${title} passionate about excellence and driving meaningful impact.`,
        `Results-driven ${title} focused on innovation and strategic problem-solving.`
      ],
      creative: [
        `Creative ${title} who transforms ideas into reality through innovative thinking.`,
        `Visionary ${title} passionate about pushing boundaries and inspiring change.`,
        `Imaginative ${title} dedicated to creating meaningful experiences and solutions.`
      ],
      casual: [
        `Friendly ${title} who loves what they do and enjoys connecting with others.`,
        `Enthusiastic ${title} always excited to learn, grow, and make a difference.`,
        `Genuine ${title} who values authenticity and building real relationships.`
      ],
      technical: [
        `Technical ${title} specialized in developing robust, scalable solutions.`,
        `Detail-oriented ${title} focused on optimizing complex systems efficiently.`,
        `Analytical ${title} passionate about leveraging technology for real impact.`
      ]
    };

    const styleTemplates = templates[style as keyof typeof templates] || templates.professional;

    styleTemplates.forEach((template, index) => {
      const bio = this.truncateBio(template, this.MAX_BIO_LENGTH);
      suggestions.push({
        text: bio,
        style: `template-${style}`,
        reasoning: `Generated using ${style} style template`
      });
    });

    return {
      success: true,
      suggestions
    };
  }

  /**
   * Truncate bio to fit character limit
   */
  private static truncateBio(bio: string, maxLength: number): string {
    if (bio.length <= maxLength) {
      return bio;
    }

    // Try to truncate at word boundary
    const words = bio.split(' ');
    let truncated = '';

    for (const word of words) {
      const testString = truncated ? `${truncated} ${word}` : word;
      if (testString.length <= maxLength - 3) {
        truncated = testString;
      } else {
        break;
      }
    }

    return truncated ? `${truncated}...` : bio.substring(0, maxLength - 3) + '...';
  }

  /**
   * Get style recommendations based on title
   */
  static getRecommendedStyle(title: string): 'professional' | 'creative' | 'casual' | 'technical' {
    const titleLower = title.toLowerCase();

    if (titleLower.includes('engineer') || titleLower.includes('developer') || titleLower.includes('analyst')) {
      return 'technical';
    }
    if (titleLower.includes('designer') || titleLower.includes('artist') || titleLower.includes('creative')) {
      return 'creative';
    }
    if (titleLower.includes('teacher') || titleLower.includes('coach') || titleLower.includes('community')) {
      return 'casual';
    }

    return 'professional';
  }
}

export default AIService; 