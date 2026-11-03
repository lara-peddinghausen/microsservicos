// Responsável por criar e iniciar a aplicação NestJS

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module.js';

// Função responsável pela inicialização da aplicação
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(  // Configura a validação global dos dados recebidos nas mensagens
    new ValidationPipe({
      whitelist: true,  // Remove propriedades que não possuem decorators de validação nos DTOs
      transform: true,  // Permite transformar os dados recebidos nos tipos esperados
    }),
  );

  await app.listen(3000);  // Inicia o servidor HTTP na porta 3000
}

bootstrap();
