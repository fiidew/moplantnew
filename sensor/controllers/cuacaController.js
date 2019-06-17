var mongoose = require('mongoose');
var passport = require('passport');
var config = require('../config/database');
require('../config/passport')(passport);
var jwt = require('jsonwebtoken');
var cuacaRepositories = require('../repositories/cuacaRepositories');
var Token = require('../services/TokenAuthentication');
var Response = require('../services/Response');

module.exports = {

  getWeather: async(req, res)=>{ 
    let response = new Response()
    try{
      // response.setData(await tananmanRepositories.streamUpdateData(req.body.kelembaban,req.body.ph,req.body.status,req.params.id))
      response.setData(await cuacaRepositories.getWeather(req.body.city))
    }catch(e){
      response.setStatus(false)
      response.setMessage(e)
    }
    res.json(response) 
    // return "sdsd"

  }
}
