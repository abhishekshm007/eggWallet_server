'use strict';

var gcm = require('node-gcm');
var constants = require('./constants');
// Create a message
// ... with default values
//var message = new gcm.Message();

// ... or some given values
var message = new gcm.Message({

});


// add notification data


// Set up the sender with you API key
var sender = new gcm.Sender(constants.GCM_SERVER_KEY);

// Add the registration tokens of the devices you want to send to
var gcms = [];





module.exports = {

  // add notification data
  addNotificationData: function(data){
    message.addNotification(data);
  },

  // add gcm
  addGcm : function(gcm){
    gcms.push(gcm);
  },

  // add data
  addData: function(data){
    message.addData(data);
  },

  // Send the message
  // ... trying only once
  sendOnce: function(){
    sender.sendNoRetry(message, { registrationTokens: registrationTokens }, function(err, response) {
      if(err) console.error(err);
      else    console.log(response);
    });
  },

  // ... or retrying
  send: function(){
    console.log("message "+JSON.stringify(message));
    console.log("gcm "+JSON.stringify(gcms));
    sender.send(message, { registrationTokens: gcms }, function (err, response) {
      if(err) console.error('err '+err);
      else    console.log('res '+JSON.stringify(response));
    });
  },

  // ... or retrying a specific number of times (10)
  sendLimited: function(){
    sender.send(message, { registrationTokens: registrationTokens }, 10, function (err, response) {
      if(err) console.error(err);
      else    console.log(response);
    });
  }
}