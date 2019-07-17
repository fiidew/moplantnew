var passport = require('passport');
require('../config/passport')(passport);
var jwt = require('jsonwebtoken');
var express = require('express');
var router = express.Router();
const tipe_controller = require('../controllers/tipeController');

router.post('/create',passport.authenticate('jwt', { session: false}),tipe_controller.create);
router.delete('/:id/delete',passport.authenticate('jwt', { session: false}), tipe_controller.tipe_delete);
router.put('/:id/update',passport.authenticate('jwt', { session: false}),tipe_controller.tipe_update);
router.get('/:id/tipedetail',passport.authenticate('jwt', { session: false}),tipe_controller.tipe_detail);
router.get('/tipe-show-all',passport.authenticate('jwt', { session: false}), tipe_controller.tipe_show_all);
module.exports = router;
