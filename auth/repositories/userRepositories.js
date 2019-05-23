var mongoose = require('mongoose');
var passport = require('passport');
var config = require('../config/database');
require('../config/passport')(passport);
var jwt = require('jsonwebtoken');
var User = require("../models/user");
var Farmer = require("../models/farmer");
var bcrypt = require('bcrypt-nodejs');

const userRepositories = {
    farmerSignup: async(username,password,nama,alamat,telp,role)=>{
        let newUser = new User({
            username: username,
            password: password,
            role: role,
        });
        let saveUser = await newUser.save()
        if(saveUser){
            let newFarmer = new Farmer({
                idUser: saveUser._id,
                nama: nama,
                alamat: alamat,
                telp: telp
            })
            let saveFarmer = await newFarmer.save()
            if(saveFarmer){
                return saveFarmer
            }
        }
    },
    userSignup: async(username,password,role)=>{
        let newUser = new User({
            username: username,
            password: password,
            role: role
        });
        let saveUser = await newUser.save()
        if(saveUser){
            return saveUser
        }
    },
    
    signin: async(username,password)=>{
        let user = await User.findOne({
            username: username
        })
        if(user){
            if(bcrypt.compareSync(password, user.password)){
                let token = jwt.sign(user,config.secret)
                let newUserObj = {
                    _id: user._id,
                    username: user.username,
                    password: user.password,
                    role: user.role,
                    token: 'JWT ' + token
                }
                return newUserObj
            }else{
                return false
            }
        }else{
            return false
        }
    },
    
    userDelete: async(id)=>{
        let result = await User.findByIdAndRemove(id)
        return result
    },
    
    userUpdate:async(id,body)=>{
        let result = await User.findByIdAndUpdate(id,{
            $set:body
        })
        return result
    },
    profile:async(idUser)=>{
        let result = await Farmer.findOne({
            idUser:idUser
        })
        return result
    },
    getAllFarmer: async()=>{
        let result = await User.aggregate(
            // Pipeline
            [
                // Stage 1
                {
                    $match: {
                        "role" : 2
                    
                    }
                },

                // Stage 2
                {
                    $lookup: // Equality Match
                    {
                        from: "farmers",
                        localField: "_id",
                        foreignField: "idUser",
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
        )
        return result
    }
}
module.exports = userRepositories