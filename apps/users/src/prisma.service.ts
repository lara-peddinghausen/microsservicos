import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '../../../generated/users/client.js';
import { PrismaPg } from '@prisma/adapter-pg';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleDestroy {

  constructor() {
    const connectionString = process.env.USERS_DATABASE_URL;
    if (!connectionString) {
      throw new Error(
        'USERS_DATABASE_URL is not set. Check the project .env file or the service environment.',
      );
    }

    const adapter = new PrismaPg({
      connectionString,
    });

    super({ adapter });
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}