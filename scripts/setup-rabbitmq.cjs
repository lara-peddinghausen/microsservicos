const amqp = require('amqplib'); // Importa a biblioteca responsável pela comunicação com o RabbitMQ

async function setup() {
  const connection = await amqp.connect(
    process.env.RABBITMQ_URL,
  );

  const channel = await connection.createChannel(); // Cria um canal para executar operações no RabbitMQ

  // Cria a exchange responsável por receber mensagens que falharam no processamento
  await channel.assertExchange(
    'notifications.dlx', // Nome da Dead Letter Exchange (DLX)
    'direct', // Define que as mensagens serão roteadas conforme a routing key
    { durable: true }, 
  );

  // Cria a fila responsável por armazenar mensagens que não foram processadas
  await channel.assertQueue('notifications_dlq', {
    durable: true,
  });

  // Vincula a fila de mensagens com falha à Dead Letter Exchange
  await channel.bindQueue(
    'notifications_dlq', // Fila que receberá as mensagens rejeitadas
    'notifications.dlx', // Exchange responsável pelo encaminhamento
    'notifications.failed', // Chave de roteamento utilizada para direcionar as mensagens
  );

  // Cria a fila principal responsável por receber as notificações
  await channel.assertQueue('notifications_queue', {
    durable: true,
    arguments: {
      'x-dead-letter-exchange': 'notifications.dlx', // Define a exchange que receberá mensagens rejeitadas
      'x-dead-letter-routing-key':
        'notifications.failed', // Define a chave utilizada para encaminhar mensagens rejeitadas à DLQ
    },
  });

  console.log('Filas configuradas'); 

  await channel.close(); // Encerra o canal de comunicação com o RabbitMQ
  await connection.close(); // Encerra a conexão com o RabbitMQ
}

setup().catch((error) => {
  console.error(error); 
  process.exitCode = 1; // Define um código de saída indicando falha na execução do script
});