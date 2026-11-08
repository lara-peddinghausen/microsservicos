/**
 * Serviço responsável por centralizar a comunicação TCP entre
 * o API Gateway e os microsserviços, aplicando um tempo limite
 * às requisições.
 */

import { Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { timeout, Observable } from 'rxjs';

@Injectable()
export class RpcClientService {

  // Responsável por enviar mensagens aos microsserviços
  send<T = unknown>(
    client: ClientProxy, 
    pattern: string, // Identifica qual operação será executada, como orders.findAll ou users.findOne
    data: unknown,  // Contém as informações enviadas ao microsserviço.
  ): Observable<T> {  // Representa a resposta assíncrona que será recebida.

    return client.send<T>(pattern, data).pipe(
      timeout(3000), // Limita a espera da resposta a 3 segundos; se exceder, gera um TimeoutError
    );
  }
}