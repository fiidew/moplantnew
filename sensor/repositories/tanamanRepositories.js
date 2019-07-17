var mongoose = require('mongoose');
var passport = require('passport');
var config = require('../config/database');
require('../config/passport')(passport);
var jwt = require('jsonwebtoken');
var Tanaman = require("../models/tanaman");
var Tipe = require("../models/tipetanaman");
const socketApp = require('../socket/socket-app');
var ObjectId = require('mongoose').Types.ObjectId;
var farmerRepositories = require('../repositories/farmerRepositories');
var userRepositories = require('../repositories/userRepositories');
var tipeRepositories = require('../repositories/tipeRepositories');
var notificationRepositories = require('../repositories/notificationRepositories');
var cuacaRepositories = require('../repositories/cuacaRepositories');
var Constants = require('../services/Constants');
const axios = require('axios');

var admin = require("firebase-admin");
var rekomendasi = [
  "Fertilizers that need to be added are NPK Mutiara of 117.6 gr/m2 or 98.8 gr/m2",
  "Fertilizers that need to be added are NPK Mutiara of 117.6 gr/m2 or 98.8 gr/m2",
  "pupuk npk 1,21 gr/ polybag + 0,2 gr/polybag + 0,1 gr/polybag",
  "Fertilizers that need to be added are NPK Mutiara of 117.6 gr/m2 or 102.3 gr/m2 or 65.8 gr/m2",
  "The condition of nutrients in the soil is optimal",
  "The condition of nutrients in the soil is optimal",
  "The condition of nutrients in the soil is optimal",
  "The condition of nutrients in the soil is optimal",
  "Fertilizers that need to be added are NPK Mutiara of 117.6 gr/m2 or 125.2 gr/m2",
  "Fertilizers that need to be added are NPK Mutiara of 117.6 gr/m2 or 102.3 gr/m2",
  "Fertilizers that need to be added are NPK Mutiara of 117.6 gr/m2",
  "The condition of nutrients in the soil is optimal"
];

var serviceAccount = require("../android-e71ee-firebase-adminsdk-ot8mj-1f113f90c4.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://android-e71ee.firebaseio.com"
});



