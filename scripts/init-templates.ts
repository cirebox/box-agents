import * as fs from 'fs';
import * as path from 'path';

/**
 * Script para inicializar a estrutura de diretórios dos templates de prompts
 */

const TEMPLATE_DIR = path.join(process.cwd(), 'src/shared/templates/prompts');

// Criar diretório de templates se não existir
if (!fs.existsSync(TEMPLATE_DIR)) {
  console.log(`Creating template directory: ${TEMPLATE_DIR}`);
  fs.mkdirSync(TEMPLATE_DIR, { recursive: true });
}

// Verificar se os templates existem e criar templates vazios se necessário
const requiredTemplates = [
  'agent-creation.md',
  'code-generation.md',
  'code-analysis.md',
  'few-shot-learning.md',
  'chain-of-thought.md',
  'refactoring.md',
  'documentation-api.md',
  'documentation-class.md',
  'documentation-swagger.md',
  'documentation-comments.md',
  'backend-task.md',
  'frontend-task.md',
  'fullstack-task.md',
  'database-design.md',
];

// Criar arquivo placeholder para templates que não existem
for (const template of requiredTemplates) {
  const templatePath = path.join(TEMPLATE_DIR, template);
  if (!fs.existsSync(templatePath)) {
    console.log(`Creating placeholder template: ${template}`);
    fs.writeFileSync(
      templatePath,
      `# ${template.replace('.md', '').replace(/-/g, ' ').toUpperCase()}\n\nThis is a placeholder template. Please replace with proper content.\n\n## Available variables\n\n// TODO: Add variables used in this template`,
      'utf8'
    );
  }
}

console.log('Template initialization completed successfully!');