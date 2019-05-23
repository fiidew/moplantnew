var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var PerangkatSchema = new Schema({
//   idSapi: {
//     type: Schema.Types.ObjectId,
//   },
  status: Number,
  data: [{
    tanggal:{ type: Date, default: Date.now },
    kelembaban:Number,
    ph:Number
  }]
});

module.exports = mongoose.model('Perangkat', PerangkatSchema);
