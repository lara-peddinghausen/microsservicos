// Módulo responsável por configurar a comunicação entre a API HTTP e o microsserviço de usuários.

import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { UsersController } from './users.controller.js';

@Module({
  imports: [ClientsModule.register([  // Registra um cliente para comunicação com o microsserviço
      {
        name: 'USERS_SERVICE',  // Nome do cliente que será usado para injetar o ClientProxy no controller
        transport: Transport.TCP,
        options: {
          host: 'localhost',
          port: 3001,
        },
      },
    ]),
  ],
  controllers: [UsersController] // Controller responsável por receber as requisições HTTP
})

export class UsersModule {}
