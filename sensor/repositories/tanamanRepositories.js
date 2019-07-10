var mongoose = require('mongoose');
var passport = require('passport');
var config = require('../config/database');
require('../config/passport')(passport);
var jwt = require('jsonwebtoken');
var Tanaman = require("../models/tanaman");
const socketApp = require('../socket/socket-app');
var ObjectId = require('mongoose').Types.ObjectId;
var farmerRepositories = require('../repositories/farmerRepositories');
var userRepositories = require('../repositories/userRepositories');
// var ConnectRaspi = require('../services/ConnectRaspi');
var cuacaRepositories = require('../repositories/cuacaRepositories');
var Constants = require('../services/Constants');
const axios = require('axios');
const apiKey = '2717607dd9cced6c8f6e6b9d58d30db3';
var dataCuaca;
// var token = ;//ini untuk tempat fcm
// var FCM = require('fcm-node');
// var serverKey = 'AAAAjafK0jc:APA91bHJqM3wGjJ9B3ukavjNGEmmIs1EPVlHkKGdMQtrOt_qoF7HLhZMhzcUe_GmftNZJbgyLfl8IYhXXDgguwBEh8BHih0f6LoaC0MmUVuyY9OH4Fl_LKtZ7366j4Nrekls0R4j5K-W'; //put your server key here
// var fcm = new FCM(serverKey);
// var token='fHihrlISUEQ:APA91bE9pGv_WQDEJtBf2Dg9z8kbkao8P2sKWcXzNxEXTpoOiWhTuBd--Rv8JtZ3ABOXpTftLCL8JyYAoQ2n8wpeh0qiOh_PY8svfEXQYX0Rc49Ia2l_rVG2vt3c71z2Cna6zcZSvpA2';

//         fHihrlISUEQ:APA91bE9pGv_WQDEJtBf2Dg9z8kbkao8P2sKWcXzNxEXTpoOiWhTuBd--Rv8JtZ3ABOXpTftLCL8JyYAoQ2n8wpeh0qiOh_PY8svfEXQYX0Rc49Ia2l_rVG2vt3c71z2Cna6zcZSvpA2

          


// var admin = require("firebase-admin");

// var serviceAccount = require("../moplant-94217-firebase-adminsdk-mwnub-af35bd47b1.json");

// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
//   databaseURL: "https://moplant-94217.firebaseio.com"
// });

var admin = require("firebase-admin");

