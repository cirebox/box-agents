// src/shared/providers/implementations/openai-provider.ts
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IAIProvider } from '../interfaces/iai-provider';
import OpenAI from 'openai';

@Injectable()
export class OpenAIProvider implements IAIProvider {
  private readonly client: OpenAI;
  private readonly logger = new Logger(OpenAIProvider.name);
  private readonly defaultModel: string;

  constructor(private configService: ConfigService) {
    this.client = new OpenAI({
      apiKey: this.configService.get<string>('OPENAI_API_KEY'),
    });
    this.defaultModel =
      this.configService.get<string>('OPENAI_MODEL') || 'gpt-4-0125-preview';
  }

  async generateText(
    prompt: string,
    options?: Record<string, any>,
  ): Promise<string> {
    try {
      const completion = await this.client.chat.completions.create({
        model: options?.model || this.defaultModel,
        messages: [{ role: 'user', content: prompt }],
        temperature: options?.temperature || 0.7,
        max_tokens: options?.maxTokens || 2000,
      });

      return completion.choices[0].message.content || '';
    } catch (error) {
      this.logger.error(`Error generating text with OpenAI: ${error.message}`);
      throw error;
    }
  }

  async generateCode(
    prompt: string,
    language: string,
    options?: Record<string, any>,
  ): Promise<string> {
    const codePrompt = `Generate ${language} code for the following task. Return ONLY the code without explanations or markdown:\n\n${prompt}`;

    return this.generateText(codePrompt, {
      ...options,
      temperature: options?.temperature || 0.2, // Lower temperature for code generation
    });
  }

  getModelInfo(): Record<string, any> {
    return {
      provider: 'openai',
      model: this.defaultModel,
      capabilities: ['text', 'code', 'reasoning'],
    };
  }
}
