// Módulo responsável por organizar os componentes do microsserviço Users

import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { UsersController } from './users.controller.js';
import { UsersService } from './users.service.js';
import { PrismaService } from './prisma.service.js';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'ORDERS_SERVICE',  // Identificador do cliente TCP para comunicação com Orders
        transport: Transport.TCP,  // Protocolo utilizado na comunicação entre os microsserviços
        options: {
          host: '127.0.0.1',
          port: 3002,  // Porta do Orders Service
        },
      },
    ]),
  ],
  controllers: [UsersController],
  providers: [UsersService, PrismaService],
})
export class UsersModule {}