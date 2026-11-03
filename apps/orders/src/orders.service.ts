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

import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, timeout } from 'rxjs';
import { PrismaService } from './prisma.service.js';
import { CreateOrderDto } from '@app/contracts';

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,

    @Inject('USERS_SERVICE')
    private readonly usersClient: ClientProxy,
  ) {}

  async create(data: CreateOrderDto) {
    // Consulta o microserviço de usuários para buscar o usuário pelo ID
    const user = await firstValueFrom(
      this.usersClient
        .send('users.findOne', data.userId) // Envia o ID do usuário e recebe um Observable como resposta
        .pipe(timeout(3000)),  // Define um limite de 3 segundos para aguardar a resposta para evitar que a operação aguarde indefinidamente
    );

    if (!user) {  // Impede a criação do pedido caso o usuário não seja encontrado
      throw new BadRequestException(
        'Usuário inválido',
      );
    }

    // Persiste o pedido no banco de Orders
    return this.prisma.order.create({
      data: {
        userId: data.userId,
        description: data.description,
        total: data.total,
      },
    });
  }

  findAll() { 
    return this.prisma.order.findMany();
  }

  findOne(id: number) {
    return this.prisma.order.findUnique({
      where: { id },
    });
  }
}