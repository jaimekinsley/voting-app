const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  phone: {
    type: String
  },
  email: {
    type: String
  },
  communicationMedium: {
    type: String,
    required: true,
    enum: ['phone', 'email']
  },
  imageUrl: {
    type: String
  }
});

module.exports = mongoose.model('User', schema);
