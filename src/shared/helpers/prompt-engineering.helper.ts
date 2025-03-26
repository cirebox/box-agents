// src/shared/helpers/prompt-engineering.helper.ts
import { Injectable, Logger } from '@nestjs/common';
import { readFileSync } from 'fs';
import { join } from 'path';

/**
 * Interface para construção de prompt com Chain-of-Thought
 */
interface ChainOfThoughtOptions {
  question: string;
  steps?: string[];
  reasoning?: string;
  finalAnswer?: string;
}

/**
 * Tipo para templates predefinidos
 */
type PromptTemplate =
  | 'agent-creation'
  | 'code-generation'
  | 'code-analysis'
  | 'few-shot-learning'
  | 'chain-of-thought'
  | 'refactoring'
  | 'documentation-api'
  | 'documentation-class'
  | 'documentation-swagger'
  | 'backend-task'
  | 'frontend-task'
  | 'fullstack-task'
  | 'database-design';

/**
 * Helper para engenharia de prompts
 * Fornece métodos para construir prompts eficientes para modelos de IA
 * utilizando templates markdown externos
 */
@Injectable()
export class PromptEngineeringHelper {
  private readonly logger = new Logger(PromptEngineeringHelper.name);
  private readonly templateBasePath = join(
    process.cwd(),
    'src/shared/templates/prompts',
  );
  private templateCache: Map<string, string> = new Map();

  /**
   * Carrega um template de prompt do sistema de arquivos
   * @param templateName Nome do arquivo de template (sem extensão)
   * @returns Conteúdo do template
   */
  private loadTemplate(templateName: string): string {
    try {
      // Verificar se o template já está em cache
      if (this.templateCache.has(templateName)) {
        return this.templateCache.get(templateName)!;
      }

      // Carregar o template do arquivo
      const filePath = join(this.templateBasePath, `${templateName}.md`);
      const template = readFileSync(filePath, 'utf-8');

      // Adicionar ao cache para uso futuro
      this.templateCache.set(templateName, template);

      return template;
    } catch (error) {
      this.logger.error(
        `Error loading template ${templateName}: ${error.message}`,
      );
      throw new Error(`Failed to load prompt template: ${templateName}`);
    }
  }

  /**
   * Carrega um template predefinido e substitui as variáveis
   * @param templateName Nome do template predefinido
   * @param variables Variáveis para substituir no template
   * @returns Template com variáveis substituídas
   */
  getPromptFromTemplate(
    templateName: PromptTemplate,
    variables: Record<string, string>,
  ): string {
    try {
      let template = this.loadTemplate(templateName);

      // Substituir variáveis no formato {{variableName}}
      Object.entries(variables).forEach(([key, value]) => {
        const regex = new RegExp(`{{${key}}}`, 'g');
        template = template.replace(regex, value);
      });

      return template;
    } catch (error) {
      this.logger.error(
        `Error processing template ${templateName}: ${error.message}`,
      );
      throw error;
    }
  }

  /**
   * Constrói um prompt para criação de agentes usando template predefinido
   * @param role Papel do agente
   * @param goal Objetivo do agente
   * @param backstory História de fundo do agente
   * @param tools Ferramentas disponíveis para o agente (formatadas como markdown)
   * @returns Prompt formatado para criação de agente
   */
  buildAgentPrompt(
    role: string,
    goal: string,
    backstory: string,
    tools?: string,
  ): string {
    this.logger.debug(`Building agent prompt for role: ${role}`);

    return this.getPromptFromTemplate('agent-creation', {
      role,
      goal,
      backstory,
      tools: tools || '',
    });
  }

  /**
   * Constrói um prompt para geração de código usando template predefinido
   * @param task Descrição da tarefa
   * @param language Linguagem de programação
   * @param frameworks Frameworks formatados como markdown
   * @param requirements Requisitos formatados como markdown
   * @returns Prompt formatado para geração de código
   */
  buildCodeGenerationPrompt(
    task: string,
    language: string,
    frameworks: string = '',
    requirements: string = '',
  ): string {
    this.logger.debug(
      `Building code generation prompt for language: ${language}`,
    );

    return this.getPromptFromTemplate('code-generation', {
      task,
      language,
      frameworks,
      requirements,
    });
  }

  /**
   * Constrói um prompt para análise técnica usando template predefinido
   * @param codeSnippet Trecho de código para análise
   * @param analysisType Tipo de análise (segurança, performance, etc.)
   * @returns Prompt formatado para análise técnica
   */
  buildCodeAnalysisPrompt(
    codeSnippet: string,
    analysisType: 'security' | 'performance' | 'quality' | 'all' = 'all',
  ): string {
    this.logger.debug(
      `Building code analysis prompt for type: ${analysisType}`,
    );

    return this.getPromptFromTemplate('code-analysis', {
      codeSnippet,
      analysisType,
    });
  }

