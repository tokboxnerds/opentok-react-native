'use strict';

var OpenTokSessionManager = require('../opentok.ios.js');

module.exports = function() {
  return new Promise(function(resolve, reject) {
    OpenTokSessionManager.initPublisher(err => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
};
