var mongoose = require('mongoose');
var passport = require('passport');
var config = require('../config/database');
require('../config/passport')(passport);
var jwt = require('jsonwebtoken');
var Farmer = require("../models/farmer");

const farmerRepositories = {
    getFarmerByIdUser: async(params) => {
        let result = await Farmer.findOne({
            idUser:params
        });
        return result;
    }
}
module.exports = farmerRepositories