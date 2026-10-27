// Módulo responsável por organizar os componentes do microsserviço Users

import { Module } from '@nestjs/common';
import { UsersController } from './users.controller.js';
import { UsersService } from './users.service.js';

@Module({
  controllers: [UsersController],  // Registra o controller que recebe as mensagens TCP
  providers: [UsersService],  // Disponibiliza o service para injeção de dependência
})
export class UsersModule {}
