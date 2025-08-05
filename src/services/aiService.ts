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
  private static readonly MAX_BIO_LENGTH = 160;
  private static openai: OpenAI | null = null;
  private static cache = new Map<string, AIResponse>();
  private static requestQueue: Promise<any>[] = [];

  // Optimized OpenAI client initialization
  private static getOpenAI(): OpenAI | null {
    if (this.openai) return this.openai;

    const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
    if (!apiKey) {
      console.warn('OpenRouter API key not found');
      return null;
    }

    this.openai = new OpenAI({
      baseURL: "https://openrouter.ai/api/v1",
      apiKey: apiKey,
      dangerouslyAllowBrowser: true,
      timeout: 15000, // 15 second timeout
      defaultHeaders: {
        "HTTP-Referer": import.meta.env.VITE_SITE_URL || window.location.origin,
        "X-Title": import.meta.env.VITE_SITE_NAME || 'Scan2Tap',
      },
    });

    return this.openai;
  }

  /**
   * Enhanced bio generation with caching and optimized performance
   */
  static async enhanceBio(options: BioEnhancementOptions): Promise<AIResponse> {
    const cacheKey = `enhance_${JSON.stringify(options)}`;
    
    // Check cache first
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    try {
      const openai = this.getOpenAI();
      
      if (openai) {
        const result = await this.enhanceWithOptimizedAI(options, openai);
        this.cache.set(cacheKey, result);
        return result;
      }

      return this.enhanceWithOptimizedTemplates(options);
    } catch (error) {
      console.error('Bio enhancement error:', error);
      return this.enhanceWithOptimizedTemplates(options);
    }
  }

  /**
   * Enhanced bio generation from scratch
   */
  static async generateBio(title: string, name?: string, style: string = 'professional'): Promise<AIResponse> {
    const cacheKey = `generate_${title}_${name}_${style}`;
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    try {
      const openai = this.getOpenAI();
      
      if (openai) {
        const result = await this.generateWithOptimizedAI({ title, name, style }, openai);
        this.cache.set(cacheKey, result);
        return result;
      }

      return this.generateWithOptimizedTemplates({ title, name, style });
    } catch (error) {
      console.error('Bio generation error:', error);
      return this.generateWithOptimizedTemplates({ title, name, style });
    }
  }

  /**
   * OPTIMIZED AI ENHANCEMENT - Perfect prompt for maximum results
   */
  private static async enhanceWithOptimizedAI(options: BioEnhancementOptions, openai: OpenAI): Promise<AIResponse> {
    const { currentBio, title, name, style = 'professional' } = options;

    try {
      const completion = await openai.chat.completions.create({
        model: "anthropic/claude-3-haiku:beta", // Faster model
        messages: [
          {
            role: "system",
            content: this.getPerfectSystemPrompt()
          },
          {
            role: "user",
            content: this.buildPerfectEnhancementPrompt(currentBio, title, style)
          }
        ],
        max_tokens: 200, // Reduced for faster response
        temperature: 0.7,
        top_p: 0.9,
        frequency_penalty: 0.3,
        presence_penalty: 0.3
      });

      const content = completion.choices[0]?.message?.content || '';
      return this.parseOptimizedResponse(content, style);
    } catch (error) {
      console.error('AI enhancement error:', error);
      throw error;
    }
  }

  /**
   * OPTIMIZED AI GENERATION
   */
  private static async generateWithOptimizedAI(options: { title: string; name?: string; style: string }, openai: OpenAI): Promise<AIResponse> {
    const { title, name, style } = options;

    try {
      const completion = await openai.chat.completions.create({
        model: "anthropic/claude-3-haiku:beta",
        messages: [
          {
            role: "system",
            content: this.getPerfectSystemPrompt()
          },
          {
            role: "user",
            content: this.buildPerfectGenerationPrompt(title, style)
          }
        ],
        max_tokens: 200,
        temperature: 0.7,
        top_p: 0.9,
        frequency_penalty: 0.3,
        presence_penalty: 0.3
      });

      const content = completion.choices[0]?.message?.content || '';
      return this.parseOptimizedResponse(content, style);
    } catch (error) {
      console.error('AI generation error:', error);
      throw error;
    }
  }

  /**
   * PERFECT SYSTEM PROMPT - Engineered for maximum accuracy and efficiency
   */
  private static getPerfectSystemPrompt(): string {
    return `You are an elite bio optimization engine. Your ONLY job is to create 3 perfect professional bios under 160 characters each.

CRITICAL RULES:
✅ EXACTLY 3 bios, one per line
✅ Each bio MUST be under 160 characters
✅ No numbering, bullets, or extra text
✅ Start immediately with the bio text
✅ Use powerful action words: transforms, architects, orchestrates, accelerates, pioneers
✅ Focus on outcomes and value creation
✅ Make each bio distinct and compelling

BANNED WORDS/PHRASES:
❌ "passionate about" ❌ "results-driven" ❌ "team player" ❌ "hard worker"
❌ "helps" ❌ "works with" ❌ "various" ❌ "multiple" ❌ "synergy"
❌ Any clichés or generic business speak

FORMAT EXAMPLE:
Transforming digital landscapes through data-driven strategies that accelerate growth
Orchestrating cross-functional teams to deliver breakthrough solutions and measurable ROI  
Architecting scalable systems that revolutionize user experiences and drive innovation

Your response MUST follow this exact format with 3 distinct, powerful bios.`;
  }

  /**
   * PERFECT ENHANCEMENT PROMPT
   */
  private static buildPerfectEnhancementPrompt(currentBio: string, title: string, style: string): string {
    const styleMap = {
      professional: 'authoritative and results-focused',
      creative: 'innovative and inspiring', 
      casual: 'approachable yet competent',
      technical: 'precise and solution-oriented'
    };

    return `Transform this bio into 3 compelling variations:

CURRENT BIO: "${currentBio}"
TITLE: ${title}
STYLE: ${styleMap[style as keyof typeof styleMap]}

Make each version ${styleMap[style as keyof typeof styleMap]} while keeping the core message. Focus on what makes this person valuable and memorable.

Generate exactly 3 enhanced bios now:`;
  }

  /**
   * PERFECT GENERATION PROMPT
   */
  private static buildPerfectGenerationPrompt(title: string, style: string): string {
    const roleContext = this.getRoleContext(title);
    const styleMap = {
      professional: 'authoritative and results-focused',
      creative: 'innovative and inspiring',
      casual: 'approachable yet competent', 
      technical: 'precise and solution-oriented'
    };

    return `Create 3 compelling bios for a ${title}:

ROLE CONTEXT: ${roleContext}
STYLE: ${styleMap[style as keyof typeof styleMap]}

Focus on what makes this role valuable, the outcomes they create, and their unique impact.

Generate exactly 3 distinct bios now:`;
  }

  /**
   * Get optimized role context
   */
  private static getRoleContext(title: string): string {
    const t = title.toLowerCase();
    
    if (t.includes('engineer') || t.includes('developer')) {
      return 'Builds scalable solutions, solves complex problems, transforms technical challenges into business value';
    }
    if (t.includes('designer') || t.includes('creative')) {
      return 'Creates compelling experiences, transforms concepts into engaging realities, drives visual innovation';
    }
    if (t.includes('manager') || t.includes('director') || t.includes('ceo')) {
      return 'Orchestrates teams, drives strategic initiatives, transforms organizational performance';
    }
    if (t.includes('marketing') || t.includes('growth')) {
      return 'Accelerates brand growth, transforms audience engagement, drives revenue through strategic campaigns';
    }
    if (t.includes('sales') || t.includes('business')) {
      return 'Accelerates revenue growth, builds strategic partnerships, transforms client relationships';
    }
    if (t.includes('consultant') || t.includes('advisor')) {
      return 'Transforms business challenges into strategic opportunities, delivers measurable outcomes';
    }
    
    return 'Creates exceptional value, drives meaningful outcomes, transforms challenges into opportunities';
  }

  /**
   * OPTIMIZED RESPONSE PARSER
   */
  private static parseOptimizedResponse(content: string, style: string): AIResponse {
    const lines = content
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 10 && line.length <= this.MAX_BIO_LENGTH)
      .filter(line => !line.match(/^(here|bio|option|variation|\d+\.)/i));

    if (lines.length === 0) {
      throw new Error('No valid bios generated');
    }

    const suggestions: BioSuggestion[] = lines.slice(0, 3).map((text, index) => ({
      text: text.replace(/^["']|["']$/g, '').trim(),
      style: `ai-${style}`,
      reasoning: `AI-optimized ${style} bio focused on impact and engagement`
    }));

    return { success: true, suggestions };
  }

  /**
   * OPTIMIZED TEMPLATE FALLBACKS
   */
  private static enhanceWithOptimizedTemplates(options: BioEnhancementOptions): AIResponse {
    const { currentBio, title, style = 'professional' } = options;
    
    const templates = this.getOptimizedTemplates(style, title);
    const suggestions = templates.map((template, index) => ({
      text: this.optimizeBioLength(template),
      style: `template-${style}`,
      reasoning: `Optimized ${style} template based on role context`
    }));

    return { success: true, suggestions };
  }

  private static generateWithOptimizedTemplates(options: { title: string; name?: string; style: string }): AIResponse {
    const { title, style } = options;
    
    const templates = this.getOptimizedTemplates(style, title);
    const suggestions = templates.map(template => ({
      text: this.optimizeBioLength(template),
      style: `template-${style}`,
      reasoning: `Generated using optimized ${style} template`
    }));

    return { success: true, suggestions };
  }

  /**
   * HIGH-PERFORMANCE TEMPLATES
   */
  private static getOptimizedTemplates(style: string, title: string): string[] {
    const roleType = this.getRoleType(title);
    
    const templates = {
      professional: {
        tech: [
          'Architecting scalable solutions that transform business operations and drive measurable growth',
          'Engineering breakthrough systems that accelerate performance and deliver exceptional user experiences',
          'Transforming complex technical challenges into strategic business advantages and competitive edge'
        ],
        creative: [
          'Crafting compelling brand experiences that drive engagement and accelerate business growth',
          'Transforming creative concepts into breakthrough campaigns that deliver measurable impact',
          'Orchestrating visual narratives that captivate audiences and drive meaningful connections'
        ],
        business: [
          'Orchestrating strategic initiatives that accelerate growth and transform organizational performance',
          'Driving revenue optimization through data-driven strategies and exceptional relationship building',
          'Transforming market challenges into competitive advantages and sustainable business growth'
        ],
        default: [
          'Transforming challenges into opportunities that accelerate growth and drive exceptional results',
          'Orchestrating strategic initiatives that deliver measurable impact and lasting value',
          'Architecting solutions that revolutionize performance and accelerate organizational success'
        ]
      },
      creative: {
        tech: [
          'Crafting innovative digital experiences that blend cutting-edge technology with human-centered design',
          'Transforming complex problems into elegant solutions that delight users and drive engagement',
          'Designing breakthrough applications that revolutionize how people interact with technology'
        ],
        creative: [
          'Transforming bold visions into breakthrough realities that captivate and inspire audiences',
          'Crafting unforgettable experiences that bridge creativity and strategy for maximum impact',
          'Designing compelling narratives that drive emotional connection and measurable engagement'
        ],
        business: [
          'Orchestrating creative strategies that transform brands and accelerate meaningful growth',
          'Crafting innovative approaches that revolutionize customer experiences and drive loyalty',
          'Transforming market insights into creative campaigns that deliver breakthrough results'
        ],
        default: [
          'Transforming creative concepts into powerful realities that inspire and drive action',
          'Crafting innovative solutions that blend artistry with strategic thinking beautifully',
          'Designing experiences that captivate audiences and create lasting emotional connections'
        ]
      },
      casual: {
        tech: [
          'Building awesome apps and solving complex problems with clean, efficient code that users love',
          'Passionate about creating technology that makes life easier and more enjoyable for everyone',
          'Love turning challenging technical problems into elegant solutions that actually work'
        ],
        creative: [
          'Creating beautiful designs and compelling content that tells stories and connects with people',
          'Passionate about bringing creative ideas to life through thoughtful design and strategic thinking',
          'Love crafting experiences that make people smile and help brands connect authentically'
        ],
        business: [
          'Building meaningful relationships and driving growth through authentic connections and smart strategies',
          'Passionate about helping businesses thrive while making work enjoyable and collaborative',
          'Love turning challenges into opportunities through creative problem-solving and teamwork'
        ],
        default: [
          'Passionate about solving problems and creating positive impact through collaborative innovation',
          'Love building relationships and helping others achieve their goals while having fun doing it',
          'Dedicated to making meaningful differences through authentic connections and creative solutions'
        ]
      },
      technical: {
        tech: [
          'Engineering robust, scalable systems that optimize performance and deliver exceptional reliability',
          'Developing cutting-edge solutions that solve complex problems with precision and efficiency',
          'Architecting high-performance applications that scale seamlessly and exceed user expectations'
      ],
      creative: [
          'Building innovative digital platforms that merge technical excellence with creative vision',
          'Developing sophisticated tools that empower creative professionals to achieve breakthrough results',
          'Engineering elegant solutions that transform creative workflows and optimize artistic output'
        ],
        business: [
          'Optimizing business processes through systematic analysis and data-driven technical solutions',
          'Developing automated systems that streamline operations and accelerate organizational efficiency',
          'Engineering strategic platforms that transform business capabilities and competitive positioning'
        ],
        default: [
          'Engineering systematic solutions that optimize performance and deliver measurable improvements',
          'Developing robust frameworks that solve complex challenges with precision and reliability',
          'Building efficient systems that scale effectively and exceed operational requirements'
        ]
      }
    };

    const styleTemplates = templates[style as keyof typeof templates] || templates.professional;
    return styleTemplates[roleType as keyof typeof styleTemplates] || styleTemplates.default;
  }

  /**
   * OPTIMIZED ROLE DETECTION
   */
  private static getRoleType(title: string): string {
    const t = title.toLowerCase();
    
    if (t.includes('engineer') || t.includes('developer') || t.includes('programmer') || 
        t.includes('architect') || t.includes('devops') || t.includes('tech')) {
      return 'tech';
    }
    
    if (t.includes('designer') || t.includes('creative') || t.includes('artist') || 
        t.includes('writer') || t.includes('marketing') || t.includes('brand')) {
      return 'creative';
    }
    
    if (t.includes('manager') || t.includes('director') || t.includes('ceo') || 
        t.includes('sales') || t.includes('business') || t.includes('consultant')) {
      return 'business';
    }
    
    return 'default';
  }

  /**
   * OPTIMIZED BIO LENGTH HANDLING
   */
  private static optimizeBioLength(bio: string): string {
    if (bio.length <= this.MAX_BIO_LENGTH) {
      return bio;
    }

    // Smart truncation at word boundaries
    const words = bio.split(' ');
    let result = '';

    for (const word of words) {
      const test = result ? `${result} ${word}` : word;
      if (test.length <= this.MAX_BIO_LENGTH - 3) {
        result = test;
      } else {
        break;
      }
    }

    return result ? `${result}...` : bio.substring(0, this.MAX_BIO_LENGTH - 3) + '...';
  }

  /**
   * SMART STYLE RECOMMENDATION
   */
  static getRecommendedStyle(title: string): 'professional' | 'creative' | 'casual' | 'technical' {
    const t = title.toLowerCase();
    
    if (t.includes('engineer') || t.includes('developer') || t.includes('analyst') || 
        t.includes('architect') || t.includes('data') || t.includes('devops')) {
      return 'technical';
    }
    
    if (t.includes('designer') || t.includes('creative') || t.includes('artist') || 
        t.includes('writer') || t.includes('marketing') || t.includes('brand')) {
      return 'creative';
    }
    
    if (t.includes('teacher') || t.includes('coach') || t.includes('support') || 
        t.includes('community') || t.includes('coordinator')) {
      return 'casual';
    }

    return 'professional';
  }

  /**
   * CLEAR CACHE (for memory management)
   */
  static clearCache(): void {
    this.cache.clear();
  }
}

export default AIService; 