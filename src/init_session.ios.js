'use strict';

var OpenTokSessionManager = require('../opentok.ios.js');

module.exports = function(apiKey, sessionId, token) {
  return new Promise(function(resolve, reject) {
    var session;

    var connect = function(callback) {
      return new Promise(function(resolve, reject) {
        OpenTokSessionManager.connect(token, err => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      });
    };

    var disconnect = function() {
      return new Promise(function(resolve, reject) {
        OpenTokSessionManager.disconnect(err => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      });
    };

    var publish = function() {
      return new Promise(function(resolve, reject) {
        OpenTokSessionManager.publishToSession((err)=> {
          if (err) {
            reject(err);
          } else {
            var streamCreated, publishFailed;
            streamCreated = session.on('publisherStreamCreated', stream => {
              resolve(stream);
              streamCreated.remove();
              publishFailed.remove();
            });
            publishFailed = session.on('publisherDidFailWithError', error => {
              reject(error);
              streamCreated.remove();
              publishFailed.remove();
            })
          }
        });
      });
    };

    var subscribe = function(streamId) {
      return new Promise(function(resolve, reject) {
        OpenTokSessionManager.subscribeToStream(streamId, (err, subscriberId)=> {
          if (err) {
            reject(err);
          } else {
            resolve(subscriberId);
          }
        });
      });
    }

    OpenTokSessionManager.initSession(apiKey, sessionId, () => {
      session = {
        connect: connect,
        disconnect: disconnect,
        publish: publish,
        subscribe: subscribe,
        on: OpenTokSessionManager.addEventListener,
        off: OpenTokSessionManager.removeEventListener
      };
      resolve(session);
    });
  });
};
