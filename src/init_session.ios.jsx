
import OpenTokSessionManager from '../opentok.ios';

const initSession = function(apiKey, sessionId, token) {
  return new Promise(function(resolve/* , reject */) {
    let session;

    const connect = function() {
      return new Promise(function(connectResolve, connectReject) {
        OpenTokSessionManager.connect(token, err => {
          if (err) {
            connectReject(err);
          } else {
            connectResolve();
          }
        });
      });
    };

    const publish = function() {
      return new Promise(function(publishResolve, publishReject) {
        OpenTokSessionManager.publishToSession((err)=> {
          if (err) {
            publishReject(err);
          } else {
            let streamCreated, publishFailed;
            streamCreated = session.on('publisherStreamCreated', stream => {
              publishResolve(stream);
              streamCreated.remove();
              publishFailed.remove();
            });
            publishFailed = session.on('publisherDidFailWithError', error => {
              publishReject(error);
              streamCreated.remove();
              publishFailed.remove();
            });
          }
        });
      });
    };

    const subscribe = function(streamId) {
      return new Promise(function(subscribeResolve, subscribeReject) {
        OpenTokSessionManager.subscribeToStream(streamId, (err, subscriberId)=> {
          if (err) {
            subscribeReject(err);
          } else {
            subscribeResolve(subscriberId);
          }
        });
      });
    };

    OpenTokSessionManager.initSession(apiKey, sessionId, () => {
      session = {
        connect,
        publish,
        subscribe,
        on: OpenTokSessionManager.addEventListener,
        off: OpenTokSessionManager.removeEventListener,
      };
      resolve(session);
    });
  });
};

export default initSession;
