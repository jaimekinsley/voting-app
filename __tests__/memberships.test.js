require('dotenv').config();

const { MongoMemoryServer } = require('mongodb-memory-server');
const mongod = new MongoMemoryServer();
const mongoose = require('mongoose');
const connect = require('../lib/utils/connect');

const request = require('supertest');
const app = require('../lib/app');
const Organization = require('../lib/models/Organization');
const User = require('../lib/models/User');
const Membership = require('../lib/models/Membership');
const Vote = require('../lib/models/Vote');
const Poll = require('../lib/models/Poll');

describe('membership routes', () => {
  beforeAll(async() => {
    const uri = await mongod.getUri();
    return connect(uri);
  });

  beforeEach(() => {
    return mongoose.connection.dropDatabase();
  });

  const agent = request.agent(app);
  let user;
  beforeEach(() => {
    return agent
      .post('/api/v1/auth/signup')
      .send({ name: 'Jaime',
        password: '12345',
        phone: '503-555-5974',
        email: 'jaime@jaime.com',
        communicationMedium: 'email',
        imageUrl: 'http://myimage.com' })
      .then(res => user = res.body);
  });

  afterAll(async() => {
    await mongoose.connection.close();
    return mongod.stop();
  });

  it('creates a new membership with POST', async() => {
    const organization = await Organization.create({
      title: 'Climate Justice Alliance',
      description: 'Movement building to pivot towards a just transition away from unsustainable energy',
      imageUrl: 'https://climatejusticealliance.org/wp-content/uploads/2019/10/CJA-logo_ESP_600px72dpi-1.png'
    });

    return agent
      .post('/api/v1/memberships')
      .send({ organization, user })
      .then(res => {
        expect(res.body).toEqual({
          _id: expect.anything(),
          organization: organization.id,
          user: user.id,
          __v: 0
        });
      });
  });

  it('gets all members of an organization', async() => {
    const organization = await Organization.create({
      title: 'Climate Justice Alliance',
      description: 'Movement building to pivot towards a just transition away from unsustainable energy',
      imageUrl: 'https://climatejusticealliance.org/wp-content/uploads/2019/10/CJA-logo_ESP_600px72dpi-1.png'
    });

    let users = await User.create([{
      name: 'Carla',
      password: '44444',
      phone: '913-555-5555',
      email: 'carla@carla.com',
      communicationMedium: 'email',
      imageUrl: 'http://myimage.com'
    },
    {
      name: 'Sam',
      password: '22222',
      phone: '913-555-5974',
      email: 'sam@sam.com',
      communicationMedium: 'email',
      imageUrl: 'http://myimage.com'
    }]);

    const members = await Membership.create(users.map((user) => {
      const membershipObject = { organization, user };
      return membershipObject;
    }));

    return agent
      .get(`/api/v1/memberships?organization=${organization._id}`)
      .then(res => {
        for(let i = 0; i < res.body.length; i++){
          expect(res.body[i]).toEqual({
            _id: members[i].id,
            organization: {
              _id: organization.id,
              title: organization.title,
              imageUrl: organization.imageUrl
            },
            user: {
              _id: users[i].id,
              id: users[i].id,
              name: users[i].name,
              imageUrl: users[i].imageUrl
            },
            __v: 0
          });
        }
      });
  });

  it('gets all organizations an user is a member of', async() => {
    let organizations = await Organization.create([{
      title: 'Climate Justice Alliance',
      description: 'Movement building to pivot towards a just transition away from unsustainable energy',
      imageUrl: 'https://climatejusticealliance.org/wp-content/uploads/2019/10/CJA-logo_ESP_600px72dpi-1.png'
    },
    {
      title: 'People Climate Movement',
      description: 'A different climate movement organization',
      imageUrl: 'https://peopleclimatemvmt.org/image.png'
    }]);

    const members = await Membership.create(organizations.map((organization) => {
      const membershipObject = { organization, user };
      return membershipObject;
    }));

    return agent
      .get(`/api/v1/memberships?user=${user._id}`)
      .then(res => {
        for(let i = 0; i < res.body.length; i++){
          expect(res.body[i]).toEqual({
            _id: members[i].id,
            organization: {
              _id: organizations[i].id,
              title: organizations[i].title,
              imageUrl: organizations[i].imageUrl
            },
            user: {
              _id: user.id,
              id: user.id,
              name: user.name,
              imageUrl: user.imageUrl
            },
            __v: 0
          });
        }
      });
  });

  it('deletes a membership (and votes made by the member) by id via DELETE', async() => {
    const organization = await Organization.create({
      title: 'Climate Justice Alliance',
      description: 'Movement building to pivot towards a just transition away from unsustainable energy',
      imageUrl: 'https://climatejusticealliance.org/wp-content/uploads/2019/10/CJA-logo_ESP_600px72dpi-1.png'
    });

    const poll = await Poll.create({
      organization: organization._id,
      title: 'A new poll',
      description: 'At the end of the term, we need to select a new president',
      options: ['Jaime', 'Carla', 'Sam', 'Louie']
    });

    const membership = await Membership.create({ organization, user });

    await Vote.create([
      { organization, user, poll, option: 'Louie' },
      { organization, user, poll, option: 'Louie' }
    ]);

    return agent
      .delete(`/api/v1/memberships/${membership._id}`)
      .then(res => {
        expect(res.body).toEqual({
          _id: membership.id,
          organization: organization.id,
          user: user.id,
          __v: 0
        });
        return Vote.find({ user: user._id });
      })
      .then(votes => {
        expect(votes).toEqual([]);
      });
  });
});
