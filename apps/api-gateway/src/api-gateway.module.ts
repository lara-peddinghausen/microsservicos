// Configurando um cliente para o microserviço de usuários no módulo do API Gateway, permitindo que o controller de usuários se comunique com o serviço de usuários via TCP.

import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ApiGatewayController } from './api-gateway.controller.js';

@Module({
  imports: [
    ClientsModule.register([  // O ClientsModule cria um cliente capaz de conversar com outro microserviço.
      {
        name: 'USERS_SERVICE',
        transport: Transport.TCP, // Define o TCP como protocolo de comunicação entre os serviços
        options: {
          host: 'localhost',
          port: 3001,
        },
      },
    ]),
  ],
  controllers: [ApiGatewayController],
})
export class ApiGatewayModule {}
