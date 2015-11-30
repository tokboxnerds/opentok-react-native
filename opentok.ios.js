import { DeviceEventEmitter } from 'react-native';
const NativeModules = require('NativeModules');

const NativeOTSessionManager = NativeModules.OpenTokSessionManager;
const deviceEventHandlers = {};

const promisify = function(fn, ctx) {
  return function() {
    const args = Array.prototype.slice.call(arguments);

    console.log('promisify called with', arguments, args);
    return new Promise((resolve, reject) => {
      fn.apply(ctx, args.concat([function(err, value) {
        if (err) {
          reject(err);
        } else {
          resolve(value);
        }
      }]));
    });
  };
};


const OpenTokSessionManager = {

  addEventListener(type, handler) {
    if (!deviceEventHandlers[type]) {
      deviceEventHandlers[type] = {};
    }
    deviceEventHandlers[type][handler] = DeviceEventEmitter.addListener(
      type,
      event => handler(event)
    );

    return {
      remove() {
        OpenTokSessionManager.removeEventListener(type, handler);
      },
    };
  },

  removeEventListener(type, handler) {
    if (!deviceEventHandlers[type][handler]) {
      return;
    }

    deviceEventHandlers[type][handler].remove();
    deviceEventHandlers[type][handler] = null;
  },

  initSession: promisify(NativeOTSessionManager.initSession),
  connect: promisify(NativeOTSessionManager.connect),
  disconnect: promisify(NativeOTSessionManager.disconnect),

  subscribeToStream: promisify(NativeOTSessionManager.subscribeToStream),
  publishToSession: promisify(NativeOTSessionManager.publishToSession),

  initPublisher: promisify(NativeOTSessionManager.initPublisher),
  setPublishVideo: promisify(NativeOTSessionManager.setPublishVideo),
  setPublishAudio: promisify(NativeOTSessionManager.setPublishAudio),
  setPublisherCameraPosition: promisify(NativeOTSessionManager.setPublisherCameraPosition),
  publisherCameraPosition: promisify(NativeOTSessionManager.publisherCameraPosition),

  setSubscribeToVideo: promisify(NativeOTSessionManager.setSubscribeToVideo),
  setSubscribeToAudio: promisify(NativeOTSessionManager.setSubscribeToAudio),
  unsubscribe: promisify(NativeOTSessionManager.unsubscribe),

};

export default OpenTokSessionManager;
