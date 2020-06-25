require('../data-helpers/data-helpers');

const request = require('supertest');
const app = require('../lib/app');
const Vote = require('../lib/models/Vote');

describe('aggregation routes', () => {
  it('gets the number of votes for each option with GET', async() => {
    const vote = await Vote.findOne();

    return request(app)
      .get(`/api/v1/votes/by-option/${vote.poll}`)
      .then(res => {
        expect(res.body).toContainEqual({
          _id: expect.any(String),
          count: expect.any(Number)
        });
      });
  });
});

