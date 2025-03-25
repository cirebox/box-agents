// src/shared/providers/implementations/ollama-provider.ts
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IAIProvider } from '../interfaces/iai-provider';
import axios from 'axios';

@Injectable()
export class OllamaProvider implements IAIProvider {
  private readonly baseUrl: string;
  private readonly logger = new Logger(OllamaProvider.name);
  private readonly defaultModel: string;

  constructor(private configService: ConfigService) {
    this.baseUrl =
      this.configService.get<string>('OLLAMA_BASE_URL') ||
      'http://localhost:11434';
    this.defaultModel =
      this.configService.get<string>('OLLAMA_MODEL') || 'llama3';
  }

  async generateText(
    prompt: string,
    options?: Record<string, any>,
  ): Promise<string> {
    try {
      const response = await axios.post(`${this.baseUrl}/api/generate`, {
        model: options?.model || this.defaultModel,
        prompt: prompt,
        options: {
          temperature: options?.temperature || 0.7,
          num_predict: options?.maxTokens || 2000,
        },
        stream: false,
      });

      return response.data.response || '';
    } catch (error) {
      this.logger.error(`Error generating text with Ollama: ${error.message}`);
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
      provider: 'ollama',
      model: this.defaultModel,
      capabilities: ['text', 'code', 'reasoning'],
    };
  }
}
