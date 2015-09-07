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

var OT = require('./src/index.ios.js');

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
      room: null
    };
  },

  componentDidMount : function() {
    StatusBarIOS.setStyle('light-content');
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
      publisher = <PublisherView style={{ width: 320, height: 240, backgroundColor: 'black' }} />;
    }

    var subscriberViews = this.state.streams.map(item => {
      var sub = <SubscriberView subscriberId={ item.subscriberId }
                                   key={ item.subscriberId }
                                 style={{ width: 320, height: 240, backgroundColor: 'black' }}/>;
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

    return (
      <View style={styles.container}>
        <View>
          <TouchableHighlight onPress={this.onPressLeaveRoom}>
              <Text>Leave Room</Text>
          </TouchableHighlight>
          <TouchableHighlight onPress={this.onPressVideoOn}>
              <Text>Publish Video On</Text>
          </TouchableHighlight>
          <TouchableHighlight onPress={this.onPressVideoOff}>
              <Text>Publish Video Off</Text>
          </TouchableHighlight>
          <TouchableHighlight onPress={this.onPressAudioOn}>
              <Text>Publish Audio On</Text>
          </TouchableHighlight>
          <TouchableHighlight onPress={this.onPressAudioOff}>
              <Text>Publish Audio Off</Text>
          </TouchableHighlight>
          <TouchableHighlight onPress={this.onPressCameraPosition.bind(null, 'front')}>
              <Text>Front</Text>
          </TouchableHighlight>
          <TouchableHighlight onPress={this.onPressCameraPosition.bind(null, 'back')}>
              <Text>Back</Text>
          </TouchableHighlight>
        </View>
        <Text>{this.state.sessionState} {this.state.cameraPosition}</Text>

        {publisher}

        {subscriberViews}
      </View>
    );
  },

  onPressAudioOn: function() {
    this.session.setPublishAudio(true);
  },

  onPressAudioOff: function() {
    this.session.setPublishAudio(false);
  },

  onPressVideoOn: function() {
    this.session.setPublishVideo(true);
  },

  onPressVideoOff: function() {
    this.session.setPublishVideo(false);
  },

  onPressCameraPosition: function(position) {
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
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
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
});

AppRegistry.registerComponent('rntb', () => rntb);
