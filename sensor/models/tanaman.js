var mongoose = require('mongoose');
var Schema = mongoose.Schema;

const PerangkatSchema = new Schema({
  // idOnRaspi: {
  //   type: Schema.Types.ObjectId,
  // },
  status: Number,
  data: [{
    tanggal:{ type: Date, default: Date.now },
    kelembabanTanah:Number,
    ph:Number,
    kelembabanUdara :Number,
    suhuUdara:Number,
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
  luasLahan: {
    type: Number,
    required: true
  },
  lokasiLahan: {
    type: String,
    required: true
  },
  spesies: {
    type: String,
    required: true
  },
  tanggal: {
    type: Date,
    required :true
  },
  perangkat:{
    type: PerangkatSchema,
    required: true
  }
});

module.exports = mongoose.model('Tanaman', TanamanSchema);
