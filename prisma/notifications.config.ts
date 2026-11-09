import 'dotenv/config';
import { defineConfig, env } from 'prisma/config';

export default defineConfig({
  schema: './notifications/schema.prisma',
  migrations: {
    path: './notifications/migrations',
  },
  datasource: {
    url: env('NOTIFICATIONS_DATABASE_URL'),
  },
});