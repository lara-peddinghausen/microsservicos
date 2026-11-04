/**
 * Responsável por receber as requisições HTTP relacionadas aos 
 * pedidos e encaminhá-las ao microsserviço Orders por meio do 
 * protocolo TCP.
 */

import { Body, Controller, Get, Inject, Param, ParseIntPipe, Post, Patch, Delete } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { CreateOrderDto, UpdateOrderDto } from '@app/contracts';

@Controller('orders') // Rota base
export class OrdersController {
  constructor(
    @Inject('ORDERS_SERVICE')  // Injeta o cliente TCP configurado para comunicação com o microsserviço
    private readonly client: ClientProxy,
  ) { }

  @Post()
  create(@Body() dto: CreateOrderDto) {
    return this.client.send(  // Envia os dados do DTO ao microsserviço utilizando o padrão de mensagem 'orders.create'
      'orders.create',
      dto,
    );
  }

  @Get()
  findAll() {
    return this.client.send(
      'orders.findAll',
      {},
    );
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.client.send(
      'orders.findOne',
      id,
    );
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateOrderDto,
  ) {
    return this.client.send('orders.update', {
      id,
      data: dto,
    });
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.client.send('orders.remove', id);
  }

  @Get('user/:userId')  // GET http://localhost:3000/orders/user/1
  findByUser(@Param('userId') userId: string) {
    return this.client.send(
      'orders.findByUser',
      Number(userId),
    );
  }
}