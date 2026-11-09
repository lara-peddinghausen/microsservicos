// Responsável por configurar a comunicação com os microsserviços de usuários e pedidos

import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { UsersController } from './users.controller.js';
import { OrdersController } from './orders.controller.js';
import { RpcClientService } from './common/rpc-client.service.js';

// Módulo principal do API Gateway
@Module({
  imports: [
    ClientsModule.register([  // Registra os clientes responsáveis pela comunicação com os microsserviços
      {
        name: 'USERS_SERVICE',  // Identificador utilizado para acessar o microsserviço de usuários
        transport: Transport.TCP,  // Define o protocolo TCP para comunicação entre os serviços
        options: {
          host: '127.0.0.1',
          port: 3001,
        },
      },
      {
        name: 'ORDERS_SERVICE',  // Identificador utilizado para acessar o microsserviço de pedidos
        transport: Transport.TCP,
        options: {
          host: '127.0.0.1',
          port: 3002,
        },
      },
    ]),
  ],
  controllers: [  // Controllers responsáveis por receber as requisições HTTP no API Gateway
    UsersController,
    OrdersController,
  ],
  providers: [RpcClientService],
})
export class AppModule {}