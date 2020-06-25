const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
});

schema.statics.deleteAndAllVotes = async function(id) {
  const membership = await this.findById(id);
  return Promise.all([
    this.findByIdAndDelete(id),
    this.model('Vote').deleteMany({ user: membership.user })
  ])
    .then(([membership]) => membership);
};

module.exports = mongoose.model('Membership', schema);