var serviceAccount = require("../android-e71ee-firebase-adminsdk-ot8mj-bf38ebeee9.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://android-e71ee.firebaseio.com"
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
                _id:{_id : "$_id",idFarmer: "$idFarmer",namaTanaman: "$namaTanaman",luasLahan: "$luasLahan",lokasiLahan: "$lokasiLahan",spesies: "$spesies",tanggal: "$tanggal",status: "$perangkat.status",idOnRaspi:"$perangkat.idOnRaspi"},
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
                luasLahan: "$_id.luasLahan",
                lokasiLahan: "$_id.lokasiLahan",
                spesies: "$_id.spesies",
                tanggal: "$_id.tanggal",
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


  getTanamanWatering: async(id,start,end)=>{
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
                _id:{_id : "$_id",idFarmer: "$idFarmer",namaTanaman: "$namaTanaman",luasLahan: "$luasLahan",lokasiLahan: "$lokasiLahan",spesies: "$spesies",tanggal: "$tanggal",status: "$perangkat.status",idOnRaspi:"$perangkat.idOnRaspi"},
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
                luasLahan: "$_id.luasLahan",
                lokasiLahan: "$_id.lokasiLahan",
                spesies: "$_id.spesies",
                tanggal: "$_id.tanggal",
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



  getWeather: async(city)=>{
      let url = "http://api.apixu.com/v1/forecast.json?key=d88585dc80d142ffba495649192206&q="+city
  // let url = "http://api.openweathermap.org/data/2.5/weather?q="+city+"&units=imperial&appid="+apiKey
  // return url
  let response_body = await axios.get(url);
  // console.log(response_body);
  // let weather = JSON.parse(response_body);
  // console.log("asdasdasd")
  // console.log(response_body)
  //return response_body.data;
  this.dataCuaca=response_body.data;
  return this.dataCuaca;
  //return this.dataCuaca.forecast.forecastday[0].day.totalprecip_mm;
  },

  getnotification: async()=>{
    var registrationToken = await userRepositories.getProfileUser(tanamanInform.idUser);
      if (registrationToken) {
      var payload = {
        notification: {
          title: " Time to watering !!",
          // title: today.getMinutes() + " is abnormal !!",
          // title: cuaca.location.name + " is abnormal !!",
          body: "Please open yours Plant App and let's check your plant.."
        }
      };
      
       var options = {
        priority: "high",
        timeToLive: 60 * 60 *24
      };
      admin.messaging().sendToDevice(registrationToken, payload, options)
        .then(function(response) {
          console.log("Successfully sent message:", response);
        })
        .catch(function(error) {
          console.log("Error sending message:", error);
        });
        
    }
    // var registrationToken = "dE0WrIzirQg:APA91bE49c0uRNpeBJC5G_qI0Wihs_9vhKGOTLY_lM1-KV_PkfxP-qD8hVHoP6pDYfOzbf_wcZ_c8tHmRCONjZhkx_UhhIbJcQRL5OpPz8nL1FW-rMMMtUQqWjPJPjiu8EjHgqzJlcqZ";
    //   var payload = {
    //     notification: {
    //       title: " This day !!",
    //       // title: today.getMinutes() + " is abnormal !!",
    //       // title: cuaca.location.name + " is abnormal !!",
    //       body: "Please open yours Plant App and let's check your plant.."
    //     }
    //   };
      
    //    var options = {
    //     priority: "high",
    //     timeToLive: 60 * 60 *24
    //   };
    //   admin.messaging().sendToDevice(registrationToken, payload, options)
    //     .then(function(response) {
    //       console.log("Successfully sent message:", response);
    //     })
    //     .catch(function(error) {
    //       console.log("Error sending message:", error);
    //     });
 
   // var registrationToken = token;
   //    var payload = {
   //      notification: {
   //        title:  " is abnormal !!",
   //        body: "Please open yours Plant App and let's check your plant.."
   //      }
   //    };
      
   //     var options = {
   //      priority: "high",
   //      timeToLive: 60 * 60 *24
   //    };
      // admin.messaging().sendToDevice(registrationToken, payload, options)
      //   .then(function(response) {
      //     console.log("Successfully sent message:", response);
      //   })
      //   .catch(function(error) {
      //     console.log("Error sending message:", error);
      //   });
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
    streamUpdateData : async(kelembabanTanah, ph, kelembabanUdara, suhuUdara, kondisi, status, id) => {
    var today = new Date();
    let tanamanInform = await Tanaman.findById(id);
    let cuaca = await tanamanRepositories.getWeather(tanamanInform.lokasiLahan);
    // let user = await userRepositories.profile(tanamanInform.idFarmer);
    // let checkUser = await farmerRepositories.getUserByIdFarmer(tanamanInform.idFarmer)
    let getToken= await userRepositories.getProfileUser(tanamanInform.idUser);
    /**
     * condition dairy plants healty status
     */
    var tmpKelembabanTanah = Number(kelembabanTanah)
    var tmpPh = Number(ph)
    var tmpKelembabanUdara = Number(kelembabanUdara)
    var tmpSuhuUdara = Number(suhuUdara)
    var tmpKondisi = Number(kondisi)
    var timeHours = Number(today.getHours())
    var timeMinutes = Number(today.getMinutes())
    var weatherPrec = Number(cuaca.forecast.forecastday[0].day.totalprecip_mm)
    var volume = 0
    //jadi tanaman di jadwalkan untuk disiram pada jam 9.00 ketika tidak ada hujan, dan 17.00 ketika tidak ada hujan
    if ((timeHours == 16 && timeMinutes==55 && weatherPrec == 0) || (timeHours == 17 && timeMinutes==01 && weatherPrec == 0 ) || (timeHours == 9  && timeMinutes==10 && weatherPrec > 0 && weatherPrec < 50)) {
       //untuk menghitung volume yang dibutuhkan
        // volume=tanamanInform.luasLahan*kondisi-(weatherPrec*1000)
        volume=tanamanInform.luasLahan*kondisi
    }
    else
    {
        volume = 0   
    }
    
    // if ((timeHours == 9 && timeMinutes==01 && weatherPrec == 0) || (timeHours == 17 && timeMinutes==01 && weatherPrec == 0 ) || (timeHours == 9  && timeMinutes==01 && weatherPrec > 0 && weatherPrec < 50)) {
       if (tmpKelembabanTanah<50) {
  
           
      var registrationToken = getToken.fcmtoken;
      // var registrationToken = "fnhPISSRd7Q:APA91bFtaTMdiO4FpxhHE_Voda-ahCG_8YXiad6MEvlDfjD_nWQ946Ug5NV7YH6O-FO8PDKMe2508U7J7S4o5oRwTxIWluBR9lmkvVTNxpr-llHS2aclaSy6vPUh8b3mtZ1t2ytKD2py";
      if (registrationToken) {
      var payload = {
        notification: {
          title: tanamanInform.namaTanaman + " Time to watering !!",
          // title: today.getMinutes() + " is abnormal !!",
          // title: cuaca.location.name + " is abnormal !!",
          body: "Please open yours Plant App and let's check your plant.."
        }
      };
      
       var options = {
        priority: "high",
        timeToLive: 60 * 60 *24
      };
      admin.messaging().sendToDevice(registrationToken, payload, options)
        .then(function(response) {
          console.log("Successfully sent message:", response);
        })
        .catch(function(error) {
          console.log("Error sending message:", error);
        });
        
    }
    }
    //untuk memberikan notifikasi bagaiaman kondisi hari ini
    else if(timeHours == 8 && timeMinutes==48 && weatherPrec>0) {
           
      var registrationToken = token;
      var payload = {
        notification: {
          title: tanamanInform.lokasiLahan + " This day !!" + cuaca.forecast.forecastday[0].day.condition.text,
          // title: today.getMinutes() + " is abnormal !!",
          // title: cuaca.location.name + " is abnormal !!",
          body: "Please open yours Plant App and let's check your plant.."
        }
      };
      
       var options = {
        priority: "high",
        timeToLive: 60 * 60 *24
      };
      admin.messaging().sendToDevice(registrationToken, payload, options)
        .then(function(response) {
          console.log("Successfully sent message:", response);
        })
        .catch(function(error) {
          console.log("Error sending message:", error);
        });
        
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
          kondisi: volume
          }
        }
      }
    )
    if(tanamanOnUpdate){
      let tanamanAfterUpdated = await Tanaman.findById(id)
      if(tanamanAfterUpdated){
        /**
         * create topic each plants, and emmit when update data..
         */
        socketApp.notifyDetailPlants(id, tanamanAfterUpdated)
        /**
         * get plants by farmers and emit
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
        var initial_kelembaban_tanah = 60;
        var initial_ph = 10;
        var initial_kelembaban_udara = 27;
        var initial_suhu_udara = 30;
        var initial_status = Constants.DEVICE_PENDING;
        var initial_kondisi = Constants.ABNORMAL_CONDITION;
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
          idUser:id,
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