import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import { UsersModule } from './users.module.js';

// Função responsável por inicializar o microsserviço
async function bootstrap() {
  const app = await NestFactory.createMicroservice(UsersModule, {  // Cria uma aplicação NestJS configurada como microsserviço, em vez de uma API HTTP tradicional.
    transport: Transport.TCP,  // Define o TCP como protocolo de comunicação
    options: {
      host: 'localhost',
      port: 3001,
    },
  });

  await app.listen();   // Inicia o microsserviço e aguarda conexões
} 

bootstrap();
