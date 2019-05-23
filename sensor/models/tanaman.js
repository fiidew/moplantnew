var mongoose = require('mongoose');
var Schema = mongoose.Schema;

const PerangkatSchema = new Schema({
  idOnRaspi: {
    type: Schema.Types.ObjectId,
  },
  status: Number,
  data: [{
    tanggal:{ type: Date, default: Date.now },
    kelembaban:Number,
    ph:Number,
    kondisi:Number
  }]
});

var TanamanSchema = new Schema({
  idFarmer: {
    type: Schema.Types.ObjectId,
  },
  namaTanaman: {
    type: String,
    required: true
  },
  perangkat:{
    type: PerangkatSchema,
    required: true
  }
});

module.exports = mongoose.model('Tanaman', TanamanSchema);
