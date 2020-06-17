require('dotenv').config();

const { MongoMemoryServer } = require('mongodb-memory-server');
const mongod = new MongoMemoryServer();
const mongoose = require('mongoose');
const connect = require('../lib/utils/connect');

const request = require('supertest');
const app = require('../lib/app');
const User = require('../lib/models/User');

describe('auth routes', () => {
  beforeAll(async() => {
    const uri = await mongod.getUri();
    return connect(uri);
  });

  beforeEach(() => {
    return mongoose.connection.dropDatabase();
  });

  afterAll(async() => {
    await mongoose.connection.close();
    return mongod.stop();
  });

  it('can sign up a new user with POST', () => {
    return request(app)
      .post('/api/v1/auth/signup')
      .send({
        name: 'Jaime',
        password: '12345',
        phone: '503.555.5555',
        email: 'jaime@jaime.com',
        communicationMedium: 'email',
        imageUrl: 'http://myimage.com'
      })
      .then(res => {
        expect(res.body).toEqual({
          _id: expect.anything(),
          id: expect.anything(),
          name: 'Jaime',
          phone: '503.555.5555',
          email: 'jaime@jaime.com',
          communicationMedium: 'email',
          imageUrl: 'http://myimage.com'
        });
      });
  });

  it('can verify is a user is logged in', async() => {
    const user = await User.create({
      name: 'Jaime',
      password: '12345',
      phone: '503.555.5555',
      email: 'jaime@jaime.com',
      communicationMedium: 'email',
      imageUrl: 'http://myimage.com'
    });

    // Use agent here because a request to app wipes out cookies each time
    const agent = request.agent(app);

    return agent
      .post('/api/v1/auth/login')
      .send({
        email: 'jaime@jaime.com',
        password: '12345'
      })
      .then(() => {
        return agent
          .get('/api/v1/auth/verify');
      })
      .then(res => {
        expect(res.body).toEqual({
          _id: user.id,
          id: user.id,
          name: 'Jaime',
          phone: '503.555.5555',
          email: 'jaime@jaime.com',
          communicationMedium: 'email',
          imageUrl: 'http://myimage.com'
        });
      });
  });
});
