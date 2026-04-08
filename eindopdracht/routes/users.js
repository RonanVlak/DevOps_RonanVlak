var express = require('express');
var router = express.Router();
const { db } = require("../services/database");
const amqp = require('amqplib'); 

const rabbitUrl = process.env.RABBITMQ_URL || 'amqp://guest:guest@messagebus:5672';

/* GET users listing. */
router.get('/', async function(req, res) {
  let users = await db.collection('users').find().toArray();
  res.json(users);
});

/* POST: Maak user aan én stuur bericht naar RabbitMQ */
router.post('/', async function(req, res){
  console.log("1. POST request ontvangen!");
  
  try {
    console.log("2. Bezig met opslaan in MongoDB...");
    const user = await db.collection('users').insertOne(req.body);
    console.log("3. Opgeslagen in DB met ID:", user.insertedId);

    console.log("4. Bezig met verbinden naar RabbitMQ op:", rabbitUrl);
    const conn = await amqp.connect(rabbitUrl);
    const channel = await conn.createChannel();
    const queue = 'user_events';
    
    await channel.assertQueue(queue, { durable: true });
    
    const message = JSON.stringify({ 
      event: 'UserAangemaakt', 
      id: user.insertedId,
      data: req.body 
    });

    channel.sendToQueue(queue, Buffer.from(message));
    console.log("5. Bericht verstuurd naar RabbitMQ!");

    setTimeout(() => { conn.close(); }, 500);

    res.status(201).json({ "id": user.insertedId, "status": "User created & message queued" });
    console.log("6. Response teruggestuurd naar client.");

  } catch (err) {
    console.error("FOUT TIJDENS POST:", err);
    res.status(500).json({ error: err.toString() });
  }
});

module.exports = router;