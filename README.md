# Sistema de Agentes de IA

Um sistema modular para criação, gerenciamento e execução de agentes de IA, seguindo os princípios SOLID e boas práticas de desenvolvimento com NestJS, TypeScript e arquitetura modular.

![Versão](https://img.shields.io/badge/versão-0.0.1-blue.svg)
![Node](https://img.shields.io/badge/node-v18.18.0+-green.svg)
![NestJS](https://img.shields.io/badge/nestjs-v11.0.0-red.svg)

## 🚀 Tecnologias

- **Backend**: NestJS + TypeScript
- **ORM**: Prisma
- **Banco de Dados**: PostgreSQL
- **Mensageria**: RabbitMQ
- **Documentação**: Swagger
- **Validação**: class-validator / class-transformer
- **IA**: OpenAI API, Ollama
- **Containerização**: Docker + Kubernetes

## 📋 Funcionalidades

- **Criação e Gerenciamento de Agentes**:
  - Definição de agentes especializados com papéis específicos
  - Configuração de objetivos e contexto para cada agente
  - Personalização com ferramentas específicas para cada necessidade
  
- **Equipes de Agentes (Crews)**:
  - Formação de equipes colaborativas para tarefas complexas
  - Delegação e coordenação entre agentes
  - Execução paralela ou sequencial de subtarefas

- **Tarefas Especializadas**:
  - Tarefas de desenvolvimento backend
  - Tarefas de desenvolvimento frontend
  - Tarefas fullstack integradas
  - Análise e design de banco de dados

- **Integrações**:
  - Suporte a múltiplos provedores de IA (OpenAI, Ollama)
  - Interface REST API para interação
  - Processamento assíncrono via RabbitMQ
  - Webhooks para notificações de eventos

## 🏗️ Arquitetura

O projeto segue uma arquitetura modular com clara separação de responsabilidades, seguindo o padrão recomendado para aplicações NestJS:

```
src/
├── @types/               # Definições de tipos globais
├── core/                 # Funcionalidades centrais e decoradores
├── modules/              # Módulos da aplicação
│   └── agents/           # Módulo de gerenciamento de agentes
│       ├── controllers/  # Controladores HTTP e MQ
│       ├── dtos/         # Data Transfer Objects
│       ├── services/     # Serviços de caso de uso
│       └── tests/        # Testes unitários
└── shared/               # Componentes compartilhados
    ├── config/           # Configurações
    ├── helpers/          # Helpers utilitários
    ├── providers/        # Provedores externos (IA, etc)
    └── repositories/     # Acesso a dados
```

## ⚙️ Requisitos e Instalação

### Pré-requisitos

- Node.js 18.18.0+
- PostgreSQL 13+
- RabbitMQ 3.8+
- Docker (opcional)

### Instalação

1. Clone o repositório:
   ```bash
   git clone https://github.com/seu-usuario/sistema-agentes-ia.git
   cd sistema-agentes-ia
   ```

2. Instale as dependências:
   ```bash
   npm install --legacy-peer-deps
   ```

3. Configure as variáveis de ambiente:
   ```bash
   cp .env.example .env
   # Edite o arquivo .env com suas configurações
   ```

4. Execute as migrações do Prisma:
   ```bash
   npx prisma migrate dev
   ```

5. Inicie a aplicação:
   ```bash
   npm run start:dev
   ```

### Utilizando Docker

```bash
# Construir e iniciar os containers
docker-compose up -d

# Executar migrações
docker-compose exec app npx prisma migrate dev
```

## 🚦 Início Rápido

### 1. Criar um Agente

```bash
curl -X POST http://localhost:3000/agents \
  -H "Content-Type: application/json" \
  -d '{
    "role": "Backend Developer",
    "goal": "Criar APIs RESTful eficientes usando NestJS",
    "backstory": "Especialista em desenvolvimento backend com NestJS e TypeScript",
    "tools": [
      {
        "name": "generateController",
        "description": "Gera um controller NestJS"
      }
    ]
  }'
```

### 2. Criar uma Equipe (Crew)

```bash
curl -X POST http://localhost:3000/agents/crews \
  -H "Content-Type: application/json" \
  -d '{
    "agents": [
      {
        "role": "Backend Developer",
        "goal": "Criar APIs NestJS",
        "backstory": "Especialista em NestJS"
      },
      {
        "role": "Frontend Developer",
        "goal": "Desenvolver interfaces com React",
        "backstory": "Especialista em React e Next.js"
      }
    ],
    "tasks": [
      {
        "description": "Implementar funcionalidade de gerenciamento de usuários",
        "expectedOutput": "Código completo da API e interface"
      }
    ]
  }'
```

### 3. Executar Tarefa Backend

```bash
curl -X POST http://localhost:3000/agents/backend-task \
  -H "Content-Type: application/json" \
  -d '{
    "resource": "users",
    "endpoints": ["getAll", "getById", "create", "update", "delete"],
    "methods": ["findAll", "findById", "create", "update", "remove"]
  }'
```

## 📚 Documentação da API

A documentação completa da API está disponível através do Swagger:

```
http://localhost:3000/docs
```

Para acessar a documentação, utilize as credenciais definidas na variável de ambiente `DOCS_USER`.

## 🧪 Testes

```bash
# Testes unitários
npm run test

# Testes e2e
npm run test:e2e

# Cobertura de testes
npm run test:cov
```

## 🛠️ Comandos Úteis

```bash
# Verificação de tipos TypeScript
npm run type-check

# Formatar código
npm run format

# Lint
npm run lint

# Compilar para produção
npm run build

# Rodar em produção
npm run start:prod
```

## 🤝 Contribuição

1. Faça o fork do projeto
2. Crie sua feature branch (`git checkout -b feature/amazing-feature`)
3. Commit suas mudanças (`git commit -m 'Add: amazing feature'`)
4. Push para a branch (`git push origin feature/amazing-feature`)
5. Abra um Pull Request

### Padrões de Commit

Este projeto segue o padrão de commits convencionais. Utilize os prefixos:

- `feat:` Nova funcionalidade
- `fix:` Correção de bug
- `docs:` Documentação
- `style:` Formatação de código
- `refactor:` Refatoração
- `test:` Testes
- `chore:` Tarefas de build, config, etc

## 📄 Licença

Este projeto está licenciado sob a licença MIT - veja o arquivo [LICENSE.md](LICENSE.md) para detalhes.

## 🔮 Roadmap

- [ ] Suporte a mais modelos de IA
- [ ] Interface web para gerenciamento de agentes
- [ ] Sistema de permissões e autenticação
- [ ] Integração com ferramentas externas (GitHub, Jira, etc)
- [ ] Suporte a agentes com memória persistente
- [ ] Melhorias na delegação entre agentes
- [ ] Histórico de execuções e análise de desempenho