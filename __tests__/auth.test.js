require('dotenv').config();

const { MongoMemoryServer } = require('mongodb-memory-server');
const mongod = new MongoMemoryServer();
const mongoose = require('mongoose');
const connect = require('../lib/utils/connect');

const request = require('supertest');
const app = require('../lib/app');
// const User = require('../lib/models/User');

describe('auth routes', () => {
  beforeAll(async() => {
    const uri = await mongod.getUri();
    return connect(uri);
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
});
