var passport = require('passport');
require('../config/passport')(passport);
var jwt = require('jsonwebtoken');
var express = require('express');
var router = express.Router();
const notification_controller = require('../controllers/notificationController');

router.get('/getAll',passport.authenticate('jwt', { session: false}),notification_controller.getAllNotification);
router.post('/create',passport.authenticate('jwt', { session: false}),notification_controller.create);
router.post('/updateStatus',passport.authenticate('jwt', { session: false}),notification_controller.updateStatus);

module.exports = router;
