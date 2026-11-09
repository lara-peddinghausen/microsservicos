
/**
 * Responsável por organizar os componentes do microsserviço de pedidos,
 * registrar a comunicação TCP com o microsserviço Users e disponibilizar
 * o controller e os serviços necessários para processar as operações
 * de pedidos e acessar o banco de dados.
 *
 * O microsserviço Orders está configurado para se comunicar diretamente
 * com Users e publicar eventos no RabbitMQ por meio do OutboxPublisher.
 */

import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ScheduleModule } from '@nestjs/schedule';
import { OrdersController } from './orders.controller.js';
import { OrdersService } from './orders.service.js';
import { PrismaService } from './prisma.service.js';
import { OutboxPublisher } from './outbox.publisher.js';

@Module({
  imports: [
    ScheduleModule.forRoot(), // Habilita a execução de tarefas agendadas com @Cron

    ClientsModule.register([
      {
        name: 'USERS_SERVICE', // Identificador utilizado para injetar o cliente de comunicação
        transport: Transport.TCP,
        options: {
          host: '127.0.0.1',
          port: 3001,
        },
      },
      {
        name: 'NOTIFICATIONS_CLIENT',
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URL!],
          queue: 'notifications_queue',
          queueOptions: {
            durable: true,
            arguments: {
              'x-dead-letter-exchange': 'notifications.dlx', // Exchange que recebe mensagens rejeitadas
              'x-dead-letter-routing-key': 'notifications.failed', // Chave de roteamento das mensagens com falha
            },
          },
          persistent: true, // Solicita a persistência das mensagens enviadas
        },
      },
    ]),
  ],

  controllers: [OrdersController], // Registra o controller responsável por receber as mensagens TCP de pedidos

  providers: [
    OrdersService, // Serviço responsável pelas operações de pedidos
    PrismaService, // Serviço responsável pelo acesso ao banco de dados
    OutboxPublisher, // Busca e publica os eventos pendentes no RabbitMQ
  ],
})
export class OrdersModule {}
