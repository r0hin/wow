const { initializeApp } = require("firebase-admin/app");
initializeApp()

exports.friends = require('./groups/friends')
exports.general = require('./groups/general')
