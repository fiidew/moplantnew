var mongoose = require('mongoose');
var passport = require('passport');
var config = require('../config/database');
require('../config/passport')(passport);
var jwt = require('jsonwebtoken');
var tanamanRepositories = require('../repositories/tanamanRepositories');
var Token = require('../services/TokenAuthentication');
var Response = require('../services/Response');

module.exports = {
  // get_specific_time: async(req, res)=>{
  //   let token = Token.authorizationToken(req.headers);
  //     if(token){
  //       let response = new Response()
  //       try {
  //         response.setData(await sapiRepositories.getSapiOnSpecificTime())
  //       } catch (e) {
  //         response.setStatus(false)
  //         response.setMessage(e)
  //       }
  //       res.json(response)  
  //     }else{
  //       res.json(response.unAuthorized());
  //     }
  // },
  getDataToday : async(req,res)=>{
    let token = Token.authorizationToken(req.headers);
    var today = new Date();
    var yesterday = new Date();
    yesterday.setDate(today.getDate()-1);
      if(token){
        let response = new Response()
        try {
          response.setData(await tanamanRepositories.getTanamanOnSpecificTime(req.body.idTanaman,yesterday.toISOString(),today.toISOString()))
        } catch (e) {
          response.setStatus(false)
          response.setMessage(e)
        }
        res.json(response)  
      }else{
        res.json(response.unAuthorized());
      }
  },
  getDataInTime : async(req,res)=>{
    let token = Token.authorizationToken(req.headers);
    var start_temp = new Date(req.body.start) 
    var end_temp = new Date(req.body.end)
    var start = start_temp.toISOString()
    var end = end_temp.toISOString()
    // var start = req.body.start;
    // var yesterday = req.body.end;
      if(token){
        let response = new Response()
        try {
          response.setData(await tanamanRepositories.getTanamanOnSpecificTime(req.body.idTanaman,start,end))
        } catch (e) {
          response.setStatus(false)
          response.setMessage(e)
        }
        res.json(response)  
      }else{
        res.json(response.unAuthorized());
      }
  },
  tanaman_show_by_farmer: async(req, res)=>{
    let token = Token.authorizationToken(req.headers);
    
    if(token){
      let result_decode = jwt.verify(token, config.secret)
      let response = new Response()
        try {
          response.setData(await tanamanRepositories.getTanamanByFarmers(result_decode._doc._id))
        } catch (e) {
          response.setStatus(false)
          response.setMessage(e)
        }
        res.json(response) 
    }else{
      res.json(response.unAuthorized());
    }
  },
  get_requested_tanaman: async(req,res)=>{
    let token = Token.authorizationToken(req.headers)
    if(token){
      let response = new Response()
        try {
          response.setData(await tanamanRepositories.getRequestTanaman())
        } catch (e) {
          response.setStatus(false)
          response.setMessage(e)
        }
        res.json(response)
    }else{
      res.json(response.unAuthorized());
    }
  },
  tanaman_show_all: async(req, res)=>{
    let token = Token.authorizationToken(req.headers); 
    if(token){
      let response = new Response()
        try {
          response.setData(await tanamanRepositories.getAllTanaman())
        } catch (e) {
          response.setStatus(false)
          response.setMessage(e)
        }
        res.json(response) 
    }else{
      res.json(response.unAuthorized());
    }
  },
  data_update: async(req, res)=>{
    let response = new Response()
    try{
      // response.setData(await tananmanRepositories.streamUpdateData(req.body.kelembaban,req.body.ph,req.body.status,req.params.id))
      response.setData(await tanamanRepositories.streamUpdateData(req.body.kelembabanTanah, req.body.ph, req.body.kelembabanUdara, req.body.suhuUdara, req.body.status, req.params.id))
    }catch(e){
      response.setStatus(false)
      response.setMessage(e)
    }
    res.json(response) 
  },
  tanaman_update: async(req,res)=>{
    let response = new Response()
    try{
      response.setData(await tanamanRepositories.updateTanaman(req.params.id, req.body))
    }catch(e){
      response.setStatus(false)
      response.setMessage(e)
    }
    res.json(response)
  },
  tanaman_delete: async(req, res)=>{
    let response = new Response();
    try{
      response.setData(await tanamanRepositories.deleteTanaman(req.params.id))
    }catch(e){
      response.setStatus(false)
      response.setMessage(e)
    }
    res.json(response)
  },
  tanaman_detail: async(req,res)=>{
    let token = Token.authorizationToken(req.headers);
      if(token){
        let response = new Response()
        try {
          response.setData(await tanamanRepositories.detailTanaman(req.params.id))
        } catch (e) {
          response.setStatus(false)
          response.setMessage(e)
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
      //setiap kali klien mengakses url REST API kita, maka kita harus melakukan pengecekan terhadap token yang diberikan. Jika token yang di berikan valid, maka klien diperbolehkan untuk mengakses, jika tidak, maka balas dengan pesan error.
      let result_decode = jwt.verify(token, config.secret)
      let response = new Response()
        try {
          response.setData(await tanamanRepositories.createTanaman(result_decode._doc._id,req.body.namaTanaman,req.body.luasLahan,req.body.lokasiLahan, req.body.spesies, req.body.tanggal))
        } catch (e) {
          response.setStatus(false)
          response.setMessage(e)
        }
        res.json(response) 
    }else{
      res.json(response.unAuthorized());
    }
  }
}
