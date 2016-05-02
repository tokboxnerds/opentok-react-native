import { DeviceEventEmitter } from 'react-native';
import NativeModules from 'NativeModules';

const NativeOpenTokSessionManager = NativeModules.OpenTokSessionManager;

const deviceEventHandlers = {};

const OpenTokSessionManager = {

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
      },
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

export default OpenTokSessionManager;
