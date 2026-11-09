import { Controller } from '@nestjs/common';
import { EventPattern, Payload, Ctx, RmqContext } from '@nestjs/microservices';
import { NotificationsService } from './notifications.service.js';
import type { OrderCreatedEvent } from '@app/contracts';

@Controller()
export class NotificationsController {
  constructor(
    private readonly notificationsService: NotificationsService,
  ) { }

  @EventPattern('order.created')  // Indica que o método processa eventos com esse padrão.
  async handleOrderCreated(
    @Payload() data: OrderCreatedEvent, // Extrai os dados do evento seguindo o contrato compartilhado
    @Ctx() context: unknown,   // Obtém o contexto da mensagem recebida pelo RabbitMQ
  ) {
    // Verifica se o contexto recebido pertence ao RabbitMQ
    if (!(context instanceof RmqContext)) {
      throw new Error('Contexto RabbitMQ inválido');
    }

    const channel = context.getChannelRef();  // Obtém o canal de comunicação com o RabbitMQ
    const message = context.getMessage();  // Obtém a mensagem original recebida da fila

    try {
      await this.notificationsService.sendOrderNotification(data);  // Chama o serviço responsável por processar a notificação

      channel.ack(message);  // Confirma que a mensagem foi processada
    } catch (error) {
      channel.nack(message, false, false);  // Rejeita a mensagem sem recolocá-la na fila
      throw error;
    }
  }
}