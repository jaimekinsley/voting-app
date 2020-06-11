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

// I'm not sure this goes here
// schema.virtual('memberships', {
//   ref: 'Membership',
//   localField: '_id',
//   foreignField: 'membership'
// });


module.exports = mongoose.model('Organization', schema);
