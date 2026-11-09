# Microsserviços com NestJS
**API de usuários, pedidos e notificações**

API RESTful desenvolvida para cadastrar e consultar usuários e pedidos, com comunicação entre serviços por TCP e integração assíncrona com RabbitMQ para envio de notificações de pedidos.

---

# 1. Descrição

O projeto implementa uma API HTTP para gerenciar usuários e pedidos em uma arquitetura de microsserviços. O API Gateway recebe as requisições e as encaminha aos microsserviços `users` e `orders`, que aplicam as regras de negócio e acessam seus bancos de dados PostgreSQL usando Prisma.

Além disso, o microsserviço `orders` publica eventos de domínio no RabbitMQ por meio do padrão Outbox, permitindo que o serviço `notifications` processe notificações de forma assíncrona. O fluxo é realizado com filas persistentes, confirmação manual de mensagens (`ack/nack`) e Dead Letter Queue (DLQ) para mensagens rejeitadas.

O serviço `orders` consulta o serviço `users` para verificar a existência do usuário antes de criar um pedido ou listar seus pedidos. A aplicação pode ser utilizada por clientes HTTP, como aplicações web, ferramentas de teste de API ou outros sistemas.

---

# 2. Funcionalidades

- Cadastro, consulta, atualização e exclusão de usuários, com bloqueio da exclusão quando há pedidos associados;
- Cadastro, consulta, atualização e exclusão de pedidos;
- Listagem dos pedidos associados a um usuário;
- Comunicação do gateway com os microsserviços por TCP;
- Verificação da existência do usuário antes de criar ou listar pedidos;
- Padronização de erros RPC entre microsserviços e conversão para respostas HTTP no Gateway;
- Timeout de 3 segundos nas chamadas do Gateway aos microsserviços;
- Validação de dados com DTOs compartilhados;
- Persistência em bancos PostgreSQL separados para usuários e pedidos;
- Publicação de eventos de domínio no RabbitMQ por meio do padrão Outbox;
- Processamento assíncrono de notificações no microsserviço `notifications`;
- Fila principal com DLQ para mensagens rejeitadas;
- Suporte a Docker para subir o broker RabbitMQ localmente;
- Aplicação NestJS de exemplo com a rota raiz `GET /`.

---

# 3. Tecnologias Utilizadas

- **Node.js**
- **NestJS**
- **TypeScript**
- **PostgreSQL**
- **Prisma ORM**
- **RabbitMQ** para comunicação assíncrona e filas de notificações
- **Docker** e **docker-compose** para subir o broker localmente
- **Vitest** para testes
- **class-validator** e **class-transformer** para validação e transformação de dados
- **Oxlint** para análise estática

---

# 4. Arquitetura e Organização do Projeto

```text
nest-microservices/
├── apps/
│   ├── api-gateway/
│   │   └── src/
│   │       ├── app.module.ts
│   │       ├── main.ts
│   │       ├── users.controller.ts
│   │       ├── orders.controller.ts
│   │       └── common/
│   │           ├── rpc-client.service.ts
│   │           └── rpc-to-http.filter.ts
│   ├── users/
│   │   └── src/
│   │       ├── main.ts
│   │       ├── users.module.ts
│   │       ├── users.controller.ts
│   │       ├── users.service.ts
│   │       └── prisma.service.ts
│   ├── orders/
│   │   └── src/
│   │       ├── main.ts
│   │       ├── orders.module.ts
│   │       ├── orders.controller.ts
│   │       ├── orders.service.ts
│   │       ├── outbox.publisher.ts
│   │       └── prisma.service.ts
│   └── notifications/
│       └── src/
│           ├── main.ts
│           ├── notifications.module.ts
│           ├── notifications.controller.ts
│           ├── notifications.service.ts
│           └── prisma.service.ts
├── libs/
│   └── contracts/
│       └── src/
│           ├── users.dto.ts
│           ├── orders.dto.ts
│           ├── events.dto.ts
│           └── filters/
│               └── rpc-exception.filter.ts
├── prisma/
│   ├── users/
│   ├── orders/
│   └── notifications/
├── scripts/
│   └── setup-rabbitmq.cjs
├── docker-compose.yml
├── .env
├── package.json
├── nest-cli.json
└── README.md
```

