var passport = require('passport');
require('../config/passport')(passport);
var jwt = require('jsonwebtoken');
var express = require('express');
var router = express.Router();
const tanaman_controller = require('../controllers/tanamanController');

router.post('/create',passport.authenticate('jwt', { session: false}), tanaman_controller.create);
router.delete('/:id/delete',passport.authenticate('jwt', { session: false}), tanaman_controller.tanaman_delete);
router.put('/:id/update',passport.authenticate('jwt', { session: false}),tanaman_controller.tanaman_update);
router.get('/showtanaman',passport.authenticate('jwt', { session: false}),tanaman_controller.tanaman_show_by_farmer);
router.get('/:id/tanamandetail',passport.authenticate('jwt', { session: false}),tanaman_controller.tanaman_detail);
router.put('/:id/updatedata',tanaman_controller.data_update);
router.post('/data-today',passport.authenticate('jwt', { session: false}),tanaman_controller.getDataToday);
router.post('/data-in-time',passport.authenticate('jwt', { session: false}), tanaman_controller.getDataInTime);
router.get('/tanaman-show-all',passport.authenticate('jwt', { session: false}), tanaman_controller.tanaman_show_all);
router.get('/requested-tanaman',passport.authenticate('jwt', { session: false}), tanaman_controller.get_requested_tanaman);
module.exports = router;
