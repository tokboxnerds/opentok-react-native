/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 */
'use strict';

var x = new Promise(function(re,rj) {});
var React = require('react-native');
var {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  StatusBarIOS
} = React;
var Dimensions = require('Dimensions');
var Orientation = require('react-native-orientation');
var OT = require('./src/index.ios.js');
var {getBestDimensions} = require('./src/layout_container.ios.js');

var {
  PublisherView,
  SubscriberView,
  initPublisher,
  initSession
} = OT;

var LoadingView = require('./views/loading_view.ios.js');
var RoomInputView = require('./views/room_input_view.ios.js');

var rntb = React.createClass({

  getInitialState: function() {
    return {
      sessionState: 'DISCONNECTED',
      streams: [],
      publishing: false,
      loaded: false,
      room: null,
      orientation: 'PORTRAIT'
    };
  },

  componentDidMount : function() {
    StatusBarIOS.setStyle('light-content');
    Orientation.unlockAllOrientations();
    Orientation.addOrientationListener(this._orientationDidChange);
  },

  componentWillUnmount: function () {
    Orientation.removeOrientationListener(this._orientationDidChange);
  },

  connectToRoom: function(room) {
    // Fetch from meet.tokbox.com
    this.setState((state) => {
      state.room = room;
      return state;
    });
    fetch('https://meet.tokbox.com/' + room).then(data => {
      return data.json();
    }).then(room => {
      return initSession(room.apiKey, room.sessionId, room.token);
    })
      .then(session => {
        this.setState({ sessionState: 'Connecting...' });
        this.session = session;
        session.on('streamCreated', this.streamCreated);
        session.on('streamDestroyed', this.streamDestroyed);
        return session.connect();
      })
      .then(() => {
        this.setState({ sessionState: 'Getting camera...', loaded: true });
        return initPublisher();
      })
      .then(() => {
        this.setState({ sessionState: 'Publishing...' });
        return this.session.publish();
      })
      .then(() => {
        this.setState({ sessionState: 'Connected', publishing: true });
      })
      .catch(err => {
        this.setState({ sessionState: 'Error! ' + err });
      });
  },

  session: null,

  streamCreated: function(stream) {
    this.session.subscribe(stream.streamId)
      .then(subscriberId => {
        this.setState(function(state) {
          state.streams.push({ subscriberId: subscriberId, streamId: stream.streamId });
          return state;
        });
      })
      .catch(err => {
        alert(err);
      });
  },

  streamDestroyed: function(stream) {
    this.setState(function(state) {
      state.streams = state.streams.filter(function(priorStream) {
        return priorStream.streamId != stream.streamId;
      });
      return state;
    });
  },

  _orientationDidChange : function(orientation) {
    this.setState({
      orientation
    });
    console.log('orientationChanged ' + orientation);
  },

  render: function() {
    if (!this.state.room) {
      return <RoomInputView onSubmit={(room) => this.connectToRoom(room)}/>;
    }

    if (!this.state.loaded) {
      return <LoadingView/>;
    }

    var publisher;
    if (this.state.publishing) {
      publisher = <PublisherView style={ styles.publisher } />;
    }

    var {width, height} = Dimensions.get('window');
    console.log(width + 'x' + height);
    var portrait = this.state.orientation === 'PORTRAIT';
    var dimensions = getBestDimensions(9/16, 4/2, this.state.streams.length, portrait ? width : height,
      portrait ? height : width);

    var subscriberViews = this.state.streams.map((item, index) => {
      return <SubscriberView subscriberId={ item.subscriberId }
              key={ item.subscriberId }
              style={{ width: dimensions.targetWidth, height: dimensions.targetHeight }}/>
    });

    return (
      <View style={styles.container}>
        {subscriberViews}
        {publisher}
      </View>
    );
  }
});

var styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    flex: 1,
    backgroundColor: '#262422'
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
  publisher: {
    position: 'absolute',
    top: 20,
    right: 10,
    width: 100,
    height: 75,
    backgroundColor: 'black'
  }
});


AppRegistry.registerComponent('rntb', () => rntb);
