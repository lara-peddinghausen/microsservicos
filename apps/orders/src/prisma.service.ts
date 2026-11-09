/**
 * Serviço responsável pela conexão do microsserviço Orders com o banco de dados.
 *
 * Estende o PrismaClient para disponibilizar os métodos de acesso ao
 * banco PostgreSQL, utilizando o adaptador PrismaPg.
 *
 * Obtém a string de conexão a partir da variável de ambiente
 * ORDERS_DATABASE_URL e encerra a conexão quando o módulo é destruído.
 */

import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '../../../generated/orders/client.js';
import { PrismaPg } from '@prisma/adapter-pg';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleDestroy {

  constructor() {
    const connectionString = process.env.ORDERS_DATABASE_URL;
    if (!connectionString) {  // Impede a inicialização caso a variável de ambiente não esteja configurada
      throw new Error(
        'ORDERS_DATABASE_URL is not set. Check the project .env file or the service environment.',
      );
    }

    const adapter = new PrismaPg({  // Configura o adaptador responsável pela comunicação com o PostgreSQL
      connectionString,
    });

    super({ adapter });  // Inicializa o PrismaClient utilizando o adaptador configurado
  }

  async onModuleDestroy() {  // Encerra as conexões do Prisma quando o módulo é destruído
    await this.$disconnect();
  }
}