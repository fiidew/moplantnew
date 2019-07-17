var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var TipeSchema = new Schema({
  idTanaman: {
    type: Schema.Types.ObjectId,
  },
  tipe: {
    type: String,
    required: true
  },
  nitrogen: {
    type: Number,
    required: true
  },
  phosporusVL: {
    type: Number,
    required: true
  },
  phosporusL: {
    type: Number,
    required: true
  },
  phosporusM: {
    type: Number,
    required: true
  },
  potassiumVL: {
    type: Number,
    required: true
  },
  potassiumL: {
    type: Number,
    required: true
  },
  potassiumM: {
    type: Number,
    required: true
  }
});

module.exports = mongoose.model('Tipe', TipeSchema);
