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
            content: this.getEnhancedSystemPrompt()
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
            content: this.getEnhancedSystemPrompt()
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 500,
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
   * Enhanced system prompt focused on user input only
   */
  private static getEnhancedSystemPrompt(): string {
    return `You are an elite strategic copywriter specializing in crafting compelling professional bios for digital profiles. Your expertise lies in creating conversation-starting introductions with PRIMARY FOCUS on the user's bio content and secondary consideration of their title.

PRIORITY HIERARCHY:
1. PRIMARY: Bio content the user has written (this is the MAIN focus)
2. SECONDARY: User's title (use as context but bio content takes precedence)

CORE PRINCIPLE: 
- If user has bio content: Build PRIMARILY on their bio content, use title only for context
- If user has no bio content: Use only the title provided
- Do NOT make assumptions about their industry, role, or add details not provided

BIO STRUCTURE FORMULA:
[Enhanced Bio Content] + [Title Context if needed] + [Conversation Starter]

POWER WORDS TOOLKIT:
Action: transforms, accelerates, orchestrates, architects, pioneers, amplifies, catalyzes, cultivates
Value: breakthrough, game-changing, award-winning, industry-leading, proven, scalable, innovative
Emotion: passionate, obsessed, dedicated, driven, inspiring, authentic, genuine, magnetic

CRITICAL GUIDELINES:
✅ PRIORITIZE the bio content the user has written
✅ Enhance their bio language without changing their meaning
✅ Use title only as supporting context, not the main focus
✅ Focus on what they've specifically mentioned in their bio
✅ Create engaging versions of THEIR bio content

CRITICAL AVOIDANCE LIST:
❌ Adding industry assumptions not mentioned
❌ Generic phrases: "passionate about," "results-driven," "team player," "hard worker"
❌ Weak verbs: "helps," "works with," "does," "handles," "manages"  
❌ Vague terms: "various," "multiple," "different," "many," "some"
❌ Clichés: "outside the box," "synergy," "best practices," "next level"
❌ Making up details about their work or industry

REQUIREMENTS:
- EXACTLY under 100 characters (including spaces)
- Return 3 distinct variations, one per line
- No numbering, bullets, or formatting
- Base everything on the user's provided information
- PRIMARY emphasis on bio content, secondary on title
- Enhance their language while keeping their core message
- Create conversation-starting hooks from THEIR content

Your goal: Enhance what the user has provided, not create assumptions about what they do.`;
  }

  /**
   * Build enhanced generation prompt based on user input only
   */
  private static buildGenerationPrompt(title: string, name?: string, style: string = 'professional'): string {
    const styleGuide = this.getEnhancedStyleGuide(style);

    let prompt = `Create compelling professional bios for someone with the title: "${title}"`;
    
    if (name) {
      prompt += ` named ${name}`;
    }
    
    prompt += `.\n\n`;
    
    prompt += `STYLE REQUIREMENTS:\n${styleGuide}\n\n`;
    
    prompt += `FOCUS AREAS:\n`;
    prompt += `- Base the bio entirely on the provided title: "${title}"\n`;
    prompt += `- Do not make assumptions about their industry or role beyond what's stated\n`;
    prompt += `- Create engaging language that reflects their specific title\n`;
    prompt += `- Focus on what makes someone with this title valuable\n`;
    prompt += `- Make it conversation-starting and memorable\n\n`;
    
    prompt += `REQUIREMENTS:\n`;
    prompt += `- Under 100 characters including spaces\n`;
    prompt += `- Use the exact title provided: "${title}"\n`;
    prompt += `- Create 3 unique variations\n`;
    prompt += `- Focus on outcomes and value creation\n`;
    prompt += `- Use active voice and specific action verbs\n\n`;
    
    prompt += `Generate 3 different bio variations:`;

    return prompt;
  }

  /**
   * Build enhanced enhancement prompt based on user input only
   */
  private static buildEnhancementPrompt(currentBio: string, title: string, name?: string, style: string = 'professional'): string {
    const styleGuide = this.getEnhancedStyleGuide(style);

    let prompt = `Transform this bio into something more compelling and conversation-starting:\n\n"${currentBio}"\n\n`;
    
    prompt += `USER CONTEXT:\n`;
    prompt += `- Bio Content (PRIMARY FOCUS): "${currentBio}"\n`;
    prompt += `- Title (for context only): ${title}\n`;
    if (name) {
      prompt += `- Name: ${name}\n`;
    }
    prompt += `- Target Style: ${style}\n\n`;
    
    prompt += `STYLE REQUIREMENTS:\n${styleGuide}\n\n`;
    
    prompt += `ENHANCEMENT GOALS:\n`;
    prompt += `- PRIORITIZE the bio content they've written: "${currentBio}"\n`;
    prompt += `- Use the title "${title}" only as supporting context\n`;
    prompt += `- Do not add assumptions about their industry or role\n`;
    prompt += `- Enhance the bio language while keeping the core message\n`;
    prompt += `- Make it more engaging and conversation-starting\n`;
    prompt += `- Use stronger action words and more specific language\n`;
    prompt += `- Stay under 100 characters while maximizing impact\n\n`;
    
    prompt += `REQUIREMENTS:\n`;
    prompt += `- Base enhancements PRIMARY on the bio: "${currentBio}"\n`;
    prompt += `- Use their title: "${title}" only for context\n`;
    prompt += `- Create 3 enhanced variations\n`;
    prompt += `- Keep the original bio meaning but make it more compelling\n\n`;
    
    prompt += `Create 3 enhanced versions:`;

    return prompt;
  }

  /**
   * Get role-specific context and insights
   */
  private static getRoleSpecificContext(title: string): string {
    const titleLower = title.toLowerCase();
    
    // Technical roles
    if (titleLower.includes('engineer') || titleLower.includes('developer') || titleLower.includes('architect')) {
      return `Technical professionals who build, optimize, and solve complex problems. Focus on: scalability, innovation, user impact, system transformation, cutting-edge solutions.`;
    }
    
    // Creative roles
    if (titleLower.includes('designer') || titleLower.includes('creative') || titleLower.includes('artist') || titleLower.includes('writer')) {
      return `Creative professionals who transform ideas into engaging experiences. Focus on: visual storytelling, user experience, brand transformation, creative problem-solving, aesthetic innovation.`;
    }
    
    // Sales/Business roles
    if (titleLower.includes('sales') || titleLower.includes('business') || titleLower.includes('account') || titleLower.includes('revenue')) {
      return `Revenue-driving professionals who build relationships and accelerate growth. Focus on: relationship building, strategic partnerships, revenue transformation, client success stories.`;
    }
    
    // Marketing roles
    if (titleLower.includes('marketing') || titleLower.includes('brand') || titleLower.includes('growth') || titleLower.includes('digital')) {
      return `Growth-focused professionals who amplify brands and drive engagement. Focus on: audience connection, brand storytelling, growth acceleration, market transformation.`;
    }
    
    // Leadership roles
    if (titleLower.includes('manager') || titleLower.includes('director') || titleLower.includes('ceo') || titleLower.includes('founder') || titleLower.includes('lead')) {
      return `Leadership professionals who orchestrate teams and drive organizational success. Focus on: team empowerment, strategic vision, culture transformation, organizational impact.`;
    }
    
    // Consulting/Advisory roles
    if (titleLower.includes('consultant') || titleLower.includes('advisor') || titleLower.includes('strategist') || titleLower.includes('analyst')) {
      return `Strategic professionals who provide insights and drive transformation. Focus on: strategic thinking, problem-solving expertise, industry insights, transformation outcomes.`;
    }
    
    // Education/Coaching roles
    if (titleLower.includes('teacher') || titleLower.includes('coach') || titleLower.includes('trainer') || titleLower.includes('mentor')) {
      return `Educational professionals who empower growth and development. Focus on: knowledge transfer, skill development, personal transformation, learning innovation.`;
    }
    
    // Healthcare/Service roles
    if (titleLower.includes('doctor') || titleLower.includes('nurse') || titleLower.includes('therapist') || titleLower.includes('service')) {
      return `Service-oriented professionals who improve lives and wellbeing. Focus on: life impact, care excellence, healing transformation, community service.`;
    }
    
    // Default professional context
    return `Professional who creates value and drives positive outcomes in their field. Focus on: expertise demonstration, unique approach, measurable impact, relationship building.`;
  }

  /**
   * Get enhanced style guides with specific direction
   */
  private static getEnhancedStyleGuide(style: string): string {
    const guides = {
      professional: `PROFESSIONAL EXCELLENCE - Emphasize expertise, proven results, and strategic impact. Use authoritative language that demonstrates competence without arrogance. Keywords: "orchestrates," "accelerates," "transforms," "architects," "proven," "strategic," "industry-leading." Tone: Confident, credible, results-focused.`,
      
      creative: `CREATIVE INNOVATION - Highlight artistic vision, innovative thinking, and transformative creativity. Use imaginative language that showcases unique perspective and creative problem-solving. Keywords: "crafts," "envisions," "transforms," "creates," "innovative," "visionary," "breakthrough," "inspiring." Tone: Imaginative, inspiring, forward-thinking.`,
      
      casual: `APPROACHABLE EXPERTISE - Balance professionalism with warmth and accessibility. Use friendly yet competent language that makes expertise feel approachable. Keywords: "passionate," "dedicated," "loves," "enjoys," "authentic," "genuine," "collaborative," "community-focused." Tone: Warm, genuine, relatable yet professional.`,
      
      technical: `TECHNICAL MASTERY - Emphasize problem-solving skills, technical innovation, and systematic thinking. Use precise language that demonstrates deep technical understanding and impact. Keywords: "engineers," "optimizes," "develops," "builds," "scales," "systematic," "efficient," "cutting-edge." Tone: Precise, innovative, solution-focused.`
    };
    
    return guides[style as keyof typeof guides] || guides.professional;
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
   * Enhanced template-based enhancement with better templates
   */
  private static enhanceWithTemplates(options: BioEnhancementOptions): AIResponse {
    const { currentBio, title, style = 'professional' } = options;
    const suggestions: BioSuggestion[] = [];

    // Enhanced templates with more specific and engaging language
    const enhancements = {
      professional: [
        `${title} orchestrating breakthrough results through strategic innovation and proven expertise.`,
        `Results-driven ${title} transforming challenges into opportunities that accelerate growth.`,
        `Award-winning ${title} architecting solutions that deliver measurable impact and lasting value.`
      ],
      creative: [
        `Visionary ${title} crafting experiences that inspire meaningful connections and drive engagement.`,
        `Creative ${title} transforming bold ideas into breakthrough realities that captivate audiences.`,
        `Innovative ${title} designing solutions that blend artistry with strategic thinking beautifully.`
      ],
      casual: [
        `Passionate ${title} who loves turning complex challenges into simple, elegant solutions.`,
        `Authentic ${title} dedicated to building genuine relationships and creating positive impact.`,
        `Enthusiastic ${title} always excited to collaborate, learn, and make meaningful differences.`
      ],
      technical: [
        `Technical ${title} engineering scalable solutions that optimize performance and user experience.`,
        `Systems-focused ${title} building robust architectures that solve complex problems efficiently.`,
        `Data-driven ${title} developing cutting-edge solutions that transform business operations.`
      ]
    };

    const templates = enhancements[style as keyof typeof enhancements] || enhancements.professional;

    templates.forEach((template, index) => {
      const enhanced = this.truncateBio(template, this.MAX_BIO_LENGTH);
      suggestions.push({
        text: enhanced,
        style: `enhanced-${style}`,
        reasoning: `Enhanced using ${style} style template with action-oriented language`
      });
    });

    return {
      success: true,
      suggestions
    };
  }

  /**
   * Enhanced template-based generation with better templates
   */
  private static generateWithTemplates(options: { title: string; name?: string; style: string }): AIResponse {
    const { title, style = 'professional' } = options;
    const suggestions: BioSuggestion[] = [];

    // More specific and engaging templates
    const templates = {
      professional: [
        `Strategic ${title} transforming businesses through innovative solutions and proven results.`,
        `Accomplished ${title} orchestrating growth initiatives that deliver exceptional outcomes.`,
        `Expert ${title} architecting sustainable strategies that accelerate organizational success.`
      ],
      creative: [
        `Visionary ${title} crafting compelling experiences that resonate with audiences globally.`,
        `Innovative ${title} transforming creative concepts into breakthrough marketing solutions.`,
        `Artistic ${title} designing visual narratives that inspire action and emotional connection.`
      ],
      casual: [
        `Friendly ${title} passionate about building relationships and creating positive change.`,
        `Approachable ${title} who loves solving problems and helping others achieve their goals.`,
        `Genuine ${title} dedicated to making work enjoyable while delivering outstanding results.`
      ],
      technical: [
        `Technical ${title} engineering robust systems that scale efficiently and perform reliably.`,
        `Analytical ${title} developing data-driven solutions that optimize complex business processes.`,
        `Innovative ${title} building cutting-edge applications that enhance user experiences.`
      ]
    };

    const styleTemplates = templates[style as keyof typeof templates] || templates.professional;

    styleTemplates.forEach((template, index) => {
      const bio = this.truncateBio(template, this.MAX_BIO_LENGTH);
      suggestions.push({
        text: bio,
        style: `template-${style}`,
        reasoning: `Generated using enhanced ${style} style template with specific value propositions`
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
   * Enhanced style recommendations with expanded role categorization
   */
  static getRecommendedStyle(title: string): 'professional' | 'creative' | 'casual' | 'technical' {
    const titleLower = title.toLowerCase();

    // Technical roles - expanded categorization
    if (titleLower.includes('engineer') || titleLower.includes('developer') || titleLower.includes('analyst') || 
        titleLower.includes('architect') || titleLower.includes('data') || titleLower.includes('tech') ||
        titleLower.includes('programmer') || titleLower.includes('software') || titleLower.includes('system') ||
        titleLower.includes('devops') || titleLower.includes('backend') || titleLower.includes('frontend') ||
        titleLower.includes('fullstack') || titleLower.includes('qa') || titleLower.includes('security')) {
      return 'technical';
    }
    
    // Creative roles - expanded categorization
    if (titleLower.includes('designer') || titleLower.includes('artist') || titleLower.includes('creative') ||
        titleLower.includes('writer') || titleLower.includes('content') || titleLower.includes('brand') ||
        titleLower.includes('visual') || titleLower.includes('graphic') || titleLower.includes('ux') ||
        titleLower.includes('ui') || titleLower.includes('photographer') || titleLower.includes('video') ||
        titleLower.includes('marketing') || titleLower.includes('advertising') || titleLower.includes('copywriter')) {
      return 'creative';
    }
    
    // Casual roles - expanded categorization  
    if (titleLower.includes('teacher') || titleLower.includes('coach') || titleLower.includes('community') ||
        titleLower.includes('support') || titleLower.includes('coordinator') || titleLower.includes('assistant') ||
        titleLower.includes('representative') || titleLower.includes('specialist') || titleLower.includes('trainer') ||
        titleLower.includes('mentor') || titleLower.includes('facilitator') || titleLower.includes('organizer') ||
        titleLower.includes('volunteer') || titleLower.includes('liaison') || titleLower.includes('advocate')) {
      return 'casual';
    }

    // Default to professional for leadership, business, consulting, sales, etc.
    return 'professional';
  }
}

export default AIService; 