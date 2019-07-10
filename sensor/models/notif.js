var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var today = new Date();

var NotificationSchema = new Schema({
    recommendation: {
      type: String,
      required: true
    },
    status: {
      type: Number,
      required: true
    },
    tanggal: {
      type: Date,
      required :true,
      default: today
    }
  });
  
module.exports = mongoose.model('Notification', NotificationSchema);
  