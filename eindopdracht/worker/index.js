const amqp = require('amqplib');
const { MongoClient } = require('mongodb');

const rabbitUrl = process.env.RABBITMQ_URL || 'amqp://guest:guest@messagebus:5672';
const mongoUrl = process.env.MONGO_WORKER_URL || 'mongodb://root:secret@mongo-worker:27017/workerdb?authSource=admin';
const queue = 'user_events';

const http = require('http');
const prom = require('prom-client');

// 1. Verzamel standaard statistieken
prom.collectDefaultMetrics();

// 2. Start een mini-server op poort 3000 voor Prometheus
http.createServer(async (req, res) => {
  if (req.url === '/metrics') {
    try {
      res.setHeader('Content-Type', prom.register.contentType);
      res.end(await prom.register.metrics());
    } catch (ex) {
      res.statusCode = 500;
      res.end(ex);
    }
  } else {
    res.statusCode = 404;
    res.end('Not Found');
  }
}).listen(3000, '0.0.0.0'); // '0.0.0.0' zorgt dat hij luistert op het Docker netwerk

console.log("Worker metrics server luistert op poort 3000");

async function startWorker() {
  try {
    // 1. Verbinden met Database B (Zijn eigen database!)
    const client = new MongoClient(mongoUrl);
    await client.connect();
    const db = client.db('workerdb');
    const logsCollection = db.collection('event_logs');
    console.log("Worker is verbonden met zijn eigen MongoDB (Database B)");

    // 2. Verbinden met RabbitMQ
    const conn = await amqp.connect(rabbitUrl);
    const channel = await conn.createChannel();
    await channel.assertQueue(queue, { durable: true });

    console.log(`Worker luistert naar berichten op '${queue}'...`);

    // 3. Berichten verwerken
    channel.consume(queue, async (msg) => {
      if (msg !== null) {
        const content = JSON.parse(msg.content.toString());
        console.log("Bericht ontvangen:", content);

        // Sla het bewijs op in zijn eigen database
        await logsCollection.insertOne({
          ontvangenOp: new Date(),
          event: content.event,
          origineleData: content.data
        });
        
        console.log("Actie gelogd in Worker Database.");
        
        // Vertel RabbitMQ dat het bericht succesvol is verwerkt (en verwijderd mag worden)
        channel.ack(msg); 
      }
    }, { noAck: false });

  } catch (error) {
    console.error("Worker fout, probeer opnieuw in 5 sec...", error.message);
    setTimeout(startWorker, 5000); // Retry
  }
}

startWorker();