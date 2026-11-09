import 'dotenv/config';

import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { NotificationsModule } from './notifications.module.js';

async function bootstrap() {
  const app =
    await NestFactory.createMicroservice<MicroserviceOptions>(
      NotificationsModule,
      {
        transport: Transport.RMQ,   // Define o RabbitMQ como meio de comunicação do microsserviço
        options: {
          urls: [process.env.RABBITMQ_URL!],  // urls: Endereço do broker. Obtém a URL de conexão com o RabbitMQ a partir do .env
          queue: 'notifications_queue',  // Define a fila que receberá as mensagens destinadas ao microsserviço
          queueOptions: {
            durable: true, // Mantém a fila após a reinicialização do RabbitMQ
            arguments: {
              'x-dead-letter-exchange': 'notifications.dlx', // Exchange que recebe mensagens rejeitadas
              'x-dead-letter-routing-key': 'notifications.failed', // Chave utilizada para encaminhar mensagens rejeitadas à DLQ
            },
          },
          noAck: false,  // Exige confirmação manual de que a mensagem foi processada
          prefetchCount: 1,  // Limita a uma mensagem não confirmada por vez para cada consumidor
        },
      },
    );

  await app.listen();  // Inicia o microsserviço e começa a consumir mensagens da fila
}

bootstrap();