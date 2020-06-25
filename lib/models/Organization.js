const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  imageUrl: {
    type: String
  }
},
{
  toJSON: {
    virtuals: true,
    transform: (doc, ret) => {
      delete ret.id;
    }
  },
  toObject: {
    virtuals: true
  }
});

schema.virtual('polls', {
  ref: 'Poll',
  localField: '_id',
  foreignField: 'organization'
});

schema.virtual('memberships', {
  ref: 'Membership',
  localField: '_id',
  foreignField: 'organization'
});

schema.statics.deleteAndAllPolls = async function(id) {
  const Poll = this.model('Poll');
  const polls = await Poll.find({ organization: id });
  const deletePollPromises = polls.map(poll => Poll.deleteAndAllVotes(poll.id));

  return Promise.all([
    this.findByIdAndDelete(id),
    ...deletePollPromises
  ])
    .then(([organization]) => organization);
};

module.exports = mongoose.model('Organization', schema);