- `apps/api-gateway/` — recebe requisições HTTP e as encaminha aos microsserviços; `src/common/` contém o serviço de comunicação RPC com timeout e o filtro que converte erros RPC em respostas HTTP;
- `apps/users/` — processa mensagens TCP e executa operações de usuários;
- `apps/orders/` — processa mensagens TCP, verifica usuários, executa operações de pedidos e publica eventos de domínio no RabbitMQ usando o padrão Outbox;
- `apps/notifications/` — consome eventos do RabbitMQ e executa ações de notificação após confirmar o processamento da mensagem;
- `libs/contracts/` — define DTOs e regras de validação compartilhados, além do filtro de exceções RPC usado pelos microsserviços;
- `prisma/` — contém schemas, configurações e migrações do Prisma e o model `OutboxEvent` utilizado para registrar eventos pendentes;
- `scripts/setup-rabbitmq.cjs` — configura as filas principais e de DLQ do RabbitMQ;
- `docker-compose.yml` — sobe o broker RabbitMQ em ambiente local;
- `nest-cli.json` — configura os projetos do monorepositório.

---

# 5. Pré-requisitos

- Node.js;
- npm;
- PostgreSQL com dois bancos de dados: um para usuários e outro para pedidos;
- Docker e Docker Compose para subir o RabbitMQ localmente;
- Git para clonar o repositório.

---

# 6. Instalação

## 6.1 Clone o repositório

```bash
git clone https://github.com/lara-peddinghausen/microsservicos.git
```

## 6.2 Acesse a pasta do projeto

```bash
cd microsservicos
```

## 6.3 Suba o broker RabbitMQ

```bash
docker compose up -d rabbitmq
```

## 6.4 Instale as dependências

```bash
npm install
```

---

# 7. Configuração das Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto com as URLs de conexão dos dois bancos e com a URL do RabbitMQ:

```env
USERS_DATABASE_URL="postgresql://USUARIO:SENHA@localhost:5432/users?schema=public"
ORDERS_DATABASE_URL="postgresql://USUARIO:SENHA@localhost:5432/orders?schema=public"
RABBITMQ_URL="amqp://USUARIO:SENHA@localhost:5672"
```

Substitua `USUARIO` e `SENHA` pelos dados do seu ambiente e confirme que os bancos `users` e `orders` existem. O arquivo `.env` está incluído no `.gitignore`; não versione nem compartilhe credenciais.

A fila principal do RabbitMQ e a DLQ podem ser criadas com o script de configuração:

```bash
node scripts/setup-rabbitmq.cjs
```

Gere os clientes Prisma e aplique as migrações:

```bash
npx prisma generate --config prisma/users.config.ts
npx prisma migrate dev --config prisma/users.config.ts
npx prisma generate --config prisma/orders.config.ts
npx prisma migrate dev --config prisma/orders.config.ts
```

---

# 8. Execução do Projeto

Inicie os serviços em terminais separados, a partir da raiz do projeto:

```bash
npm run start:dev -- notifications
```

```bash
npm run start:dev -- users
```

```bash
npm run start:dev -- orders
```

```bash
npm run start:dev -- api-gateway
```

O gateway HTTP fica disponível em `http://localhost:3000`. Os microsserviços usam TCP em `127.0.0.1:3001` (`users`) e `127.0.0.1:3002` (`orders`). O RabbitMQ fica disponível em `amqp://app:app123@localhost:5672` e a interface de administração pode ser acessada em `http://localhost:15672`.

Inicie `users`, `orders` e `notifications` antes de enviar requisições pelo gateway. O microsserviço `notifications` consome eventos da fila `notifications_queue` e processa mensagens de pedidos criados.

