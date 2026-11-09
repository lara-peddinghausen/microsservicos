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
  // Valida se o identificador informado é um número inteiro positivo
  if (!Number.isInteger(id) || id <= 0) {
    throw new RpcException({
      statusCode: 400,
      message: 'ID do usuário inválido',
    });
  }

  // Verifica se o usuário existe antes de tentar excluí-lo
  await this.findOne(id);

  // Consulta o Orders Service para verificar se o usuário possui pedidos
  const possuiPedidos = await firstValueFrom(
    this.ordersClient
      .send<boolean>('orders.existsByUser', id)
      .pipe(timeout(3000)),
  );

  // Bloqueia a exclusão quando existem pedidos vinculados
  if (possuiPedidos) {
    throw new RpcException({
      statusCode: 409,
      message: 'Não é possível excluir um usuário que possui pedidos cadastrados',
    });
  }

  // Exclui o usuário caso não existam pedidos vinculados
  return this.prisma.user.delete({
    where: { id },
  });
}
}
