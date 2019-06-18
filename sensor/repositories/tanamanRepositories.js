var mongoose = require('mongoose');
var passport = require('passport');
var config = require('../config/database');
require('../config/passport')(passport);
var jwt = require('jsonwebtoken');
var Tanaman = require("../models/tanaman");
const socketApp = require('../socket/socket-app');
var ObjectId = require('mongoose').Types.ObjectId;
var farmerRepositories = require('../repositories/farmerRepositories');
// var ConnectRaspi = require('../services/ConnectRaspi');
var cuacaRepositories = require('../repositories/cuacaRepositories');
var Constants = require('../services/Constants');
const axios = require('axios');
const apiKey = '2717607dd9cced6c8f6e6b9d58d30db3';
          
///var admin = require("firebase-admin");
///var serviceAccount = require("../seecowapp-firebase-adminsdk-3hlhu-22888ee3ed.json");
/**
 * initial FCM app
//  */
// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
//   databaseURL: "https://seecowapp.firebaseio.com"
// });

var admin = require("firebase-admin");

var serviceAccount = require("../moplant-94217-firebase-adminsdk-mwnub-af35bd47b1.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://moplant-94217.firebaseio.com"
});

const tanamanRepositories = {
  getTanamanOnSpecificTime: async(id,start,end)=>{
    let result = await Tanaman.aggregate(

        // Pipeline
        [
          // Stage 1
          {
            $match: {
                _id: new ObjectId(id)
            
            }
          },
      
          // Stage 2
          {
            $unwind: {
                path : "$perangkat.data",
                includeArrayIndex : "arrayIndex", // optional
                preserveNullAndEmptyArrays : false // optional
            }
          },
      
          // Stage 3
          {
            $match: {
                "perangkat.data.tanggal": {
                    $gte: new Date(start),
                    $lte : new Date(end)
                    }
            }
          },
      
          // Stage 4
          {
            $group: {
                _id:{_id : "$_id",idFarmer: "$idFarmer",namaTanaman: "$namaTanaman",status: "$perangkat.status",idOnRaspi:"$perangkat.idOnRaspi"},
                listResult : {$push: "$perangkat.data"}
                
            }
          },
      
          // Stage 5
          {
            $project: {
                // specifications
                _id : "$_id._id",
                idFarmer: "$_id.idFarmer",
                namaTanaman: "$_id.namaTanaman",
                perangkat:{
                  status : "$_id.status",
                  data: "$listResult",
                  idOnRaspi: "$_id.idOnRaspi"                  
                }
                
            }
          }
      
        ])
        return result;
  },

  getTanamanByFarmers: async(id)=>{
    let checkFarmer = await farmerRepositories.getFarmerByIdUser(id)
      if(checkFarmer){
        let result = await Tanaman.find({
          idFarmer:checkFarmer._id
        })
        return result;
      }
  },

  getAllTanaman: async()=>{
    let result = await Tanaman.find()
    return result
  },
  
  // streamUpdateData : async(kelembaban, ph, status,id) => {
    streamUpdateData : async(kelembabanTanah, ph, kelembabanUdara, suhuUdara, status, id) => {
    var today = new Date();
    /**
     * condition dairy cows healty status
     */
    var tmpKelembabanTanah = Number(kelembabanTanah)
    var tmpPh = Number(ph)
    var tmpKelembabanUdara = Number(kelembabanUdara)
    var tmpSuhuUdara = Number(suhuUdara)
    var tmpKondisi = Constants.NORMAL_CONDITION
    if (tmpKelembabanTanah < Constants.SOIL_MOISTURE_LOWER_LIMIT || tmpKelembabanTanah > Constants.SOIL_MOISTURE_UPPER_LIMIT || tmpSuhuUdara < Constants.TEMPERATURE_LOWER_LIMIT || tmpSuhuUdara > Constants.TEMPERATURE_UPPER_LIMIT) {
      /**
       * Abnormal
       */
      tmpKondisi = Constants.ABNORMAL_CONDITION
      
      /**
       * Push notif to FCM
       */
      let tanamanInform = await Tanaman.findById(id)
           
      var registrationToken = "dApGNjvtYws:APA91bF-kHVAHVXQ6EZLMtPU1LgesKtIOuWBOlXhvzjf1uo-NF5U6IVsfFK03FtHshUaN0_41ohu9oJwHjBSCa207zmcxeBRvTpBNBkljj1OpgOWHNrDh9Bb6yoCOY26a-PvgKysAQas";
      var payload = {
        notification: {
          title: tanamanInform.namaTanaman + " is abnormal !!",
          body: "Please open yours Plant App and let's check your plant.."
        }
      };
      
       var options = {
        priority: "high",
        timeToLive: 60 * 60 *24
      };
      // admin.messaging().sendToDevice(registrationToken, payload, options)
      //   .then(function(response) {
      //     console.log("Successfully sent message:", response);
      //   })
      //   .catch(function(error) {
      //     console.log("Error sending message:", error);
      //   });
    }
    let tanamanOnUpdate =  await 
    Tanaman.update({
      _id:id
    },
    {
      $set: {
        "perangkat.status": status
      },
      $push: {
        "perangkat.data": {
          tanggal: today,
          kelembabanTanah: kelembabanTanah,
          ph: ph,
          kelembabanUdara: kelembabanUdara,
          suhuUdara: suhuUdara,
          kondisi: tmpKondisi
          }
        }
      }
    )
    if(tanamanOnUpdate){
      let tanamanAfterUpdated = await Tanaman.findById(id)
      if(tanamanAfterUpdated){
        /**
         * create topic each cows, and emmit when update data..
         */
        socketApp.notifyDetailPlants(id, tanamanAfterUpdated)
        /**
         * get cows by farmers and emit
         */
        let emitToSocket = await Tanaman.find({
          idFarmer: tanamanAfterUpdated.idFarmer
        })
        if(emitToSocket){
          /**
           * emit data
           */
          socketApp.notifyPlantsData(tanamanAfterUpdated.idFarmer, emitToSocket)
          return tanamanAfterUpdated
        }

      }
    }
  },
  updateTanaman : async(id, body)=>{
    let result = await Tanaman.findByIdAndUpdate(id, {
      $set: body
    })
    return result
  },
  deleteTanaman: async(id)=>{
    let result = await Tanaman.findByIdAndRemove(id)
    return result
  },
  detailTanaman: async(id)=>{
    let result = await Tanaman.findById(id)
    return result
  },

  createTanaman: async(id, namaTanaman, luasLahan, lokasiLahan, spesies, tanggal)=>{
    let checkFarmer = await farmerRepositories.getFarmerByIdUser(id)
    if(checkFarmer){
      /**
         * initial first data,
         * perangkat status
         * 1 -> active
         * 0 -> non-active
         * 2 -> pending
         * kondisi
         * 1 -> normal
         * 0 -> tidak normal
         */
        var today = new Date();
        var initial_kelembaban_tanah = 10;
        var initial_ph = 10;
        var initial_kelembaban_udara = 10;
        var initial_suhu_udara = 10;
        var initial_status = Constants.DEVICE_PENDING;
        var initial_kondisi = Constants.NORMAL_CONDITION;
        let sub_data = {
          tanggal: today,
          kelembabanTanah: initial_kelembaban_tanah,
          ph: initial_ph,
          kelembabanUdara:initial_kelembaban_udara,
          suhuUdara:initial_suhu_udara,
          kondisi: initial_kondisi
        }

        let sub_perangkat = {
          status: initial_status,
          data: [sub_data]
        }
        var newTanaman = new Tanaman({
          idFarmer: checkFarmer._id,
          namaTanaman: namaTanaman,
          luasLahan:luasLahan,
          lokasiLahan:lokasiLahan,
          spesies:spesies,
          tanggal:tanggal,
          perangkat: sub_perangkat
        });
        let saveTanaman = await newTanaman.save()
        if(saveTanaman){
          return saveTanaman
          // let url = await axios.get("http://api.openweathermap.org/data/2.5/weather?q="+saveTanaman.lokasiLahan+"&units=imperial&appid=2717607dd9cced6c8f6e6b9d58d30db3");
          // let url = "http://api.openweathermap.org/data/2.5/weather?q="+surabaya+"&units=imperial&appid="+apikey
          // return url
          // let response_body = await axios.get(url);
          // return url.data;
        }
        // if(saveTanaman){
        //   let createOnRaspi = await ConnectRaspi.createInitial(saveTanaman._id)
        //   if(createOnRaspi){
        //     let updateTanaman = await 
        //     Tanaman.update({
        //       _id: saveTanaman._id
        //     },{
        //       $set: {
        //         "perangkat.idOnRaspi": createOnRaspi.data.perangkat._id
        //       }
        //     }
        //   )
        //   if(updateTanaman){
        //     return createOnRaspi.data
        //   }
        //  }
        // }
        if(saveTanaman){
          // city : saveTanaman.lokasiLahan,
          let getweather = await cuacaRepositories.getweather(saveTanaman.lokasiLahan)
          if (getweather) {
            console.log(getweather)
          }
        }
     
    }
  },
  
  getRequestTanaman: async()=>{
    let result = await Tanaman.aggregate(
      // Pipeline
      [
        // Stage 1
        {
          $match: {
              "perangkat.status":Constants.DEVICE_PENDING
          }
        },

        // Stage 2
        {
          $lookup: // Equality Match
          {
              from: "farmers",
              localField: "idFarmer",
              foreignField: "_id",
              as: "farmer_docs"
          }
          
          // Uncorrelated Subqueries
          // (supported as of MongoDB 3.6)
          // {
          //    from: "<collection to join>",
          //    let: { <var_1>: <expression>, …, <var_n>: <expression> },
          //    pipeline: [ <pipeline to execute on the collection to join> ],
          //    as: "<output array field>"
          // }
        },

      ]

      // Created with Studio 3T, the IDE for MongoDB - https://studio3t.com/
    )
    return result
  }

}

module.exports = tanamanRepositories