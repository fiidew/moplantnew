var mongoose = require('mongoose');
var passport = require('passport');
var config = require('../config/database');
require('../config/passport')(passport);
var jwt = require('jsonwebtoken');
var Tanaman = require("../models/tanaman");
const socketApp = require('../socket/socket-app');
var ObjectId = require('mongoose').Types.ObjectId;
var farmerRepositories = require('../repositories/farmerRepositories');
var Constants = require('../services/Constants');
const apiKey = '2717607dd9cced6c8f6e6b9d58d30db3';
const axios = require('axios');

const cuacaRepositories = {
  
  // getWeather: async(city)=>{
  // let url = `http://api.openweathermap.org/data/2.5/weather?q=${city}&units=imperial&appid=${apiKey}`
  // let response_body = await request(url);
  // let weather = JSON.parse(response_body)
  // return weather;
  // }
  getWeather: async(city)=>{
  //let url = "http://api.openweathermap.org/data/2.5/weather?q="+city+"&units=imperial&appid="+apiKey
  let url = "http://api.apixu.com/v1/forecast.json?key=d88585dc80d142ffba495649192206&q="+city
  // return url
  let response_body = await axios.get(url);
  // console.log(response_body);
  // let weather = JSON.parse(response_body);
  // console.log("asdasdasd")
  // console.log(response_body)
  return response_body.data;
  },
  // setInterval(getWeather, );
}

module.exports = cuacaRepositories