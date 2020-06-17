require('dotenv').config();

const { MongoMemoryServer } = require('mongodb-memory-server');
const mongod = new MongoMemoryServer();
const mongoose = require('mongoose');
const connect = require('../lib/utils/connect');

const request = require('supertest');
const app = require('../lib/app');
const Organization = require('../lib/models/Organization');
const Poll = require('../lib/models/Poll');

describe('poll routes', () => {
  beforeAll(async() => {
    const uri = await mongod.getUri();
    return connect(uri);
  });

  beforeEach(() => {
    return mongoose.connection.dropDatabase();
  });

  const agent = request.agent(app);

  beforeEach(() => {
    return agent
      .post('/api/v1/auth/signup')
      .send({ name: 'Jaime',
        password: '12345',
        phone: '503-555-5974',
        email: 'jaime@jaime.com',
        communicationMedium: 'email',
        imageUrl: 'http://myimage.com' });
  });

  let organization;
  beforeEach(async() => {
    organization = await Organization.create({
      title: 'Climate Justice Alliance',
      description: 'Movement building to pivot towards a just transition away from unsustainable energy',
      imageUrl: 'https://climatejusticealliance.org/wp-content/uploads/2019/10/CJA-logo_ESP_600px72dpi-1.png'
    });
  });

  afterAll(async() => {
    await mongoose.connection.close();
    return mongod.stop();
  });

  it('creates a poll with POST', () => {
    return agent
      .post('/api/v1/polls')
      .send({
        organization: organization._id,
        title: 'New president election',
        description: 'At the end of the term, we need to select a new president',
        options: ['Jaime', 'Carla', 'Sam', 'Louie']
      })
      .then(res => {
        expect(res.body).toEqual({
          _id: expect.anything(),
          organization: organization.id,
          title: 'New president election',
          description: 'At the end of the term, we need to select a new president',
          options: ['Jaime', 'Carla', 'Sam', 'Louie'],
          __v: 0
        });
      });
  });

  it('fails to create a poll with POST', () => {
    return agent
      .post('/api/v1/polls')
      .send({
        organization: organization._id,
        title: '',
        description: 'At the end of the term, we need to select a new president',
        options: ['Jaime', 'Carla', 'Sam', 'Louie']
      })
      .then(res => {
        expect(res.body).toEqual({
          message: 'Poll validation failed: title: Path `title` is required.',
          status: 400,
        });
      });
  });

  it('gets all polls with GET', () => {
    return Poll.create({
      organization: organization._id,
      title: 'New president election',
      description: 'At the end of the term, we need to select a new president',
      options: ['Jaime', 'Carla', 'Sam', 'Louie']
    })
      .then(() => agent.get('/api/v1/polls'))
      .then(res => {
        expect(res.body).toEqual([{
          _id: expect.anything(),
          title: 'New president election'
        }]);
      });
  });

  it('gets a poll by id with GET', () => {
    return Poll.create({
      organization: organization._id,
      title: 'New president election',
      description: 'At the end of the term, we need to select a new president',
      options: ['Jaime', 'Carla', 'Sam', 'Louie']
    })
      .then(poll => agent.get(`/api/v1/polls/${poll._id}`))
      .then(res => {
        expect(res.body).toEqual({
          _id: expect.anything(),
          organization: {
            _id: organization.id,
            title: organization.title,
            description: organization.description,
            imageUrl: organization.imageUrl,
            __v: 0
          },
          title: 'New president election',
          description: 'At the end of the term, we need to select a new president',
          options: ['Jaime', 'Carla', 'Sam', 'Louie'],
          __v: 0
        });
      });
  });

  it('updates a poll by id with PATCH', () => {
    return Poll.create({
      organization: organization._id,
      title: 'New president election',
      description: 'At the end of the term, we need to select a new president',
      options: ['Jaime', 'Carla', 'Sam', 'Louie']
    })
      .then(poll => {
        return agent
          .patch(`/api/v1/polls/${poll._id}`)
          .send({ title: 'New Treasurer Election' });
      })
      .then(res => {
        expect(res.body).toEqual({
          _id: expect.anything(),
          organization: organization.id,
          title: 'New Treasurer Election',
          description: 'At the end of the term, we need to select a new president',
          options: ['Jaime', 'Carla', 'Sam', 'Louie'],
          __v: 0
        });
      });
  });

  it('deletes a poll by id with DELETE', () => {
    return Poll.create({
      organization: organization._id,
      title: 'New president election',
      description: 'At the end of the term, we need to select a new president',
      options: ['Jaime', 'Carla', 'Sam', 'Louie']
    })
      .then(poll => agent.delete(`/api/v1/polls/${poll._id}`)
        .then(res => {
          expect(res.body).toEqual({
            _id: expect.anything(),
            organization: organization.id,
            title: 'New president election',
            description: 'At the end of the term, we need to select a new president',
            options: ['Jaime', 'Carla', 'Sam', 'Louie'],
            __v: 0
          });
        })
      );
  });
});
