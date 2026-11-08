/**
 * Responsável por receber as requisições HTTP relacionadas aos 
 * pedidos e encaminhá-las ao microsserviço Orders por meio do 
 * protocolo TCP.
 */

import { Body, Controller, Get, Inject, Param, ParseIntPipe, Post, Patch, Delete } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { CreateOrderDto, UpdateOrderDto } from '@app/contracts';
import { RpcClientService } from './common/rpc-client.service.js';

@Controller('orders') // Rota base
export class OrdersController {
  constructor(
    @Inject('ORDERS_SERVICE')  // Injeta o cliente TCP configurado para comunicação com o microsserviço
    private readonly client: ClientProxy,
    private readonly rpcClient: RpcClientService,
  ) { }

  @Post()
  create(@Body() dto: CreateOrderDto) {
    return this.rpcClient.send(  // Envia os dados do DTO ao microsserviço utilizando o padrão de mensagem 'orders.create'
      this.client,
      'orders.create',
      dto,
    );
  }

  @Get()
  findAll() {
    return this.rpcClient.send(
      this.client,
      'orders.findAll',
      {},
    );
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.rpcClient.send(
      this.client,
      'orders.findOne',
      id,
    );
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateOrderDto,
  ) {
    return this.rpcClient.send(
      this.client,
      'orders.update', {
      id,
      data: dto,
    });
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.rpcClient.send(
      this.client,
      'orders.remove',
      id
    );
  }

  @Get('user/:userId')   // GET http://localhost:3000/orders/user/1
  findByUser(
    @Param('userId', ParseIntPipe) userId: number,
  ) {
    return this.rpcClient.send(
      this.client,
      'orders.findByUser',
      userId,
    );
  }
}