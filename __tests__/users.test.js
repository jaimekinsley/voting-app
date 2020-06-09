const { MongoMemoryServer } = require('mongodb-memory-server');
const mongod = new MongoMemoryServer();
const mongoose = require('mongoose');
const connect = require('../lib/utils/connect');

const request = require('supertest');
const app = require('../lib/app');
const User = require('../lib/models/User');

describe('user routes', () => {
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

  it('gets an user by id with GET', () => {
    return User.create({
      name: 'Jaime',
      phone: '503-555-5974',
      email: 'jaime@jaime.com',
      communicationMedium: 'email',
      imageUrl: 'http://myimage.com'
    })
      .then(user => request(app).get(`/api/v1/users/${user._id}`))
      .then(res => {
        expect(res.body).toEqual({
          _id: expect.anything(),
          name: 'Jaime',
          phone: '503-555-5974',
          email: 'jaime@jaime.com',
          communicationMedium: 'email',
          imageUrl: 'http://myimage.com',
          __v: 0
        });
      });
  });
});
