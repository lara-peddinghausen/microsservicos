//  Lógica da aplicação.
// UsersService não sabe que existe um Gateway. Ele conhece apenas sua própria regra de negócio e seu banco.

import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service.js';
import { CreateUserDto, UpdateUserDto } from '@app/contracts';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) { }

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

  remove(id: number) {
    return this.prisma.user.delete({
      where: { id },
    });
  }
}
