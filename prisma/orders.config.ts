import 'dotenv/config';
import { defineConfig, env } from 'prisma/config';

export default defineConfig({
  schema: './orders/schema.prisma',
  migrations: {
    path: './orders/migrations',
  },
  datasource: {
    url: env('ORDERS_DATABASE_URL'),
  },
});