  /**
   * Constrói um prompt com exemplos de poucas amostras (few-shot learning)
   * @param task Descrição da tarefa
   * @param examples Exemplos formatados como markdown
   * @param newInput Nova entrada para processamento
   * @returns Prompt formatado com exemplos
   */
  buildFewShotPrompt(task: string, examples: string, newInput: string): string {
    this.logger.debug(`Building few-shot prompt with examples`);

    return this.getPromptFromTemplate('few-shot-learning', {
      task,
      examples,
      newInput,
    });
  }

  /**
   * Constrói um prompt com Chain-of-Thought para raciocínio passo a passo
   * @param options Opções para construção do prompt Chain-of-Thought
   * @returns Prompt formatado com Chain-of-Thought
   */
  buildChainOfThoughtPrompt(options: ChainOfThoughtOptions): string {
    this.logger.debug(`Building chain-of-thought prompt`);

    const steps = options.steps ? options.steps.join('\n') : '';

    return this.getPromptFromTemplate('chain-of-thought', {
      question: options.question,
      steps,
      reasoning: options.reasoning || '',
      finalAnswer: options.finalAnswer || '',
    });
  }

  /**
   * Constrói um prompt para refatoração de código usando template predefinido
   * @param originalCode Código original a ser refatorado
   * @param requirements Requisitos para a refatoração formatados como markdown
   * @returns Prompt formatado para refatoração de código
   */
  buildRefactoringPrompt(originalCode: string, requirements: string): string {
    this.logger.debug(`Building refactoring prompt`);

    return this.getPromptFromTemplate('refactoring', {
      originalCode,
      requirements,
    });
  }

  /**
   * Constrói um prompt para criação de documentação usando template predefinido
   * @param code Código para o qual gerar documentação
   * @param documentationType Tipo de documentação (API, classe, comentários, swagger)
   * @returns Prompt formatado para criação de documentação
   */
  buildDocumentationPrompt(
    code: string,
    documentationType: 'api' | 'class' | 'comments' | 'swagger' = 'comments',
  ): string {
    this.logger.debug(
      `Building documentation prompt for type: ${documentationType}`,
    );

    const templateName = `documentation-${documentationType}`;

    return this.getPromptFromTemplate(templateName as PromptTemplate, {
      code,
    });
  }

  /**
   * Constrói um prompt para tarefa de backend
   * @param resource Nome do recurso (ex: users, products)
   * @param endpoints Lista de endpoints formatados como markdown
   * @param methods Lista de métodos formatados como markdown
   * @returns Prompt formatado para tarefa de backend
   */
  buildBackendTaskPrompt(
    resource: string,
    endpoints: string,
    methods: string,
  ): string {
    this.logger.debug(`Building backend task prompt for resource: ${resource}`);

    return this.getPromptFromTemplate('backend-task', {
      resource,
      endpoints,
      methods,
    });
  }

  /**
   * Constrói um prompt para tarefa de frontend
   * @param feature Nome da feature
   * @param components Lista de componentes formatados como markdown
   * @param requirements Requisitos formatados como markdown
   * @returns Prompt formatado para tarefa de frontend
   */
  buildFrontendTaskPrompt(
    feature: string,
    components: string,
    requirements: string,
  ): string {
    this.logger.debug(`Building frontend task prompt for feature: ${feature}`);

    return this.getPromptFromTemplate('frontend-task', {
      feature,
      components,
      requirements,
    });
  }

  /**
   * Constrói um prompt para tarefa fullstack
   * @param feature Nome da feature
   * @param endpoints Lista de endpoints formatados como markdown
   * @param components Lista de componentes formatados como markdown
   * @returns Prompt formatado para tarefa fullstack
   */
  buildFullstackTaskPrompt(
    feature: string,
    endpoints: string,
    components: string,
  ): string {
    this.logger.debug(`Building fullstack task prompt for feature: ${feature}`);

    return this.getPromptFromTemplate('fullstack-task', {
      feature,
      endpoints,
      components,
    });
  }

  /**
   * Constrói um prompt para design de banco de dados
   * @param domain Descrição do domínio
   * @param entities Lista de entidades formatadas como markdown
   * @param relationships Relacionamentos formatados como markdown
   * @returns Prompt formatado para design de banco de dados
   */
  buildDatabaseDesignPrompt(
    domain: string,
    entities: string,
    relationships: string,
  ): string {
    this.logger.debug(`Building database design prompt for domain: ${domain}`);

    return this.getPromptFromTemplate('database-design', {
      domain,
      entities,
      relationships,
    });
  }
}
