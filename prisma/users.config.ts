/**
 * Arquivo de configuração do Prisma para o microsserviço Users.
 *
 * Responsável por definir o caminho do schema Prisma, o diretório
 * das migrations e a variável de ambiente utilizada para conectar
 * ao banco de dados de usuários.
 *
 * Essa configuração é utilizada pelo Prisma CLI para executar
 * comandos como migrate e generate.
 */

import 'dotenv/config';
import { defineConfig, env } from 'prisma/config';

export default defineConfig({
  schema: './users/schema.prisma',  // Caminho do schema que define os modelos e a estrutura do banco
  migrations: {
    path: './users/migrations',  // Diretório onde são armazenadas as migrations do banco de usuário
  },
  datasource: {
    url: env('USERS_DATABASE_URL'),  // Obtém a URL de conexão com o banco a partir da variável de ambiente
  },
});