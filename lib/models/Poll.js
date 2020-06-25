const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  options: {
    type: [String]
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

schema.virtual('votes', {
  ref: 'Vote',
  localField: '_id',
  foreignField: 'poll'
});

schema.statics.deleteAndAllVotes = async function(id) {
  const poll = await this.findById(id);
  return Promise.all([
    this.findByIdAndDelete(id),
    this.model('Vote').deleteMany({ user: poll.id })
  ])
    .then(([poll]) => poll);
};

module.exports = mongoose.model('Poll', schema);
