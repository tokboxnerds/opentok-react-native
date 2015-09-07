'use strict';

var OpenTokSessionManager = require('../opentok.ios.js');

module.exports = function() {
  return OpenTokSessionManager.initPublisher();
};
