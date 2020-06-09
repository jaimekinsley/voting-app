const { MongoMemoryServer } = require('mongodb-memory-server');
const mongod = new MongoMemoryServer();
const mongoose = require('mongoose');
const connect = require('../lib/utils/connect');

const request = require('supertest');
const app = require('../lib/app');

describe('organization routes', () => {
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

  it('creates an organization via POST', () => {
    return request(app)
      .post('/api/v1/organizations')
      .send({
        title: 'Climate Justice Alliance',
        description: 'Movement building to pivot towards a just transition away from unsustainable energy',
        image: 'https://climatejusticealliance.org/wp-content/uploads/2019/10/CJA-logo_ESP_600px72dpi-1.png'
      })
      .then(res => {
        expect(res.body).toEqual({
          _id: expect.anything(),
          title: 'Climate Justice Alliance',
          description: 'Movement building to pivot towards a just transition away from unsustainable energy',
          image: 'https://climatejusticealliance.org/wp-content/uploads/2019/10/CJA-logo_ESP_600px72dpi-1.png',
          __v: 0
        });
      });
  });
});
