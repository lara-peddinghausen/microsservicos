import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ValidationPipe } from '@nestjs/common';
import { UsersModule } from './users.module.js';
import { RpcExceptionFilter } from '@app/contracts';

async function bootstrap() {
  const app =
    await NestFactory.createMicroservice<MicroserviceOptions>(
      UsersModule,
      {
        transport: Transport.TCP,
        options: {
          host: '127.0.0.1',
          port: 3001,
        },
      },
    );

  app.useGlobalFilters(new RpcExceptionFilter());

  app.useGlobalPipes(
    new ValidationPipe({ // valida DTOs nas fronteiras de entrada, mas é necessário garantir que os DTOs estejam disponíveis como classes em tempo de execução
      whitelist: true,
      transform: true,
    }),
  );

  await app.listen();
}

bootstrap();