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
  TouchableHighlight,
  LayoutAnimation
} = React;
var Dimensions = require('Dimensions');
var Orientation = require('react-native-orientation');
var OT = require('./src/index.ios.js');
var {getBestDimensions} = require('./src/layout_container.ios.js');
var Icon = require('react-native-vector-icons/Ionicons');

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
      orientation: 'PORTRAIT',
      publishingVideo: true,
      publishingAudio: true
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
        LayoutAnimation.easeInEaseOut();
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
    LayoutAnimation.easeInEaseOut();
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
                  style={ styles.subscriberView }/>;
      var setVideo = state => {
        return () => this.session.setSubscribeToVideo(state, item.subscriberId);
      };
      var setAudio = state => {
        return () => this.session.setSubscribeToAudio(state, item.subscriberId);
      };
      return (<View style={[{ width: dimensions.targetWidth, height: dimensions.targetHeight },
          styles.subscriberContainer]}>
        {sub}
        <View style={ styles.subscriberButtons }>
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
        </View>
      </View>);
    });
    var videoButton = this.state.publishingVideo ?
      (<TouchableHighlight onPress={this.onPressVideoOff}>
          <Icon name="ios-videocam" size={30} color="#DCD9CD"></Icon>
      </TouchableHighlight>) : (<TouchableHighlight onPress={this.onPressVideoOn}>
          <Icon name="ios-videocam-outline" size={30} color="#DCD9CD"></Icon>
      </TouchableHighlight>);
    var audioButton = !this.state.publishingAudio ? (<TouchableHighlight onPress={this.onPressAudioOn}>
        <Icon name="ios-mic-off" size={30} color="#DCD9CD"></Icon>
      </TouchableHighlight>) : (<TouchableHighlight onPress={this.onPressAudioOff}>
        <Icon name="ios-mic" size={30} color="#DCD9CD"></Icon>
      </TouchableHighlight>);
    return (
      <View style={styles.container}>
        {subscriberViews}
        <View style={styles.bottomBar}>
          <TouchableHighlight onPress={this.onPressLeaveRoom}>
            <Icon name="log-out" size={30} color="#DCD9CD"></Icon>
          </TouchableHighlight>
          {videoButton}
          {audioButton}
          <TouchableHighlight onPress={this.onPressCameraPosition.bind(null)}>
            <Icon name="ios-reverse-camera" size={30} color="#DCD9CD"></Icon>
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
    left: 20,
    right: 20,
    height: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0, 0, 0, 0)',
    color: '#DCD9CD'
  },
  subscriberButtons: {
    height: 50,
    backgroundColor: 'rgba(0, 0, 0, 0)'
  },
  subscriberView: {
    position: 'absolute',
    top: 0,
    right: 0,
    left: 0,
    bottom: 0
  },
  subscriberContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  }
});


AppRegistry.registerComponent('rntb', () => rntb);
