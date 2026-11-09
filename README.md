# Microsserviços com NestJS
**API de usuários e pedidos**

API RESTful desenvolvida para cadastrar e consultar usuários e pedidos, com comunicação entre serviços por TCP e persistência em PostgreSQL.

---

# 1. Descrição

O projeto implementa uma API HTTP para gerenciar usuários e pedidos. O API Gateway recebe as requisições e as encaminha aos microsserviços `users` e `orders`, que aplicam as regras de negócio e acessam seus bancos de dados PostgreSQL usando Prisma.

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
- Aplicação NestJS de exemplo com a rota raiz `GET /`.

---

# 3. Tecnologias Utilizadas

- **Node.js**
- **NestJS**
- **TypeScript**
- **PostgreSQL**
- **Prisma ORM**
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
│   └── orders/
│       └── src/
│           ├── main.ts
│           ├── orders.module.ts
│           ├── orders.controller.ts
│           ├── orders.service.ts
│           └── prisma.service.ts
├── libs/
│   └── contracts/
│       └── src/
│           ├── users.dto.ts
│           ├── orders.dto.ts
│           └── filters/
│               └── rpc-exception.filter.ts
├── prisma/
│   ├── users/
│   └── orders/
├── package.json
└── nest-cli.json
```

- `apps/api-gateway/` — recebe requisições HTTP e as encaminha aos microsserviços; `src/common/` contém o serviço de comunicação RPC com timeout e o filtro que converte erros RPC em respostas HTTP;
- `apps/users/` — processa mensagens TCP e executa operações de usuários;
- `apps/orders/` — processa mensagens TCP, verifica usuários e executa operações de pedidos;
- `libs/contracts/` — define DTOs e regras de validação compartilhados, além do filtro de exceções RPC usado pelos microsserviços;
- `prisma/` — contém schemas, configurações e migrações do Prisma;
- `apps/nest-microservices/` — aplicação de exemplo independente;
- `nest-cli.json` — configura os projetos do monorepositório.

---

# 5. Pré-requisitos

- Node.js;
- npm;
- PostgreSQL com dois bancos de dados: um para usuários e outro para pedidos;
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

## 6.3 Instale as dependências

```bash
npm install
```

---

# 7. Configuração das Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto com as URLs de conexão dos dois bancos:

```env
USERS_DATABASE_URL="postgresql://USUARIO:SENHA@localhost:5432/users?schema=public"
ORDERS_DATABASE_URL="postgresql://USUARIO:SENHA@localhost:5432/orders?schema=public"
```

Substitua `USUARIO` e `SENHA` pelos dados do seu ambiente e confirme que os bancos `users` e `orders` existem. O arquivo `.env` está incluído no `.gitignore`; não versione nem compartilhe credenciais.

Gere os clientes Prisma e aplique as migrações:

```bash
npx prisma generate --config prisma/users.config.ts
npx prisma migrate dev --config prisma/users.config.ts
npx prisma generate --config prisma/orders.config.ts
npx prisma migrate dev --config prisma/orders.config.ts
```

---

# 8. Execução do Projeto

Inicie cada serviço em um terminal separado, a partir da raiz do projeto:

```bash
npm run start:dev -- users
```

```bash
npm run start:dev -- orders
```

```bash
npm run start:dev -- api-gateway
```

O gateway HTTP fica disponível em `http://localhost:3000`. Os microsserviços usam TCP em `127.0.0.1:3001` (`users`) e `127.0.0.1:3002` (`orders`). Inicie `users` e `orders` antes de enviar requisições pelo gateway.

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

O campo `Order.userId` identifica o usuário associado. A existência do usuário é verificada pelo microsserviço `orders` consultando o microsserviço `users`; os schemas atuais mantêm os dados em bancos separados.

---

# 16. Regras de Negócio

1. Usuários são cadastrados com nome e e-mail válido;
2. O e-mail do usuário deve ser único no banco;
3. Atualizações de usuário aceitam nome e/ou e-mail;
4. Um pedido exige `userId` positivo, descrição com pelo menos três caracteres e total positivo com até duas casas decimais;
5. Um pedido só é criado após a verificação de que o usuário existe no serviço `users`;
6. A listagem de pedidos por usuário também exige que o usuário exista no serviço `users`;
7. Pedidos podem ser atualizados parcialmente e removidos pelo ID;
8. Um usuário associado a um ou mais pedidos não pode ser excluído.

---

# 17. Extras

- Implementadas as operações `orders.update` e `orders.remove` para atualizar e excluir pedidos;
- Adicionado o endpoint `GET /orders/user/:userId` para listar os pedidos associados a um usuário;
- O serviço `orders` verifica se o usuário existe antes de criar pedidos ou listar seus pedidos, retornando erro quando o usuário não é encontrado;
- Adicionado um filtro de exceções RPC compartilhado para padronizar o formato de erros entre os microsserviços;
- Adicionado timeout de 3 segundos às chamadas do Gateway para os microsserviços; quando excedido, a resposta HTTP é `504 Gateway Timeout`;
- A exclusão de usuários que possuem pedidos é bloqueada, retornando erro `409 Conflict`.

---

# 18. Autor

**Nome:** Lara Peddinghausen
**Turma:** ADS 2024.2N
**Unidade Curricular:** Programação Web 2

---

# 19. Licença e Uso Acadêmico

Projeto desenvolvido para fins acadêmicos e de aprendizado na disciplina de Programação Web 2. O código poderá ser utilizado para avaliação e acompanhamento acadêmico durante o curso.