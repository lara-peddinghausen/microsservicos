//  Lógica da aplicação.
// UsersService não sabe que existe um Gateway. Ele conhece apenas sua própria regra de negócio e seu banco.

import { Injectable, Inject } from '@nestjs/common';
import { PrismaService } from './prisma.service.js';
import { CreateUserDto, UpdateUserDto } from '@app/contracts';
import { RpcException, ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, timeout } from 'rxjs';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,

    @Inject('ORDERS_SERVICE') // Injeta o cliente TCP para consultar o Orders Service
    private readonly ordersClient: ClientProxy,
  ) { }

  create(data: CreateUserDto) {
    return this.prisma.user.create({
      data,
    });
  }

  findAll() {
    // await new Promise((resolve) => setTimeout(resolve, 5000)); // Teste do timeout 
    return this.prisma.user.findMany();
  }

  async findOne(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new RpcException({
        statusCode: 404,
        message: 'Usuário não encontrado',
      });
    }

    return user;
  }

  update(id: number, data: UpdateUserDto) {
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  async remove(id: number) {
    // Verifica se o ID informado é um número inteiro positivo
    if (!Number.isInteger(id) || id <= 0) {
      throw new RpcException({
        statusCode: 400,
        message: 'ID do usuário inválido',
      });
    }

    await this.findOne(id);  // Verifica se o usuário existe antes de tentar excluí-lo

    // Consulta o Orders Service para verificar os pedidos vinculados ao usuário
    let resposta: unknown;

    try {
      resposta = await firstValueFrom(
        this.ordersClient
          .send('orders.findByUser', id)
          .pipe(timeout(3000)),
      );

      console.log('Resposta recebida do Orders Service:', resposta);

    } catch (error) {
      console.error('Erro recebido pelo Users Service:', error);
      throw error;
    }

    // A consulta pode retornar um objeto contendo a lista de pedidos
    const pedidos = Array.isArray(resposta)
      ? resposta
      : (resposta as { pedidos: unknown[] }).pedidos;

    // Impede a exclusão caso existam pedidos associados ao usuário
    if (pedidos.length > 0) {
      throw new RpcException({
        statusCode: 409,
        message: 'Não é possível excluir um usuário que possui pedidos cadastrados',
      });
    }

    // Exclui o usuário somente quando não existem pedidos vinculados
    return this.prisma.user.delete({
      where: { id },
    });
  }
}
