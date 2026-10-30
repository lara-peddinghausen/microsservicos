# Microsserviços com NestJS

Projeto em NestJS e TypeScript com um API Gateway HTTP e um microsserviço de usuários que se comunicam por TCP.

# 1. Descrição

A aplicação contém um gateway que disponibiliza operações de consulta de usuários por HTTP e encaminha as solicitações ao microsserviço `users`. O microsserviço recebe mensagens TCP e usa Prisma para consultar os usuários.

O repositório também contém a aplicação `nest-microservices`, que disponibiliza uma rota HTTP raiz com a resposta `Hello World!`.

# 2. Funcionalidades

- Consulta da lista de usuários pelo gateway;
- Consulta de um usuário pelo ID;
- Comunicação entre o gateway e o microsserviço de usuários por TCP;
- Consultas de usuários com Prisma;
- Aplicação NestJS de exemplo com rota raiz.

# 3. Tecnologias Utilizadas

- Node.js;
- NestJS;
- TypeScript;
- Prisma ORM;
- Vitest;
- Oxlint.

# 4. Arquitetura e Organização do Projeto

```text
apps/
├── api-gateway/
│   └── src/
│       ├── api-gateway.controller.ts
│       ├── api-gateway.module.ts
│       └── main.ts
├── nest-microservices/
│   └── src/
│       ├── app.controller.ts
│       ├── app.module.ts
│       ├── app.service.ts
│       └── main.ts
└── users/
    └── src/
        ├── prisma/
        │   └── prisma.service.ts
        ├── users.controller.ts
        ├── users.module.ts
        ├── users.service.ts
        └── main.ts
```

- `apps/api-gateway/` — aplicação HTTP que encaminha as consultas para o serviço de usuários;
- `apps/users/` — microsserviço TCP que trata as mensagens de consulta e chama o serviço de usuários;
- `apps/users/src/prisma/prisma.service.ts` — serviço baseado em `PrismaClient`;
- `apps/nest-microservices/` — aplicação HTTP de exemplo;
- `nest-cli.json` — configura as aplicações do monorepositório;
- `package.json` — lista as dependências e os comandos disponíveis.

# 5. Pré-requisitos

- Node.js;
- npm.

# 6. Instalação

Na raiz do projeto, instale as dependências:

```bash
npm install
```

# 7. Execução

O API Gateway recebe requisições HTTP na porta `3000` e está configurado para se comunicar com o microsserviço `users` por TCP na porta `3001`.

Inicie cada aplicação em terminais separados:

```bash
npx nest start api-gateway --watch
```

```bash
npx nest start users --watch
```

A aplicação de exemplo também pode ser iniciada com:

```bash
npx nest start nest-microservices --watch
```

Ela atende na porta `3000` e disponibiliza a rota raiz `GET /`.

# 8. Endpoints

## API Gateway

| Método | Endpoint     | Descrição                         |
| ------ | ------------ | --------------------------------- |
| GET    | `/users`     | Solicita a lista de usuários      |
| GET    | `/users/:id` | Solicita um usuário pelo ID       |

O gateway encaminha as consultas ao microsserviço usando os padrões de mensagem `users.findAll` e `users.findOne`.

## Aplicação de exemplo

| Método | Endpoint | Descrição                     |
| ------ | -------- | ----------------------------- |
| GET    | `/`      | Retorna `Hello World!`        |

# 9. Testes

Os comandos de teste disponíveis no `package.json` são:

```bash
npm run test
npm run test:e2e
npm run test:cov
```

# 10. Autor

**Nome:** Lara Peddinghausen  
**Turma:** ADS 2024.2N  
**Unidade Curricular:** Programação Web 2  

# 11. Licença e Uso Acadêmico

Projeto desenvolvido para fins acadêmicos e de aprendizado na disciplina de Programação Web 2. O código poderá ser utilizado para avaliação e acompanhamento acadêmico durante o curso.
