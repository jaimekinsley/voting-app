const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  poll: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Poll',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  option: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model('Vote', schema);
