var mongoose = require('mongoose');
var passport = require('passport');
var config = require('../config/database');
require('../config/passport')(passport);
var jwt = require('jsonwebtoken');
var Notification = require("../models/notif");

const notificationRepositories = {
    getAllNotification: async () => {
        let result = await Notification.find()
        return result
    },
    createNotification: async (status, recommendation) => {
        var newNotification = new Notification({
            status: status,
            recommendation: recommendation
        });
        let saveNotification = await newNotification.save()
        if (saveNotification) {
            return saveNotification
        }
    },
    updateStatus: async (id, status) => {
        await Notification.findByIdAndUpdate(id, {
            status: status,
        })
        let notificationAfterUpdated = await Notification.findById(id)
        return notificationAfterUpdated
    },
}
module.exports = notificationRepositories