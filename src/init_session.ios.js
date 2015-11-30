import OpenTokSessionManager from '../opentok.ios.js';

export default function(apiKey, sessionId, token) {
  let session;

  const publish = function() {
    OpenTokSessionManager.publishToSession()
    .then(() => {
      return new Promise((resolve, reject) => {
        let streamCreated, publishFailed;
        streamCreated = session.on('publisherStreamCreated', stream => {
          resolve(stream);
          streamCreated.remove();
          publishFailed.remove();
        });
        publishFailed = session.on('publisherDidFailWithError', error => {
          reject(error);
          streamCreated.remove();
          publishFailed.remove();
        });
      });
    });
  };

  return OpenTokSessionManager.initSession(apiKey, sessionId)
    .then(() => {
      session = {
        connect: OpenTokSessionManager.connect.bind(undefined, token),
        disconnect: OpenTokSessionManager.disconnect,
        publish,
        subscribe: OpenTokSessionManager.subscribeToStream,
        on: OpenTokSessionManager.addEventListener,
        off: OpenTokSessionManager.removeEventListener,

        setPublishVideo: OpenTokSessionManager.setPublishVideo,
        setPublishAudio: OpenTokSessionManager.setPublishAudio,
        setPublisherCameraPosition: OpenTokSessionManager.setPublisherCameraPosition,
        publisherCameraPosition: OpenTokSessionManager.publisherCameraPosition,

        setSubscribeToVideo: OpenTokSessionManager.setSubscribeToVideo,
        setSubscribeToAudio: OpenTokSessionManager.setSubscribeToAudio,
        unsubscribe: OpenTokSessionManager.unsubscribe,
      };

      console.log('otsm.setPublisherCameraPosition = ', session.setPublisherCameraPosition);
      return session;
    });
}
