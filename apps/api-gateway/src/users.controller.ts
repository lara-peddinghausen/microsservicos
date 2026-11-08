/**
 * Responsável por receber as requisições HTTP relacionadas aos
 * usuários e encaminhá-las ao microsserviço Users por meio do protocolo TCP.
 */

import { Body, Controller, Delete, Get, Inject, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { CreateUserDto, UpdateUserDto } from '@app/contracts';
import { RpcClientService } from './common/rpc-client.service.js';

@Controller('users')
export class UsersController {
  constructor(
    @Inject('USERS_SERVICE')
    private readonly client: ClientProxy,
    private readonly rpcClient: RpcClientService,
  ) { }

  @Post()
  create(@Body() dto: CreateUserDto) {
    return this.rpcClient.send(
      this.client,
      'users.create',
      dto
    );
  }

  @Get()
  findAll() {
    return this.rpcClient.send(
      this.client,
      'users.findAll',
      {}
    );
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.rpcClient.send(
      this.client,
      'users.findOne',
      id
    );
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUserDto,
  ) {
    return this.rpcClient.send(
      this.client,
      'users.update', {
      id,
      data: dto,
    });
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.rpcClient.send(
      this.client,
      'users.remove',
      id);
  }
}