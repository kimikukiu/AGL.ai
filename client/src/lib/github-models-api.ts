/**
 * GitHub Models API - FREE LLM Access
 * Uses GitHub token to access models like GPT-4o-mini, Phi-3, Llama 3, etc.
 * NO COST - Uses your existing GitHub token ghp_...
 */

export interface GitHubModelMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface GitHubModelRequest {
  model: string;
  messages: GitHubModelMessage[];
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
}

export interface GitHubModelResponse {
  choices: {
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export class GitHubModelsAPI {
  private token: string;
  private baseUrl = 'https://models.inference.ai.azure.com/v1/chat/completions';

  constructor(token?: string) {
    // Try to get token from environment or use the one from .env
    this.token = token || import.meta.env.VITE_GITHUB_TOKEN || '';
  }

  /**
   * Generate content using GitHub Models (FREE)
   */
  async generateContent(
    prompt: string,
    options?: {
      model?: string;
      temperature?: number;
      maxTokens?: number;
      systemPrompt?: string;
    }
  ): Promise<string> {
    const {
      model = 'gpt-4o-mini', // Free via GitHub Models
      temperature = 0.7,
      maxTokens = 1000,
      systemPrompt = 'You are a helpful social media content creator. Create engaging, viral content.'
    } = options || {};

    try {
      const messages: GitHubModelMessage[] = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ];

      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`
        },
        body: JSON.stringify({
          model,
          messages,
          temperature,
          max_tokens: maxTokens,
          stream: false
        } as GitHubModelRequest)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`GitHub Models API error: ${response.status} - ${errorText}`);
      }

      const data: GitHubModelResponse = await response.json();
      return data.choices[0]?.message?.content || '';
    } catch (error) {
      console.error('GitHub Models API error:', error);
      throw error;
    }
  }

  /**
   * Generate social media post (Text, Image description, Video script, Reel idea)
   */
  async generateSocialPost(
    platform: 'instagram' | 'tiktok' | 'facebook' | 'twitter',
    contentType: 'text' | 'image_desc' | 'video_script' | 'reel_idea',
    topic: string,
    tone: 'casual' | 'professional' | 'funny' | 'inspirational' = 'casual'
  ): Promise<string> {
    const prompts = {
      text: `Create a ${tone} social media post for ${platform} about: ${topic}. Include relevant hashtags. Make it engaging and viral.`,
      image_desc: `Create a detailed image description/prompt for ${platform} about: ${topic}. Include visual details, style, mood, and composition.`,
      video_script: `Create a video script for ${platform} about: ${topic}. Include hook, main content, and call-to-action. Keep it under 60 seconds.`,
      reel_idea: `Generate 3 creative Reel ideas for ${platform} about: ${topic}. Include concept, visuals, music suggestion, and trending hooks.`
    };

    return this.generateContent(prompts[contentType], {
      systemPrompt: `You are a viral social media content creator specialized in ${platform}. Create engaging, trending content.`
    });
  }

  /**
   * Check if API is accessible
   */
  async healthCheck(): Promise<boolean> {
    try {
      await this.generateContent('test', { maxTokens: 10 });
      return true;
    } catch {
      return false;
    }
  }
}

// Export singleton instance
export const githubModelsAPI = new GitHubModelsAPI();

// Helper function to get API instance with token
export function getGitHubModelsAPI(token: string): GitHubModelsAPI {
  return new GitHubModelsAPI(token);
}
