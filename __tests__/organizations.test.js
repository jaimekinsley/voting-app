const { MongoMemoryServer } = require('mongodb-memory-server');
const mongod = new MongoMemoryServer();
const mongoose = require('mongoose');
const connect = require('../lib/utils/connect');

const request = require('supertest');
const app = require('../lib/app');
const Organization = require('../lib/models/Organization');
const User = require('../lib/models/User');
const Membership = require('../lib/models/Membership');

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
        imageUrl: 'https://climatejusticealliance.org/wp-content/uploads/2019/10/CJA-logo_ESP_600px72dpi-1.png'
      })
      .then(res => {
        expect(res.body).toEqual({
          _id: expect.anything(),
          title: 'Climate Justice Alliance',
          description: 'Movement building to pivot towards a just transition away from unsustainable energy',
          imageUrl: 'https://climatejusticealliance.org/wp-content/uploads/2019/10/CJA-logo_ESP_600px72dpi-1.png',
          __v: 0
        });
      });
  });

  it('fails to create an organization via POST', () => {
    return request(app)
      .post('/api/v1/organizations')
      .send({
        title: '',
        description: 'Movement building to pivot towards a just transition away from unsustainable energy',
        imageUrl: 'https://climatejusticealliance.org/wp-content/uploads/2019/10/CJA-logo_ESP_600px72dpi-1.png'
      })
      .then(res => {
        expect(res.body).toEqual({
          message: 'Organization validation failed: title: Path `title` is required.',
          status: 400
        });
      });
  });

  it('gets all organizations via GET', () => {
    return Organization.create({
      title: 'Climate Justice Alliance',
      description: 'Movement building to pivot towards a just transition away from unsustainable energy',
      imageUrl: 'https://climatejusticealliance.org/wp-content/uploads/2019/10/CJA-logo_ESP_600px72dpi-1.png'
    })
      .then(() => request(app).get('/api/v1/organizations'))
      .then(res => {
        expect(res.body).toEqual([{
          _id: expect.anything(),
          title: 'Climate Justice Alliance',
          description: 'Movement building to pivot towards a just transition away from unsustainable energy',
          imageUrl: 'https://climatejusticealliance.org/wp-content/uploads/2019/10/CJA-logo_ESP_600px72dpi-1.png',
          __v: 0
        }]);
      });
  });

  it('gets an organization(and its members) by id via GET', async() => {
    const organization = await Organization.create({
      title: 'Climate Justice Alliance',
      description: 'Movement building to pivot towards a just transition away from unsustainable energy',
      imageUrl: 'https://climatejusticealliance.org/wp-content/uploads/2019/10/CJA-logo_ESP_600px72dpi-1.png'
    });

    const users = await User.create([
      {
        name: 'Jaime',
        phone: '503-555-5974',
        email: 'jaime@jaime.com',
        communicationMedium: 'email',
        imageUrl: 'http://myimage.com'
      },
      { name: 'Sam',
        phone: '913-555-5974',
        email: 'sam@sam.com',
        communicationMedium: 'email',
        imageUrl: 'http://myimage.com'
      }
    ]);

    const members = await Membership.create(users.map((user) => {
      const membershipObject = { organization, user };
      return membershipObject;
    }));

    return request(app)
      .get(`/api/v1/organizations/${organization._id}`)
      .then(res => {
        expect(res.body).toEqual({
          _id: expect.anything(),
          title: 'Climate Justice Alliance',
          description: 'Movement building to pivot towards a just transition away from unsustainable energy',
          imageUrl: 'https://climatejusticealliance.org/wp-content/uploads/2019/10/CJA-logo_ESP_600px72dpi-1.png',
          __v: 0,
          memberships: [{
            _id: members[0].id,
            organization: members[0].organization.id,
            user: members[0].user.id,
          },
          {
            _id: members[1].id,
            organization: members[1].organization.id,
            user: members[1].user.id,
          }]
        });
      });
  });

  it('updates an organization by id via PATCH', () => {
    return Organization.create({
      title: 'Climate Justice Alliance',
      description: 'Movement building to pivot towards a just transition away from unsustainable energy',
      imageUrl: 'https://climatejusticealliance.org/wp-content/uploads/2019/10/CJA-logo_ESP_600px72dpi-1.png'
    })
      .then(organization => {
        return request(app)
          .patch(`/api/v1/organizations/${organization._id}`)
          .send({ title: 'People Climate Movement' });
      })
      .then(res => {
        expect(res.body).toEqual({
          _id: expect.anything(),
          title: 'People Climate Movement',
          description: 'Movement building to pivot towards a just transition away from unsustainable energy',
          imageUrl: 'https://climatejusticealliance.org/wp-content/uploads/2019/10/CJA-logo_ESP_600px72dpi-1.png',
          __v: 0
        });
      });
  });

  it('deletes an organization by id via DELETE', () => {
    return Organization.create({
      title: 'Climate Justice Alliance',
      description: 'Movement building to pivot towards a just transition away from unsustainable energy',
      imageUrl: 'https://climatejusticealliance.org/wp-content/uploads/2019/10/CJA-logo_ESP_600px72dpi-1.png'
    })
      .then(organization => request(app).delete(`/api/v1/organizations/${organization._id}`))
      .then(res => {
        expect(res.body).toEqual({
          _id: expect.anything(),
          title: 'Climate Justice Alliance',
          description: 'Movement building to pivot towards a just transition away from unsustainable energy',
          imageUrl: 'https://climatejusticealliance.org/wp-content/uploads/2019/10/CJA-logo_ESP_600px72dpi-1.png',
          __v: 0
        });
      });
  });
});
