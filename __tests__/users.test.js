require('dotenv').config();

const { MongoMemoryServer } = require('mongodb-memory-server');
const mongod = new MongoMemoryServer();
const mongoose = require('mongoose');
const connect = require('../lib/utils/connect');

const request = require('supertest');
const app = require('../lib/app');
const User = require('../lib/models/User');
const Membership = require('../lib/models/Membership');
const Organization = require('../lib/models/Organization');

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

  it('gets an user (and their organizations) by id with GET', async() => {
    const user = await User.create(
      {
        name: 'Jaime',
        password: '12345',
        phone: '503-555-5974',
        email: 'jaime@jaime.com',
        communicationMedium: 'email',
        imageUrl: 'http://myimage.com'
      }
    );

    const organizations = await Organization.create([{
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

    const agent = request.agent(app);

    return agent
      .post('/api/v1/auth/login')
      .send({ email: 'jaime@jaime.com', password: '12345' })
      .then(() => {
        return agent
          .get(`/api/v1/users/${user._id}`)
          .then(res => {
            expect(res.body).toEqual({
              _id: user.id,
              id: user.id,
              name: 'Jaime',
              phone: '503-555-5974',
              email: 'jaime@jaime.com',
              communicationMedium: 'email',
              imageUrl: 'http://myimage.com',
              memberships: [{
                _id: members[0].id,
                organization: members[0].organization.id,
                user: members[0].user.id
              },
              {
                _id: members[1].id,
                organization: members[1].organization.id,
                user: members[1].user.id
              }]
            });
          });
      });
  });

  it('updates an user by id with PATCH', async() => {
    const user = await User.create({
      name: 'Jaime',
      password: '12345',
      phone: '503-555-5974',
      email: 'jaime@jaime.com',
      communicationMedium: 'email',
      imageUrl: 'http://myimage.com'
    });

    const agent = request.agent(app);

    return agent
      .post('/api/v1/auth/login')
      .send({ email: 'jaime@jaime.com', password: '12345' })
      .then(() => {

        return agent
          .patch(`/api/v1/users/${user._id}`)
          .send({ name: 'Lyn' });
      })
      .then(res => {
        expect(res.body).toEqual({
          _id: user.id,
          id: user.id,
          name: 'Lyn',
          phone: '503-555-5974',
          email: 'jaime@jaime.com',
          communicationMedium: 'email',
          imageUrl: 'http://myimage.com',
        });
      });
  });

  it('deletes an user (and their votes) by id with DELETE', async() => {
    const user = await User.create({
      name: 'Jaime',
      password: '12345',
      phone: '503-555-5974',
      email: 'jaime@jaime.com',
      communicationMedium: 'email',
      imageUrl: 'http://myimage.com'
    });

    const agent = request.agent(app);

    return agent
      .post('/api/v1/auth/login')
      .send({ email: 'jaime@jaime.com', password: '12345' })
      .then(() => {

        return agent
          .delete(`/api/v1/users/${user._id}`);
      })
      .then(res => {
        expect(res.body).toEqual({
          _id: user.id,
          id: user.id,
          name: 'Jaime',
          phone: '503-555-5974',
          email: 'jaime@jaime.com',
          communicationMedium: 'email',
          imageUrl: 'http://myimage.com',
        });
      });
  });
});
