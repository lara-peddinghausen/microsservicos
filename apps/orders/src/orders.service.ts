/**
 * Serviço responsável pelas operações e regras de negócio de pedidos.
 *
 * Realiza a criação, listagem e busca de pedidos no banco de dados
 * utilizando o PrismaService.
 *
 * Antes de criar um pedido, consulta o microsserviço Users via TCP
 * para verificar se o usuário informado existe, evitando cadastrar
 * pedidos associados a usuários inválidos.
 */

import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { firstValueFrom, timeout } from 'rxjs';
import { PrismaService } from './prisma.service.js';
import { CreateOrderDto, UpdateOrderDto } from '@app/contracts';
import { randomUUID } from 'node:crypto';
import type { OrderCreatedEvent } from '@app/contracts';

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,

    @Inject('USERS_SERVICE')
    private readonly usersClient: ClientProxy,

  ) { }


  async create(data: CreateOrderDto) {

    // Consulta o microserviço de usuários para buscar o usuário pelo ID
    const user = await firstValueFrom(
      this.usersClient
        .send('users.findOne', data.userId) // Envia o ID do usuário e recebe um Observable como resposta
        .pipe(timeout(3000)), // Define um limite de 3 segundos para aguardar a resposta
    );

    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    // Inicia uma transação para salvar o pedido e o evento juntos
    const result = await this.prisma.$transaction(async (tx) => {

      // Salva o pedido no banco de dados
      const order = await tx.order.create({
        data: {
          userId: data.userId,
          description: data.description,
          total: data.total,
        },
      });

      // Cria o evento com os dados do pedido
      const event: OrderCreatedEvent = {
        eventId: randomUUID(), // Gera um identificador único para o acontecimento
        orderId: order.id,
        userId: order.userId,
        total: order.total.toString(),
        occurredAt: new Date().toISOString(), // Registra a data e hora de criação do evento em UTC
      };

      // Salva o evento na tabela OutboxEvent
      await tx.outboxEvent.create({
        data: {
          id: event.eventId,
          eventType: 'order.created',
          payload: { ...event },
        },
      });

      return order;
    });

    return result;
  }

  findAll() {
    return this.prisma.order.findMany();
  }

  async findOne(id: number) {
    const pedido = await this.prisma.order.findUnique({
      where: { id },
    });

    if (!pedido) {
      throw new RpcException({
        statusCode: 404,
        message: 'Pedido não encontrado',
      });
    }

    return pedido;
  }

  update(id: number, data: UpdateOrderDto) {
    return this.prisma.order.update({
      where: { id },
      data,
    });
  }

  remove(id: number) {
    return this.prisma.order.delete({
      where: { id },
    });
  }

  async findByUser(userId: number) {

    if (!Number.isInteger(userId) || userId <= 0) {
      throw new RpcException({
        statusCode: 400,
        message: 'ID do usuário inválido',
      });
    }

    await firstValueFrom(  // Consulta o Users Service para verificar se o usuário existe
      this.usersClient
        .send('users.findOne', userId)
        .pipe(timeout(3000)),
    );

    // Busca os pedidos associados ao usuário
    const pedidos = await this.prisma.order.findMany({
      where: { userId },
    });

    // Retorna uma mensagem e a lista de pedidos
    return {
      message: pedidos.length === 0
        ? 'Este usuário não possui pedidos cadastrados'
        : 'Pedidos encontrados com sucesso',
      pedidos,
    };
  }

  // Verifica se existe pelo menos um pedido associado ao usuário
  async existsByUser(userId: number): Promise<boolean> {
    const pedido = await this.prisma.order.findFirst({
      where: { userId },
      select: { id: true },
    });

    // Retorna true se encontrou um pedido e false caso contrário
    return pedido !== null;
  }
}