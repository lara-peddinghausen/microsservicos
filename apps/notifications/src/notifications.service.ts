import { Injectable, Logger } from '@nestjs/common';
import type { OrderCreatedEvent } from '@app/contracts';
import { PrismaService } from './prisma.service.js';

@Injectable()
export class NotificationsService {
  private readonly logger =
    new Logger(NotificationsService.name); // Cria um logger identificado pelo nome da classe

  constructor(private readonly prisma: PrismaService) {} // Injeta o PrismaService para acessar o banco

  // Método responsável por processar a notificação de um pedido
  async sendOrderNotification(data: OrderCreatedEvent) {

    // Executa o registro do evento e o processamento em uma transação
    const result = await this.prisma.$transaction(async (tx) => {

      // Tenta registrar o evento, ignorando identificadores já existentes
      const inserted = await tx.processedEvent.createMany({
        data: [{ eventId: data.eventId }],
        skipDuplicates: true,
      });

      // Se o evento já estiver registrado, não processa novamente
      if (inserted.count === 0) {
        return { duplicate: true };
      }

      // Simula uma falha quando o total do pedido for 9999
      if (data.total === '9999') {
        throw new Error('Falha simulada');
      }

      // Registra as informações da notificação no terminal
      this.logger.log(
        `Notificação do pedido ${data.orderId}`,
      );

      this.logger.log(
        `Usuário: ${data.userId}`,
      );

      this.logger.log(
        `Total: R$ ${data.total}`,
      );

      // Futuramente:
      // await this.emailService.send(...);

      return { duplicate: false };
    });

    // Informa quando um evento já foi processado anteriormente
    if (result.duplicate) {
      this.logger.warn(
        `Evento ${data.eventId} já processado. Ignorando.`,
      );
    }

    return { success: true }; // Retorna uma confirmação de que o evento foi tratado
  }
}