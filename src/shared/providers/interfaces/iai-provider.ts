// src/shared/providers/interfaces/iai-provider.ts
export interface IAIProvider {
  generateText(prompt: string, options?: Record<string, any>): Promise<string>;
  generateCode(
    prompt: string,
    language: string,
    options?: Record<string, any>,
  ): Promise<string>;
  getModelInfo(): Record<string, any>;
}
