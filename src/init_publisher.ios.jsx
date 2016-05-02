import OpenTokSessionManager from '../opentok.ios';

const initPublisher = function() {
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

export default initPublisher;
