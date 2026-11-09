
import { Injectable, Inject, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

import { PrismaService } from './prisma.service.js';

@Injectable()
export class OutboxPublisher {

  // Logger para registrar informações e erros no terminal
  private readonly logger = new Logger(OutboxPublisher.name);

  constructor(
    // Permite acessar a tabela OutboxEvent pelo Prisma
    private readonly prisma: PrismaService,

    // Injeta o cliente responsável pela comunicação com o RabbitMQ
    @Inject('NOTIFICATIONS_CLIENT')
    private readonly client: ClientProxy,
  ) {}

  // Executa automaticamente a cada 5 segundos
  // waitForCompletion impede execuções simultâneas deste cron
  @Cron('*/5 * * * * *', {
    waitForCompletion: true,
  })
  async publishPendingEvents() {

    // Busca até 20 eventos que ainda não foram publicados
    const events = await this.prisma.outboxEvent.findMany({
      where: { publishedAt: null }, // Seleciona apenas eventos pendentes
      orderBy: { createdAt: 'asc' }, // Prioriza os eventos mais antigos
      take: 20, // Limita a quantidade de eventos por execução
    });

    // Percorre os eventos pendentes para publicá-los
    for (const event of events) {
      try {

        // Publica o evento no RabbitMQ utilizando seu tipo e conteúdo
        await firstValueFrom(
          this.client.emit(
            event.eventType, // Exemplo: 'order.created'
            event.payload, // Dados do evento armazenados no banco
          ),
        );

        // Marca o evento como publicado no banco de dados
        await this.prisma.outboxEvent.update({
          where: { id: event.id },
          data: { publishedAt: new Date() },
        });

        // Registra no terminal que o evento foi publicado
        this.logger.log(
          `Evento ${event.id} publicado`,
        );

      } catch (error) {

        // Registra a falha e mantém o evento pendente para uma nova tentativa
        this.logger.error(
          `Erro ao publicar evento ${event.id}`,
        );
      }
    }
  }
}