O projeto também contém uma aplicação NestJS de exemplo. Ela usa a porta `3000` por padrão, portanto não deve ser iniciada ao mesmo tempo que o gateway nessa porta:

```bash
npm run start:dev -- nest-microservices
```

---

# 9. Endpoints da API

Os endpoints abaixo são disponibilizados pelo API Gateway em `http://localhost:3000`.

## Usuários

| Método | Endpoint | Descrição |
| --- | --- | --- |
| `POST` | `/users` | Cadastra um usuário |
| `GET` | `/users` | Lista os usuários |
| `GET` | `/users/:id` | Consulta um usuário pelo ID |
| `PATCH` | `/users/:id` | Atualiza parcialmente um usuário |
| `DELETE` | `/users/:id` | Remove um usuário |

## Pedidos

| Método | Endpoint | Descrição |
| --- | --- | --- |
| `POST` | `/orders` | Cadastra um pedido para um usuário existente |
| `GET` | `/orders` | Lista os pedidos |
| `GET` | `/orders/:id` | Consulta um pedido pelo ID |
| `PATCH` | `/orders/:id` | Atualiza parcialmente um pedido |
| `DELETE` | `/orders/:id` | Remove um pedido |
| `GET` | `/orders/user/:userId` | Lista os pedidos de um usuário existente |

### Fluxo de notificações

Quando um pedido é criado com sucesso, o microsserviço `orders` salva o evento na tabela `OutboxEvent` e, em seguida, o `OutboxPublisher` publica o evento `order.created` no RabbitMQ. O microsserviço `notifications` recebe a mensagem, envia a notificação e confirma a mensagem com `ack`. Se a notificação falhar, a mensagem é rejeitada e encaminhada para a DLQ configurada.

---

# 10. Exemplos de Requisição e Resposta

## Cadastro de usuário

```http
POST /users
Content-Type: application/json
```

```json
{
  "name": "Maria Silva",
  "email": "maria@email.com"
}
```

O cadastro retorna o usuário criado, incluindo os campos gerados pelo banco, como `id` e `createdAt`.

## Cadastro de pedido

```http
POST /orders
Content-Type: application/json
```

```json
{
  "userId": 1,
  "description": "Pedido de exemplo",
  "total": 29.9
}
```

O `userId` precisa corresponder a um usuário existente. O cadastro retorna o pedido criado, incluindo `id` e `createdAt`.

---

# 11. Fluxo de Eventos e Notificações

A arquitetura segue um modelo orientado a eventos para desacoplar a criação de pedidos da entrega de notificações.

1. O cliente envia uma requisição para `POST /orders`;
2. O gateway repassa a mensagem ao microsserviço `orders` via TCP;
3. O serviço valida o usuário e cria o pedido dentro de uma transação;
4. O evento `order.created` é persistido na tabela `OutboxEvent` junto com os dados do pedido;
5. O agendador `OutboxPublisher` executa a publicação dos eventos pendentes no RabbitMQ;
6. O microsserviço `notifications` recebe a mensagem da fila e envia a notificação;
7. O RabbitMQ confirma o processamento com `ack` e, em caso de falha, encaminha para a DLQ.

Esse padrão garante que uma falha na notificação não comprometa a criação do pedido, além de preservar a consistência entre o banco de dados e a fila de eventos.

---

# 12. Tratamento de Erros

As requisições HTTP inválidas são verificadas pelos DTOs e pelo `ValidationPipe` global do gateway. Por exemplo, nome e descrição devem ter pelo menos três caracteres; o e-mail deve ser válido; e o pedido deve conter um `userId` inteiro positivo e um valor total positivo com até duas casas decimais.

O NestJS retorna erros HTTP com informações como código e mensagem. Um erro de validação pode ter este formato:

```json
{
  "statusCode": 400,
  "message": [
    "email must be an email"
  ],
  "error": "Bad Request"
}
```

