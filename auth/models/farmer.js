var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var FarmerSchema = new Schema({
  idUser: {
    type: Schema.Types.ObjectId,
  },
  nama: {
    type: String,
    required: true
  },
  alamat: {
    type: String,
    required: true
  },
  telp: {
    type: Number,
    required: true
  }
});

module.exports = mongoose.model('Farmer', FarmerSchema);
