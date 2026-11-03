/**
 * Responsável por organizar os componentes do microsserviço de pedidos,
 * registrar a comunicação TCP com o microsserviço Users e disponibilizar
 * o controller e os serviços necessários para processar as operações
 * de pedidos e acessar o banco de dados.
 * 
 * O microsserviço Orders está configurado para se comunicar diretamente 
 * com Users.
 * Isso permite, por exemplo, que o OrdersService consulte o microsserviço
 * Users para verificar a existência de um usuário antes de criar um pedido, 
 * caso essa validação esteja implementada.
 */

import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { OrdersController } from './orders.controller.js';
import { OrdersService } from './orders.service.js';
import { PrismaService } from './prisma.service.js';

@Module({
  imports: [
    ClientsModule.register([  // Registra o cliente responsável pela comunicação com o microsserviço Users
      {
        name: 'USERS_SERVICE',  // Identificador utilizado para injetar o cliente de comunicação
        transport: Transport.TCP,
        options: {
          host: '127.0.0.1',
          port: 3001,
        },
      },
    ]),
  ],
  controllers: [OrdersController],  // Registra o controller responsável por receber as mensagens TCP de pedidos
  providers: [OrdersService, PrismaService],  // Registra os serviços responsáveis pelas operações de pedidos e acesso ao banco
})
export class OrdersModule {}
