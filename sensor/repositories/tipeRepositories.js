var mongoose = require('mongoose');
var passport = require('passport');
var config = require('../config/database');
require('../config/passport')(passport);
var jwt = require('jsonwebtoken');
var Tipe = require("../models/tipetanaman");
var Tanaman = require("../models/tanaman");

const tipeRepositories = {
    createTipe: async(tipe,nitrogen,phosporusVL,phosporusL,phosporusM,potassiumVL,potassiumL,potassiumM)=>{
        let newTipe = new Tipe({
            tipe: tipe,
            nitrogen: nitrogen,
            phosporusVL: phosporusVL,
            phosporusL: phosporusL,
            phosporusM: phosporusM,
            potassiumVL: potassiumVL,
            potassiumL: potassiumL,
            potassiumM: potassiumM,
        });
        let saveTipe = await newTipe.save()
        if(saveTipe){
            return saveTipe
        }
    },
    
    deleteTipe: async(id)=>{
        let result = await Tipe.findByIdAndRemove(id)
        return result
    },

    getAllTipe: async () => {
        let result = await Tipe.find()
        return result
    },

    updateTipe: async (id, body) => {
        let result = await Tipe.findByIdAndUpdate(id, {
          $set: body
        })
        return result
    },

    detailTipe: async (id) => {
        let result = await Tipe.findById(id)
        return result
    },
}
module.exports = tipeRepositories