Os microsserviços usam um filtro RPC compartilhado para padronizar erros, que o Gateway converte em respostas HTTP. Usuários ou pedidos inexistentes retornam erro `404`; a tentativa de excluir um usuário que possui pedidos retorna `409 Conflict`. Se uma chamada TCP do Gateway exceder o timeout de 3 segundos, a resposta será `504 Gateway Timeout`. Também podem ocorrer erros por falhas de conexão com o banco ou indisponibilidade dos serviços.

Quando a notificação de um pedido falha no `notifications`, a mensagem é rejeitada e enviada para a fila de falhas (`notifications_dlq`), permitindo observação e retomada do processamento sem bloquear a criação do pedido.

---

# 13. Testes

Os comandos de teste configurados no projeto são:

```bash
npm test
npm run test:e2e
npm run test:cov
```

O projeto contém testes unitários e de integração/e2e configurados com Vitest.

---

# 15. Modelo de Dados

## User

```text
User
├── id        Int (gerado automaticamente)
├── name      String
├── email     String (único)
└── createdAt DateTime (gerado automaticamente)
```

## Order

```text
Order
├── id          Int (gerado automaticamente)
├── userId      Int
├── description String
├── total       Decimal (até 10 dígitos e 2 casas decimais)
└── createdAt   DateTime (gerado automaticamente)
```

## OutboxEvent

```text
OutboxEvent
├── id          String (UUID)
├── eventType   String
├── payload     Json
├── createdAt   DateTime
└── publishedAt DateTime (opcional)
```

O campo `Order.userId` identifica o usuário associado. A existência do usuário é verificada pelo microsserviço `orders` consultando o microsserviço `users`; os schemas atuais mantêm os dados em bancos separados. O registro de eventos pendentes em `OutboxEvent` permite publicar alterações de forma confiável para o RabbitMQ.

---

# 16. Regras de Negócio

1. Usuários são cadastrados com nome e e-mail válido;
2. O e-mail do usuário deve ser único no banco;
3. Atualizações de usuário aceitam nome e/ou e-mail;
4. Um pedido exige `userId` positivo, descrição com pelo menos três caracteres e total positivo com até duas casas decimais;
5. Um pedido só é criado após a verificação de que o usuário existe no serviço `users`;
6. A listagem de pedidos por usuário também exige que o usuário exista no serviço `users`;
7. Pedidos podem ser atualizados parcialmente e removidos pelo ID;
8. Um usuário associado a um ou mais pedidos não pode ser excluído;
9. A criação de um pedido gera um evento `order.created` persistido no Outbox;
10. O serviço de notificações só confirma a mensagem depois de processar e validar a notificação;
11. Mensagens com falha de processamento são encaminhadas para a DLQ `notifications_dlq`.

---

# 17. Extras

- Implementadas as operações `orders.update` e `orders.remove` para atualizar e excluir pedidos;
- Adicionado o endpoint `GET /orders/user/:userId` para listar os pedidos associados a um usuário;
- O serviço `orders` verifica se o usuário existe antes de criar pedidos ou listar seus pedidos, retornando erro quando o usuário não é encontrado;
- Adicionado um filtro de exceções RPC compartilhado para padronizar o formato de erros entre os microsserviços;
- Adicionado timeout de 3 segundos às chamadas do Gateway para os microsserviços; quando excedido, a resposta HTTP é `504 Gateway Timeout`;
- A exclusão de usuários que possuem pedidos é bloqueada, retornando erro `409 Conflict`;

---

# 18. Autor

**Nome:** Lara Peddinghausen
**Turma:** ADS 2024.2N
**Unidade Curricular:** Programação Web 2

---

# 19. Licença e Uso Acadêmico

Projeto desenvolvido para fins acadêmicos e de aprendizado na disciplina de Programação Web 2. O código poderá ser utilizado para avaliação e acompanhamento acadêmico durante o curso.
