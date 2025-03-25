import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { SwaggerConfig } from './swagger.interface';

export function createSwaggerDocumentation(
  path: string,
  app: INestApplication,
  config: SwaggerConfig,
): void {
  const builder = new DocumentBuilder()
    .setTitle(config.title)
    .setDescription(config.description ?? '')
    .setVersion(config.version ?? '')
    .addServer(`http://localhost:${process.env.HTTP_PORT ?? 3000}`)
    // .setContact('Cirebox', 'https://cirebox.com.br', '')
    // .addCookieAuth('auth-cookie', {
    //   type: 'apiKey',
    //   in: 'cookie',
    //   name: 'auth-cookie', // Nome do cookie
    // })
    .addBearerAuth(
      {
        type: 'apiKey',
        scheme: 'Bearer',
        bearerFormat: 'JWT',
        name: 'authorization',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT',
    );

  if (config.tags) {
    for (const tag of config.tags) {
      builder.addTag(tag);
    }
  }

  if (config.externalFilePath)
    builder.setExternalDoc('Export to json file', config.externalFilePath);

  const options = builder.build();
  const document = SwaggerModule.createDocument(app, options);

  SwaggerModule.setup(path, app, document, {
    customSiteTitle: config.title,
    jsonDocumentUrl: config.externalFilePath, // URL do arquivo JSON da documentação
    // customCssUrl: 'assets/swagger-github-dark.css', // Certifique-se de que este caminho esteja correto
    // customfavIcon: 'assets/favicon.png',
    // explorer: true, // Permite a exploração de diferentes endpoints na interface
    swaggerOptions: {
      docExpansion: 'none', // Expande ou colapsa as seções na UI ('none', 'list', 'full')
      filter: config.filter ?? true, // Adiciona um campo de busca para filtrar os endpoints
      tagsSorter: 'alpha', // Ordena as tags em ordem alfabética
      operationsSorter: 'alpha', // Ordena as operações (endpoints) em ordem alfabética
      displayRequestDuration: true, // Mostra a duração da requisição nas respostas da API
      // defaultModelsExpandDepth: -1,   // Oculta a seção de modelos por padrão
    },
  });
}
