/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 */
'use strict';

var React = require('react-native');

var {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  StatusBarIOS,
  TouchableHighlight
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
        session.on('sessionDidDisconnect', this.sessionDidDisconnect);
        return session.connect();
      })
      .then(() => {
        this.setState({ sessionState: 'Getting camera...', loaded: true });
        return initPublisher();
      })
      .then(() => this.getCameraPosition())
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

  sessionDidDisconnect: function() {
    this.session.off('streamCreated', this.streamCreated);
    this.session.off('streamDestroyed', this.streamDestroyed);
    this.session.off('sessionDidDisconnect', this.sessionDidDisconnect);
    this.session = null;
    this.setState({
      streams: []
    });
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

    var subscriberViews = this.state.streams.map(item => {
      var sub = <SubscriberView subscriberId={ item.subscriberId }
                  key={ item.subscriberId }
                  style={{ width: dimensions.targetWidth, height: dimensions.targetHeight,
                    backgroundColor: 'black' }}/>;
      var setVideo = state => {
        return () => this.session.setSubscribeToVideo(state, item.subscriberId);
      };
      var setAudio = state => {
        return () => this.session.setSubscribeToAudio(state, item.subscriberId);
      };
      return (<View>
        {sub}
        <TouchableHighlight onPress={setVideo(true)}>
          <Text>setSubscribeToVideo(true)</Text>
        </TouchableHighlight>
        <TouchableHighlight onPress={setVideo(false)}>
          <Text>setSubscribeToVideo(false)</Text>
        </TouchableHighlight>
        <TouchableHighlight onPress={setAudio(true)}>
          <Text>setSubscribeToAudio(true)</Text>
        </TouchableHighlight>
        <TouchableHighlight onPress={setAudio(false)}>
          <Text>setSubscribeToAudio(false)</Text>
        </TouchableHighlight>
      </View>);
    });
    var videoButton = this.state.publishingVideo ?
      (<TouchableHighlight onPress={this.onPressVideoOff}>
          <Text>Mute Video</Text>
      </TouchableHighlight>) : (<TouchableHighlight onPress={this.onPressVideoOn}>
          <Text>Unmute Video</Text>
      </TouchableHighlight>);
    var audioButton = !this.state.publishingAudio ? (<TouchableHighlight onPress={this.onPressAudioOn}>
        <Text>Unmute</Text>
      </TouchableHighlight>) : (<TouchableHighlight onPress={this.onPressAudioOff}>
          <Text>Mute</Text>
      </TouchableHighlight>);
    return (
      <View style={styles.container}>
        {subscriberViews}
        <View style={styles.bottomBar}>
          <TouchableHighlight onPress={this.onPressLeaveRoom}>
              <Text>Leave Room</Text>
          </TouchableHighlight>
          {videoButton}
          {audioButton}
          <TouchableHighlight onPress={this.onPressCameraPosition.bind(null)}>
              <Text>Camera</Text>
          </TouchableHighlight>
        </View>
        {publisher}
      </View>
    );
  },

  onPressAudioOn: function() {
    this.session.setPublishAudio(true);
    this.setState({
      publishingAudio: true
    });
  },

  onPressAudioOff: function() {
    this.session.setPublishAudio(false);
    this.setState({
      publishingAudio: false
    });
  },

  onPressVideoOn: function() {
    this.session.setPublishVideo(true);
    this.setState({
      publishingVideo: true
    });
  },

  onPressVideoOff: function() {
    this.session.setPublishVideo(false);
    this.setState({
      publishingVideo: false
    });
  },

  onPressCameraPosition: function() {
    var position = this.state.cameraPosition === 'front' ? 'back' : 'front';
    this.session.setPublisherCameraPosition(position)
      .then(() => this.getCameraPosition())
      .catch(err => {
        alert(err);
      });
  },

  getCameraPosition: function() {
    return this.session.publisherCameraPosition()
      .then(position => this.setState({ cameraPosition: position }));
  },

  onPressLeaveRoom: function() {
    this.setState({ sessionState: 'Leaving...'});
    this.session.disconnect()
      .then(function() {
        this.setState({ room: '' });
      }.bind(this))
      .catch(err => {
        this.setState({ sessionState: 'Error! ' + err });
      });
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
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 50,
    flexDirection: 'row',
    justifyContent: 'center'
  }
});


AppRegistry.registerComponent('rntb', () => rntb);
