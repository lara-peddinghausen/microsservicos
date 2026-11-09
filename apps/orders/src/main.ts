/** 
 * Responsável por carregar as variáveis de ambiente, criar e iniciar 
 * o microsserviço de pedidos utilizando o protocolo TCP e configurar 
 * a validação global dos dados recebidos nas mensagens.
*/

import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ValidationPipe } from '@nestjs/common';
import { OrdersModule } from './orders.module.js';
import { RpcExceptionFilter } from '@app/contracts';

async function bootstrap() {
  const app =
    await NestFactory.createMicroservice<MicroserviceOptions>(
      OrdersModule,
      {
        transport: Transport.TCP,
        options: {  // // Configura o endereço e a porta em que o microsserviço receberá mensagens
          host: '127.0.0.1',
          port: 3002,
        },
      },
    );

  app.useGlobalFilters(new RpcExceptionFilter());

  app.useGlobalPipes(  // Configura a validação global dos dados recebidos nas mensagens
    new ValidationPipe({
      whitelist: true,  // Remove propriedades que não possuem decorators de validação nos DTOs
      transform: true,  // Permite transformar os dados recebidos nos tipos esperados
    }),
  );

  await app.listen();  // Inicia o microsserviço TCP com as configurações definidas
}

bootstrap();