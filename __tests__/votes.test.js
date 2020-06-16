require('dotenv').config();

const { MongoMemoryServer } = require('mongodb-memory-server');
const mongod = new MongoMemoryServer();
const mongoose = require('mongoose');
const connect = require('../lib/utils/connect');
const Organization = require('../lib/models/Organization');
const User = require('../lib/models/User');
const Poll = require('../lib/models/Poll');
const Vote = require('../lib/models/Vote');

const request = require('supertest');
const app = require('../lib/app');

describe('vote routes', () => {
  beforeAll(async() => {
    const uri = await mongod.getUri();
    return connect(uri);
  });

  beforeEach(() => {
    return mongoose.connection.dropDatabase();
  });

  let organization;
  beforeEach(async() => {
    organization = await Organization.create({
      title: 'Climate Justice Alliance',
      description: 'Movement building to pivot towards a just transition away from unsustainable energy',
      imageUrl: 'https://climatejusticealliance.org/wp-content/uploads/2019/10/CJA-logo_ESP_600px72dpi-1.png'
    });
  });

  let user;
  beforeEach(async() => {
    user = await User.create({
      name: 'Jaime',
      password: '12345',
      phone: '503-555-5974',
      email: 'jaime@jaime.com',
      communicationMedium: 'email',
    });
  });

  let poll;
  beforeEach(async() => {
    poll = await Poll.create({
      organization: organization._id,
      title: 'A new poll',
      description: 'At the end of the term, we need to select a new president',
      options: ['Jaime', 'Carla', 'Sam', 'Louie']
    });
  });

  afterAll(async() => {
    await mongoose.connection.close();
    return mongod.stop();
  });

  it('creates a new vote with POST', async() => {
    return request(app)
      .post('/api/v1/votes')
      .send({ organization, user, poll, option: 'Louie' })
      .then(res => {
        expect(res.body).toEqual({
          _id: expect.anything(),
          poll: poll.id,
          user: user.id,
          option: 'Louie',
          __v: 0
        });
      });
  });

  it('gets all votes on a poll with GET', async() => {
    let votes = await Vote.create([
      { organization, user, poll, option: 'Louie' },
      { organization, user, poll, option: 'Louie' },
      { organization, user, poll, option: 'Sam' }
    ]);
    return request(app)
      .get(`/api/v1/votes/polls?poll=${poll._id}`)
      .then(res => {
        for(let i = 0; i < res.body.length; i++){
          expect(res.body[i]).toEqual({
            _id: expect.anything(),
            poll: poll.id,
            user: user.id,
            option: votes[i].option,
            __v: 0
          });
        }
      });
  });

  it('gets all votes by a user with GET', async() => {
    let votes = await Vote.create([
      { organization, user, poll, option: 'Louie' },
      { organization, user, poll, option: 'Louie' },
      { organization, user, poll, option: 'Sam' }
    ]);
    return request(app)
      .get(`/api/v1/votes?user=${user._id}`)
      .then(res => {
        for(let i = 0; i < res.body.length; i++){
          expect(res.body).toContainEqual({
            _id: expect.anything(),
            poll: poll.id,
            user: user.id,
            option: votes[i].option,
            __v: 0
          });
        }
      });
  });

  it('updates a vote option with PATCH', async() => {
    const vote = await Vote.create(
      { organization, user, poll, option: 'Louie' }
    );
    return request(app)
      .patch(`/api/v1/votes/${vote._id}`)
      .send({ option: 'Sam' })
      .then(res => {
        expect(res.body).toEqual({
          _id: expect.anything(),
          poll: poll.id,
          user: user.id,
          option: 'Sam',
          __v: 0
        });
      });
  });

  it('allows a user to vote only once on a poll with POST', async() => {
    const vote = await Vote.create(
      { organization, user, poll, option: 'Louie' }
    );

    return request(app)
      .post('/api/v1/votes')
      .send({ organization, user, poll, option: 'Sam' })
      .then(res => {
        expect(res.body).toEqual({
          _id: vote.id,
          poll: poll.id,
          user: user.id,
          option: 'Sam',
          __v: 0
        });
      });
  });
});
