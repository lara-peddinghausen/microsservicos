import { Controller, Get, Param, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Controller('users')
export class UsersController {
  constructor(
    @Inject('USERS_SERVICE') // Injeta o cliente do microsserviço de usuários no controller
    private readonly usersClient: ClientProxy,  // ClientProxy permite enviar mensagens para o microsserviço de usuáio
  ) { }

  @Get()
  findAll() {
    return this.usersClient.send( // Envia uma mensagem para o microsserviço de usuários solicitando a lista de usuários
      'users.findAll',
      {},
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersClient.send(
      'users.findOne',
      Number(id),
    );
  }

}
