/**
 * Filtro responsável por tratar exceções no API Gateway,
 * convertendo erros recebidos dos microsserviços em
 * respostas HTTP padronizadas.
 */

import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { TimeoutError } from 'rxjs';

@Catch() // Captura todas as exceções não tratadas que chegam ao filtro
export class RpcToHttpFilter implements ExceptionFilter {

  catch(exception: unknown, host: ArgumentsHost) {  // Método executado automaticamente quando uma exceção é capturada

    const response = host.switchToHttp().getResponse<Response>();  // Obtém o objeto de resposta HTTP para definir o status e a mensagem retornados ao cliente

    // Verifica se a exceção já é um erro HTTP do próprio Gateway
    if (exception instanceof HttpException) {
      return response
        .status(exception.getStatus()) // Preserva o código HTTP original da exceção
        .json(exception.getResponse()); // Retorna a mensagem e os detalhes originais do erro
    }

    // Verifica se o microsserviço ultrapassou o tempo limite de resposta
    if (exception instanceof TimeoutError) {
      return response.status(HttpStatus.GATEWAY_TIMEOUT).json({
        statusCode: 504,
        message: 'Tempo limite de comunicação com o microsserviço excedido',
      });
    }

    // Verifica se a exceção é um objeto que pode conter informações de um erro RPC
    if (exception && typeof exception === 'object') {

      // Define a estrutura esperada para acessar os dados do erro com segurança
      const error = exception as {
        statusCode?: unknown;
        message?: unknown;
      };

      // Valida se o código recebido é um número inteiro entre 400 e 599
      if (
        typeof error.statusCode === 'number' &&
        Number.isInteger(error.statusCode) &&
        error.statusCode >= 400 &&
        error.statusCode <= 599
      ) {
        return response.status(error.statusCode).json({
          statusCode: error.statusCode, // Preserva o código de erro recebido do microsserviço

          // Utiliza a mensagem recebida, caso seja uma string válida;
          // caso contrário, retorna uma mensagem genérica
          message:
            typeof error.message === 'string'
              ? error.message
              : 'Erro na comunicação com o microsserviço',
        });
      }
    }

    // Trata exceções que não se enquadram nas condições anteriores
    return response.status(500).json({
      statusCode: 500, // Indica um erro interno não identificado
      message: 'Erro interno do servidor',
    });
  }
}