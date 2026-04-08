require('dotenv').config();
const { MongoClient } = require('mongodb');

const uri = process.env.MONGO_URL || 'mongodb://localhost:27017';
const dbName = process.env.DB_NAME || 'eindopdracht';

const client = new MongoClient(uri);

async function connectDB() {
  try {
    await client.connect();
    console.log("API is succesvol verbonden met MongoDB Database A!");
  } catch (err) {
    console.error("API MongoDB Connectie fout:", err);
  }
}
connectDB();

const db = client.db(dbName);

module.exports = {
  db: db,
  client: client
};