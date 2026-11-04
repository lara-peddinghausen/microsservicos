import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { Observable, throwError } from 'rxjs';

@Catch()  // Captura exceções lançadas pelo microsserviço.
export class RpcExceptionFilter implements ExceptionFilter {
  catch(
    exception: unknown,
    _host: ArgumentsHost,
  ): Observable<never> {
    let statusCode = 500;
    let message = 'Erro interno do servidor';

    // Trata exceções RPC
    if (exception instanceof RpcException) {  // RpcException identifica os erros de comunicação RPC
      const error = exception.getError();

      if (typeof error === 'string') {
        message = error;  // Contém a descrição do problema
      } else if (error && typeof error === 'object') {
        const data = error as {
          statusCode?: number;
          message?: string | string[];
        };

        statusCode = data.statusCode ?? 500;
        message = Array.isArray(data.message)
          ? data.message.join(', ')
          : data.message ?? message;
      }
    }

    // Trata exceções HTTP que ainda existam nos microsserviços
    else if (exception instanceof HttpException) {  // HttpException permite tratar exceções HTTP que ainda existam no código
      statusCode = exception.getStatus();  // Representa o código do erro

      const response = exception.getResponse();

      if (typeof response === 'string') {
        message = response;  // Contém a descrição do problema
      } else if (response && typeof response === 'object') {
        const data = response as {
          message?: string | string[];
        };

        message = Array.isArray(data.message)
          ? data.message.join(', ')
          : data.message ?? exception.message;
      }
    }

    // Retorna o erro padronizado para o serviço que fez a chamada
    return throwError(() => ({  
      statusCode,
      message,
    }));
  }
}