const tanamanRepositories = {

  getTanamanOnSpecificTime: async (id, start, end) => {
    let result = await Tanaman.aggregate(
      [
        {
          $match: {
            _id: new ObjectId(id)
          }
        },
        {
          $unwind: {
            path: "$perangkat.data",
            includeArrayIndex: "arrayIndex", // optional
            preserveNullAndEmptyArrays: false // optional
          }
        },
        {
          $match: {
            "perangkat.data.tanggal": {
              $gte: new Date(start),
              $lte: new Date(end)
            }
          }
        },
        {
          $group: {
            _id: { _id: "$_id", idFarmer: "$idFarmer", namaTanaman: "$namaTanaman", luasLahan: "$luasLahan", lokasiLahan: "$lokasiLahan", spesies: "$spesies", tanggal: "$tanggal", status: "$perangkat.status", idOnRaspi: "$perangkat.idOnRaspi" },
            listResult: { $push: "$perangkat.data" }

          }
        },
        {
          $project: {
            _id: "$_id._id",
            idFarmer: "$_id.idFarmer",
            namaTanaman: "$_id.namaTanaman",
            luasLahan: "$_id.luasLahan",
            lokasiLahan: "$_id.lokasiLahan",
            spesies: "$_id.spesies",
            tanggal: "$_id.tanggal",
            perangkat: {
              status: "$_id.status",
              data: "$listResult",
              idOnRaspi: "$_id.idOnRaspi"
            }

          }
        }
      ])
    return result;
  },
  getTanamanWatering: async (id, start, end) => {
    let result = await Tanaman.aggregate(
      [
        {
          $match: {
            _id: new ObjectId(id)
          }
        },
        {
          $unwind: {
            path: "$perangkat.data",
            includeArrayIndex: "arrayIndex", // optional
            preserveNullAndEmptyArrays: false // optional
          }
        },
        {
          $match: {
            "perangkat.data.tanggal": {
              $gte: new Date(start),
              $lte: new Date(end)
            }
          }
        },
        {
          $group: {
            _id: { _id: "$_id", idFarmer: "$idFarmer", namaTanaman: "$namaTanaman", luasLahan: "$luasLahan", lokasiLahan: "$lokasiLahan", spesies: "$spesies", tanggal: "$tanggal", status: "$perangkat.status", idOnRaspi: "$perangkat.idOnRaspi" },
            listResult: { $push: "$perangkat.data" }
          }
        },
        {
          $project: {
            _id: "$_id._id",
            idFarmer: "$_id.idFarmer",
            namaTanaman: "$_id.namaTanaman",
            luasLahan: "$_id.luasLahan",
            lokasiLahan: "$_id.lokasiLahan",
            spesies: "$_id.spesies",
            tanggal: "$_id.tanggal",
            perangkat: {
              status: "$_id.status",
              data: "$listResult",
              idOnRaspi: "$_id.idOnRaspi"
            }
          }
        }
      ])
    return result;
  },

  getWeather: async (city) => {
    let url = "http://api.apixu.com/v1/forecast.json?key=d88585dc80d142ffba495649192206&q=" + city
    let response_body = await axios.get(url);
    this.dataCuaca = response_body.data;
    return this.dataCuaca;
  },

  getnotification: async () => {
    var registrationToken = await userRepositories.getProfileUser(tanamanInform.idUser);
    if (registrationToken) {
      var payload = {
        notification: {
          title: " Time to watering !!",
          body: "Please open yours Plant App and let's check your plant.."
        }
      };

      var options = {
        priority: "high",
        timeToLive: 60 * 60 * 24
      };
      admin.messaging().sendToDevice(registrationToken, payload, options)
        .then(function (response) {
          console.log("Successfully sent message:", response);
        })
        .catch(function (error) {
          console.log("Error sending message:", error);
        });

    }
  },
  getTanamanByFarmers: async (id) => {
    let checkFarmer = await farmerRepositories.getFarmerByIdUser(id)
    if (checkFarmer) {
      let result = await Tanaman.find({
        idFarmer: checkFarmer._id
      })
      return result;
    }
  },

  getAllTanaman: async () => {
    let result = await Tanaman.find()
    return result
  },
  streamUpdateData: async (kelembabanTanah, ph, kelembabanUdara, suhuUdara, kondisi, status, id) => {
    var today = new Date();
    let tanamanInform = await Tanaman.findById(id);
    let cuaca = await tanamanRepositories.getWeather(tanamanInform.lokasiLahan);
    let getToken = await userRepositories.getProfileUser(tanamanInform.idUser);
    /**
     * condition dairy plants healty status
     */
    // var type = await Tipe.findById("5d2dde4018e3df05a898788a");

    var tmpKelembabanTanah = Number(kelembabanTanah)
    var tmpPh = Number(tmpPh)
    var tmpKelembabanUdara = Number(kelembabanUdara)
    var tmpSuhuUdara = Number(suhuUdara)
    var tmpKondisi = Number(kondisi)
    var timeHours = Number(today.getHours())
    var timeMinutes = Number(today.getMinutes())
    var weatherPrec = Number(cuaca.forecast.forecastday[0].day.totalprecip_mm)
    var volume = 0
    var statusPh = 0
    var indeksRekomendasi = 0
    //jadi tanaman di jadwalkan untuk disiram pada jam 9.00 ketika tidak ada hujan, dan 17.00 ketika tidak ada hujan
    if ((timeHours == 16 && timeMinutes == 55 && weatherPrec == 0) || (timeHours == 17 && timeMinutes == 01 && weatherPrec == 0) || (timeHours == 9 && timeMinutes == 10 && weatherPrec > 0 && weatherPrec < 50)) {
      //untuk menghitung volume yang dibutuhkan
      // volume=tanamanInform.luasLahan*kondisi-(weatherPrec*1000)
      volume = tanamanInform.luasLahan * kondisi
    }
    else {
      volume = 0
    }
    if (tmpPh >= 4 && tmpPh < 4,5){
      statusPh = 0
      indeksRekomendasi = 0
    }
    else if (tmpPh >= 4,5 && tmpPh <5){
      statusPh = 0
      indeksRekomendasi = 1
    }
    else if (tmpPh >= 5 && tmpPh <5,5){
      statusPh = 0
      indeksRekomendasi = 2
    }
    else if (tmpPh >= 5,5 && tmpPh <6){
      statusPh = 0
      indeksRekomendasi = 3
    }
    else if (tmpPh >= 6 && tmpPh <6,5){
      statusPh = 1
      indeksRekomendasi = 4
    }
    else if (tmpPh >= 6,5 && tmpPh <7){
      statusPh = 1
      indeksRekomendasi = 5
    }
    else if (tmpPh >= 7 && tmpPh <7,5){
      statusPh = 1
      indeksRekomendasi = 6
    }
    else if (tmpPh >= 7,5 && tmpPh <8){
      statusPh = 1
      indeksRekomendasi = 7
    }
    else if (tmpPh >= 8 && tmpPh <8,5){
      statusPh = 0
      indeksRekomendasi = 8
    }
    else if (tmpPh >= 8,5 && tmpPh <9){
      statusPh = 0
      indeksRekomendasi = 9
    }
    else if (tmpPh >= 9 && tmpPh <9,5){
      statusPh = 0
      indeksRekomendasi = 10
    }
    else if (tmpPh >= 9,5 && tmpPh <10){
      statusPh = 1
      indeksRekomendasi = 11
    }else{
      statusPh = 0
      indeksRekomendasi = 0
    }
    // kalo statusPh 0 berarti nggak optimal butuh rekomendasi
    // kalo statusPh 1 berarti optimal
    if (statusPh == 0) {
      var registrationToken = getToken.fcmtoken;
      if (registrationToken) {
        var payload = {
          notification: {
            title: tanamanInform.namaTanaman + " Need Fertilization !!",
            body: rekomendasi[indeksRekomendasi]
          }
        };

        var options = {
          priority: "high",
          timeToLive: 60 * 60 * 24
        };
        admin.messaging().sendToDevice(registrationToken, payload, options)
          .then(function (response) {
            console.log("Successfully sent message:", response['results']);
            notificationRepositories.createNotification(1, rekomendasi[indeksRekomendasi]);
          })
          .catch(function (error) {
            console.log("Error sending message:", error);
          });
      }
    }
    if (tmpKelembabanTanah < 50) {
      var registrationToken = getToken.fcmtoken;
      if (registrationToken) {
        var payload = {
          notification: {
            title: tanamanInform.namaTanaman + " Time to watering !!",
            body: "Please open yours Plant App and let's check your plant.."
          }
        };

        var options = {
          priority: "high",
          timeToLive: 60 * 60 * 24
        };
        admin.messaging().sendToDevice(registrationToken, payload, options)
          .then(function (response) {
            console.log("Successfully sent message:", response);
          })
          .catch(function (error) {
            console.log("Error sending message:", error);
          });

      }
    }
    //untuk memberikan notifikasi bagaiaman kondisi hari ini
    else if (timeHours == 8 && timeMinutes == 48 && weatherPrec > 0) {
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
        timeToLive: 60 * 60 * 24
      };
      admin.messaging().sendToDevice(registrationToken, payload, options)
        .then(function (response) {
          console.log("Successfully sent message:", response);
        })
        .catch(function (error) {
          console.log("Error sending message:", error);
        });
    }

    let tanamanOnUpdate = await
      Tanaman.update({
        _id: id
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
    if (tanamanOnUpdate) {
      let tanamanAfterUpdated = await Tanaman.findById(id)
      if (tanamanAfterUpdated) {
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
        if (emitToSocket) {
          /**
           * emit data
           */
          socketApp.notifyPlantsData(tanamanAfterUpdated.idFarmer, emitToSocket)
          return tanamanAfterUpdated
        }

      }
    }
  },
  updateTanaman: async (id, body) => {
    let result = await Tanaman.findByIdAndUpdate(id, {
      $set: body
    })
    return result
  },
  deleteTanaman: async (id) => {
    let result = await Tanaman.findByIdAndRemove(id)
    return result
  },
  detailTanaman: async (id) => {
    let result = await Tanaman.findById(id)
    return result
  },
  createTanaman: async (id, namaTanaman, luasLahan, lokasiLahan, spesies, tanggal) => {
    let checkFarmer = await farmerRepositories.getFarmerByIdUser(id)
    if (checkFarmer) {
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
        kelembabanUdara: initial_kelembaban_udara,
        suhuUdara: initial_suhu_udara,
        kondisi: initial_kondisi
      }

      let sub_perangkat = {
        status: initial_status,
        data: [sub_data]
      }
      var newTanaman = new Tanaman({
        idFarmer: checkFarmer._id,
        idUser: id,
        namaTanaman: namaTanaman,
        luasLahan: luasLahan,
        lokasiLahan: lokasiLahan,
        spesies: spesies,
        tanggal: tanggal,
        perangkat: sub_perangkat
      });
      let saveTanaman = await newTanaman.save()
      if (saveTanaman) {
        return saveTanaman
      }
      if (saveTanaman) {
        let getweather = await cuacaRepositories.getweather(saveTanaman.lokasiLahan)
        if (getweather) {
          console.log(getweather)
        }
      }

    }
  },

  getRequestTanaman: async () => {
    let result = await Tanaman.aggregate(
      [
        {
          $match: {
            "perangkat.status": Constants.DEVICE_PENDING
          }
        },
        {
          $lookup: 
          {
            from: "farmers",
            localField: "idFarmer",
            foreignField: "_id",
            as: "farmer_docs"
          }
        },
      ]
    )
    return result
  }
}

module.exports = tanamanRepositories