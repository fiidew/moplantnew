var mongoose = require('mongoose');
var passport = require('passport');
var config = require('../config/database');
require('../config/passport')(passport);
var jwt = require('jsonwebtoken');
var tipeRepositories = require('../repositories/tipeRepositories');
var Token = require('../services/TokenAuthentication');
var Response = require('../services/Response');

module.exports = {
  tipe_show_all: async(req, res)=>{
    let token = Token.authorizationToken(req.headers); 
    if(token){
      let response = new Response()
        try {
          response.setData(await tipeRepositories.getAllTipe())
        } catch (e) {
          response.setStatus(false)
          response.setMessage(JSON.stringify(e))
        }
        res.json(response) 
    }else{
      res.json(response.unAuthorized());
    }
  },
  tipe_update: async(req,res)=>{
    let response = new Response()
    try{
      response.setData(await tipeRepositories.updateTipe(req.params.id, req.body))
    }catch(e){
      response.setStatus(false)
      response.setMessage(JSON.stringify(e))
    }
    res.json(response)
  },
  tipe_delete: async(req, res)=>{
    let response = new Response();
    try{
      response.setData(await tipeRepositories.deleteTipe(req.params.id))
    }catch(e){
      response.setStatus(false)
      response.setMessage(JSON.stringify(e))
    }
    res.json(response)
  },
  tipe_detail: async(req,res)=>{
    let token = Token.authorizationToken(req.headers);
      if(token){
        let response = new Response()
        try {
          response.setData(await tipeRepositories.detailTipe(req.params.id))
        } catch (e) {
          response.setStatus(false)
          response.setMessage(JSON.stringify(e))
        }
        res.json(response)  
      }else{
        res.json(response.unAuthorized());
      }
  },
  //membuat nama tanaman
  create: async(req,res)=>{
    let token = Token.authorizationToken(req.headers);
    
    if(token){
      let response = new Response()
      //setiap kali klien mengakses url REST API kita, maka kita harus melakukan pengecekan terhadap token yang diberikan. Jika token yang di berikan valid, maka klien diperbolehkan untuk mengakses, jika tidak, maka balas dengan pesan error.      let response = new Response()
        try {
          response.setData(await tipeRepositories.createTipe(req.body.tipe, req.body.nitrogen, req.body.phosporusVL, req.body.phosporusL, req.body.phosporusM, req.body.potassiumVL, req.body.potassiumL, req.body.potassiumM))
        } catch (e) {
          response.setStatus(false)
          response.setMessage(JSON.stringify(e))
        }
        res.json(response) 
    }else{
      res.json(response.unAuthorized());
    }
  }

}
