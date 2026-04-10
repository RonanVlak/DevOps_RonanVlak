const request = require('supertest');
const app = require('../../app');
const { db, client } = require('../../services/database');

// 1. MOCK RABBITMQ
jest.mock('amqplib', () => ({
  connect: jest.fn().mockResolvedValue({
    createChannel: jest.fn().mockResolvedValue({
      assertQueue: jest.fn().mockResolvedValue(true),
      sendToQueue: jest.fn().mockReturnValue(true),
    }),
    close: jest.fn(),
  }),
}));

describe('Users API', () => {
  beforeEach(async () => {
    // Maak de test-database leeg voor elke test
    await db.collection('users').deleteMany({});
  });

  afterAll(async() => {
    client.close();
  });

  // GET test
  it('should get all users in array', async () => {
    const expected = { 'foo': 'bar' };
    await db.collection('users').insertOne(expected);
    delete expected._id;

    const res = await request(app).get('/users');
    expect(res.statusCode).toEqual(200);
    expect(res.body.length).toEqual(1);
    expect(res.body[0]).toEqual(expect.objectContaining(expected));
  });

  // POST TEST
  it('should create a new user and trigger RabbitMQ mock', async () => {
    const newUser = { naam: 'Test Gebruiker', rol: 'DevOps' };

    const res = await request(app)
      .post('/users')
      .send(newUser);

    // Controleer of de API het verwachte 201 (Created) antwoord geeft
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.status).toEqual('User created & message queued');

    // Controleer of de gebruiker echt is opgeslagen in de test-database
    const savedUser = await db.collection('users').findOne({ naam: 'Test Gebruiker' });
    expect(savedUser).toBeTruthy();
    expect(savedUser.rol).toEqual('DevOps');
  });
});