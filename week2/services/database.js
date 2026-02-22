require('dotenv').config();

const { MongoClient } = require('mongodb');

const uri = process.env.MONGO_URL || 'mongodb://localhost:27017';
console.log("Huidige DB URL:", uri);
const dbName = process.env.DB_NAME || 'mydb';

const client = new MongoClient(uri);

const db = client.db(dbName);

module.exports = {
  db: db,
  client: client
};