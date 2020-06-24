const chance = require('chance').Chance();
const Membership = require('../lib/models/Membership');
const Organization = require('../lib/models/Organization');
const Poll = require('../lib/models/Poll');
const User = require('../lib/models/User');
const Vote = require('../lib/models/Vote');


module.exports = async({ memberships = 100, organizations = 75, polls = 200, users = 150, votes = 300 } = {}) => {
  const communicationMediums = ['phone', 'email'];
  const options = ['for', 'against'];

  const createdUsers = await User.create([...Array(users)].map(() => ({
    name: chance.name(),
    phone: chance.phone(),
    email: chance.email(),
    communicationMedium: chance.pickone(communicationMediums)
  })));

  const createdOrganizations = await Organization.create([...Array(organizations)].map(() => ({
    title: chance.company(),
    description: chance.sentence(),
    imageUrl: chance.url()
  })));

  await Membership.create([...Array(memberships)].map(() => ({
    organization: chance.pickone(createdOrganizations)._id,
    user: chance.pickone(createdUsers)._id
  })));

  const createdPolls = await Poll.create([...Array(polls)].map(() => ({
    organization: chance.pickone(createdOrganizations),
    title: chance.sentence({ words: 5 }),
    description: chance.paragraph(),
    options: chance.pickone(options)
  })));

  await Vote.create([...Array(votes)].map(() => ({
    poll: chance.pickone(createdPolls)._id,
    user: chance.pickone(createdUsers)._id,
    option: chance.pickone(options)
  })));
};
