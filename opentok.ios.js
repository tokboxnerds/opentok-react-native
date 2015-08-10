/*global require, fetch*/
/*jshint -W097, esnext:true */

'use strict';

var react = require('react-native');
var NativeModules = require('NativeModules');

var { DeviceEventEmitter } = react;

var NativeOpenTokSessionManager = NativeModules.OpenTokSessionManager;

var deviceEventHandlers = {};

var OpenTokSessionManager = {

  addEventListener: function(type, handler) {
    if (!deviceEventHandlers[type]) {
      deviceEventHandlers[type] = {};
    }
    deviceEventHandlers[type][handler] = DeviceEventEmitter.addListener(
      type,
      (event)=> handler(event)
    );

    return {
      remove() {
        OpenTokSessionManager.removeEventListener(type, handler);
      }
    };
  },

  removeEventListener: function(type, handler) {
    if (!deviceEventHandlers[type][handler]) {
      return;
    }

    deviceEventHandlers[type][handler].remove();
    deviceEventHandlers[type][handler] = null;
  },

  initSession: NativeOpenTokSessionManager.initSession,

  connect: NativeOpenTokSessionManager.connect,

  initPublisher: NativeOpenTokSessionManager.initPublisher,

  publishToSession: NativeOpenTokSessionManager.publishToSession,

  subscribeToStream: NativeOpenTokSessionManager.subscribeToStream,
};

module.exports = OpenTokSessionManager;
