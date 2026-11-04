/** 
 * Responsável por receber as mensagens TCP enviadas pelo API Gateway
 * e encaminhar as solicitações ao OrdersService, onde são executadas
 * as operações relacionadas aos pedidos.
 * 
 * Utiliza padrões de mensagem para criar, listar e buscar pedidos por ID.
*/

import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { OrdersService } from './orders.service.js';
import { CreateOrderDto, UpdateOrderDto } from '@app/contracts';

@Controller()
export class OrdersController {
  constructor(
    private readonly ordersService: OrdersService, // Injeta o serviço responsável pelas operações de pedidos
  ) { }

  @MessagePattern('orders.create')  // Recebe a mensagem para criação de um novo pedido
  create(@Payload() data: CreateOrderDto) {  // @Payload(): extrai os dados enviados
    return this.ordersService.create(data);  // Extrai os dados da mensagem e os encaminha ao serviço
  }

  @MessagePattern('orders.findAll')
  findAll() {
    return this.ordersService.findAll();  // Solicita ao serviço a listagem dos pedidos
  }

  @MessagePattern('orders.findOne')
  findOne(@Payload() id: number) {
    return this.ordersService.findOne(id);  // Encaminha o ID recebido ao serviço para localizar o pedido
  }

  @MessagePattern('orders.update')
  update(
    @Payload()
    payload: { id: number; data: UpdateOrderDto },
  ) {
    return this.ordersService.update(
      payload.id,
      payload.data,
    );
  }

  @MessagePattern('orders.remove')
  remove(@Payload() id: number) {
    return this.ordersService.remove(id);
  }

  @MessagePattern('orders.findByUser')
  findByUser(@Payload() userId: number) {
    return this.ordersService.findByUser(userId);
  }

}
