const { MongoClient } = require('mongodb');
const { MongoMemoryServer } = require('mongodb-memory-server');

describe('Worker Database Logic', () => {
  let client;
  let db;
  let mongoServer;

  // Start een in-memory database VOORDAT de testen beginnen
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri(); // Dit geeft een tijdelijke localhost url
    
    client = new MongoClient(mongoUri);
    await client.connect();
    db = client.db('workerdb_test');
  });

  // Sluit alles netjes af NA de testen
  afterAll(async () => {
    await client.close();
    await mongoServer.stop();
  });

  it('Zou een event succesvol in de database moeten opslaan', async () => {
    const logsCollection = db.collection('event_logs');
    
    const mockMessage = {
      ontvangenOp: new Date(),
      event: 'UserAangemaakt',
      origineleData: { naam: 'Test Gebruiker', rol: 'DevOps' }
    };

    // Voer de actie uit
    await logsCollection.insertOne(mockMessage);

    // Controleer of het gelukt is
    const result = await logsCollection.findOne({ event: 'UserAangemaakt' });
    
    expect(result).not.toBeNull();
    expect(result.origineleData.naam).toBe('Test Gebruiker');
  });
});