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

schema.statics.byOption = function(id){
  return this.aggregate([
    {
      '$match': {
        'poll': mongoose.Types.ObjectId(id)
      }
    }, {
      '$group': {
        '_id': '$option',
        'count': {
          '$sum': 1
        }
      }
    }
  ]);
};

module.exports = mongoose.model('Vote', schema);
