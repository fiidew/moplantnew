var passport = require('passport');
require('../config/passport')(passport);
var jwt = require('jsonwebtoken');
var express = require('express');
var router = express.Router();
const user_controller = require('../controllers/userController');
var VerifyToken = require('../config/VerifyToken');

router.post('/farmersignup', user_controller.farmer_signup);
router.post('/usersignup', user_controller.user_signup);
router.post('/signin', user_controller.signin);
// router.get('/me',VerifyToken, user_controller.me);
router.get('/me',passport.authenticate('jwt', { session: false}),user_controller.me);
// router.get('/logout',user_controller.logout);
router.delete('/:id/delete',passport.authenticate('jwt', { session: false}), user_controller.user_delete);
router.put('/:id/update',passport.authenticate('jwt', { session: false}),user_controller.user_update);
router.get('/alluser',passport.authenticate('jwt', { session: false}),user_controller.all_farmer);
// router.post('/book', passport.authenticate('jwt', { session: false}),user_controller.book_post);
// router.get('/book', passport.authenticate('jwt', { session: false}), user_controller.book_get);

module.exports = router;
