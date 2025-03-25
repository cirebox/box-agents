// src/shared/providers/ai-provider.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AIModelsConfig } from '../config/ai-models.config';
import { OpenAIProvider } from './implementations/openai-provider';
import { OllamaProvider } from './implementations/ollama-provider';
import { AIProviderFactory } from './ai-provider.factory';

@Module({
  imports: [ConfigModule],
  providers: [
    AIModelsConfig,
    OpenAIProvider,
    OllamaProvider,
    AIProviderFactory,
  ],
  exports: [AIModelsConfig, OpenAIProvider, OllamaProvider, AIProviderFactory],
})
export class AIProviderModule {}
