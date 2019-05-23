const express = require("express")
const users = express.Router()
const cors = require("cors")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt")

const User = require("../models/User")
const UserController = require("../controllers/User")
users.use(cors())

process.env.SECRET_KEY = 'secret'

users.post("/register", UserController.user_register)

users.post('/login', UserController.user_login)

module.exports = users