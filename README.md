# Sistema de Agentes de IA

Este projeto implementa um sistema modular para criação, gerenciamento e execução de agentes de IA, seguindo os princípios SOLID e boas práticas de desenvolvimento com NestJS, TypeScript e arquitetura modular.

## 🚀 Tecnologias

- **Backend**: NestJS + TypeScript
- **ORM**: Prisma
- **Banco de Dados**: PostgreSQL
- **Mensageria**: RabbitMQ
- **Documentação**: Swagger
- **Validação**: class-validator / class-transformer
- **Containerização**: Docker + Kubernetes

## 📋 Funcionalidades

- Criação e gerenciamento de agentes de IA com papéis específicos
- Formação de equipes (crews) de agentes para execução de tarefas complexas
- Interface REST API para interação com os agentes
- Integração com RabbitMQ para processamento assíncrono de tarefas
- Suporte a múltiplos provedores de IA (OpenAI, Ollama)

## 🏗️ Arquitetura

O projeto segue uma arquitetura modular com separação clara de responsabilidades:

```
src/
├── @types/               # Definições de tipos globais
├── core/                 # Funcionalidades centrais
├── modules/              # Módulos da aplicação
│   └── agents/           # Módulo de gerenciamento de agentes
│       ├── controllers/  # Controladores HTTP e MQ
│       ├── dtos/         # Data Transfer Objects
│       ├── services/     # Serviços de caso de uso
│       └── tests/        # Testes unitários
└── shared/               # Componentes compartilhados
    ├── config/           # Configurações
    ├── providers/        # Provedores externos
    └── repositories/     # Acesso a dados
```

## 🚦 Fluxo de Trabalho dos Agentes

1. **Criação de Agentes**:
   - Cada agente tem um papel, objetivo e background específicos
   - Suporte a ferramentas personalizadas para cada agente

2. **Formação de Equipes (Crews)**:
   - Agentes podem ser agrupados em equipes para colaboração
   - Cada equipe tem um conjunto de tarefas definidas

3. **Execução de Tarefas**:
   - As tarefas são atribuídas a agentes específicos
   - Resultados são disponibilizados via API

## 💻 Exemplos de Uso

### Criação de um Agente

```typescript
// HTTP POST /agents
{
  "role": "Backend Developer",
  "goal": "Criar APIs RESTful eficientes usando NestJS",
  "backstory": "Especialista em desenvolvimento backend com NestJS e TypeScript",
  "tools": [
    {
      "name": "generateController",
      "description": "Gera um controller NestJS"
    }
  ]
}
```

### Criação de uma Equipe (Crew)

```typescript
// HTTP POST /agents/crews
{
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
      "id": "create-feature",
      "description": "Implementar funcionalidade de gerenciamento de usuários",
      "expectedOutput": "Código completo da API e interface"
    }
  ]
}
```

### Execução de Tarefa Backend

```typescript
// HTTP POST /agents/backend-task
{
  "resource": "users",
  "endpoints": ["getAll", "getById", "create", "update", "delete"],
  "methods": ["findAll", "findById", "create", "update", "remove"]
}
```

## ⚙️ Instalação e Configuração

### Pré-requisitos

- Node.js 18+
- PostgreSQL
- RabbitMQ
- Docker (opcional)

### Instalação

1. Clone o repositório
   ```bash
   git clone https://github.com/seu-usuario/sistema-agentes-ia.git
   cd sistema-agentes-ia
   ```

2. Instale as dependências
   ```bash
   npm install
   ```

3. Configure as variáveis de ambiente
   ```bash
   cp .env.example .env
   # Edite o arquivo .env com suas configurações
   ```

4. Execute as migrações do Prisma
   ```bash
   npx prisma migrate dev
   ```

5. Inicie a aplicação
   ```bash
   npm run start:dev
   ```

### Docker

```bash
# Construir a imagem
docker build -t sistema-agentes-ia .

# Executar o container
docker-compose up -d
```

## 📚 Documentação

A documentação da API está disponível através do Swagger:

```
http://localhost:3000/docs
```

## 🧪 Testes

```bash
# Testes unitários
npm run test

# Testes e2e
npm run test:e2e

# Cobertura de testes
npm run test:cov
```

## 📄 Licença

Este projeto está licenciado sob a licença MIT - veja o arquivo [LICENSE.md](LICENSE.md) para detalhes.

## 🤝 Contribuição

1. Faça o fork do projeto
2. Crie sua feature branch (`git checkout -b feature/amazing-feature`)
3. Commit suas mudanças (`git commit -m 'Add: amazing feature'`)
4. Push para a branch (`git push origin feature/amazing-feature`)
5. Abra um Pull Request