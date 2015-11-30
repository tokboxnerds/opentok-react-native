/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 */

import React, {
  AppRegistry,
  StyleSheet,
  View,
  StatusBarIOS,
  TouchableHighlight,
  LayoutAnimation,
} from 'react-native';

import Dimensions from 'Dimensions';
import Orientation from 'react-native-orientation';
import {
  PublisherView,
  SubscriberView,
  initPublisher,
  initSession,
} from './src/index.ios.js';
import { getBestDimensions } from './src/layout_container.ios.js';
import Icon from 'react-native-vector-icons/Ionicons';

import LoadingView from './views/loading_view.ios.js';
import RoomInputView from './views/room_input_view.ios.js';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    flex: 1,
    backgroundColor: '#262422',
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
    backgroundColor: 'black',
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
    color: '#DCD9CD',
  },
  subscriberButtons: {
    height: 50,
    backgroundColor: 'rgba(0, 0, 0, 0)',
  },
  subscriberView: {
    position: 'absolute',
    top: 0,
    right: 0,
    left: 0,
    bottom: 0,
  },
  subscriberContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

const ReactMeet = React.createClass({

  getInitialState() {
    return {
      sessionState: 'DISCONNECTED',
      streams: [],
      publishing: false,
      loaded: false,
      room: null,
      orientation: 'PORTRAIT',
      publishingVideo: true,
      publishingAudio: true,
    };
  },

  componentDidMount() {
    StatusBarIOS.setStyle('light-content');
    Orientation.unlockAllOrientations();
    Orientation.addOrientationListener(this._orientationDidChange);
  },

  componentWillUnmount() {
    Orientation.removeOrientationListener(this._orientationDidChange);
  },

  connectToRoom(room) {
    // Fetch from meet.tokbox.com
    this.setState(state => {
      state.room = room;
      return state;
    });
    fetch('https://meet.tokbox.com/' + room)
      .then(data => data.json())
      .then(room => initSession(room.apiKey, room.sessionId, room.token))
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

  streamCreated(stream) {
    this.session.subscribe(stream.streamId)
      .then(subscriberId => {
        LayoutAnimation.easeInEaseOut();
        this.setState(state => {
          state.streams.push({ subscriberId, streamId: stream.streamId });
          return state;
        });
      })
      .catch(err => {
        alert(err);
      });
  },

  streamDestroyed(stream) {
    LayoutAnimation.easeInEaseOut();
    this.setState(state => {
      state.streams = state.streams
        .filter(priorStream => priorStream.streamId !== stream.streamId);
      return state;
    });
  },

  _orientationDidChange(orientation) {
    this.setState({
      orientation,
    });
    console.log('orientationChanged ' + orientation);
  },

  sessionDidDisconnect() {
    this.session.off('streamCreated', this.streamCreated);
    this.session.off('streamDestroyed', this.streamDestroyed);
    this.session.off('sessionDidDisconnect', this.sessionDidDisconnect);
    this.session = null;
    this.setState({
      streams: [],
    });
  },

  render() {
    if (!this.state.room) {
      return <RoomInputView onSubmit={room => this.connectToRoom(room)}/>;
    }

    if (!this.state.loaded) {
      return <LoadingView/>;
    }

    let publisher;
    if (this.state.publishing) {
      publisher = <PublisherView style={ styles.publisher } />;
    }

    const { width, height } = Dimensions.get('window');
    console.log(width + 'x' + height);
    const portrait = this.state.orientation === 'PORTRAIT';
    const dimensions = getBestDimensions(9 / 16, 4 / 2, this.state.streams.length,
      portrait ? width : height,
      portrait ? height : width);

    const subscriberViews = this.state.streams.map(item => {
      const sub = <SubscriberView subscriberId={ item.subscriberId }
                  key={ item.subscriberId }
                  style={ styles.subscriberView }/>;
      const setVideo = state => {
        return () => this.session.setSubscribeToVideo(state, item.subscriberId);
      };
      var setAudio = state => {
        return () => this.session.setSubscribeToAudio(state, item.subscriberId);
      };
      // <View style={ styles.subscriberButtons }>
      //   <TouchableHighlight onPress={setVideo(true)}>
      //     <Text>setSubscribeToVideo(true)</Text>
      //   </TouchableHighlight>
      //   <TouchableHighlight onPress={setVideo(false)}>
      //     <Text>setSubscribeToVideo(false)</Text>
      //   </TouchableHighlight>
      //   <TouchableHighlight onPress={setAudio(true)}>
      //     <Text>setSubscribeToAudio(true)</Text>
      //   </TouchableHighlight>
      //   <TouchableHighlight onPress={setAudio(false)}>
      //     <Text>setSubscribeToAudio(false)</Text>
      //   </TouchableHighlight>
      // </View>
      return (<View style={[{ width: dimensions.targetWidth, height: dimensions.targetHeight },
          styles.subscriberContainer]}>
        {sub}
      </View>);
    });
    const videoButton = this.state.publishingVideo ?
      (<TouchableHighlight onPress={this.onPressVideoOff}>
          <Icon name="ios-videocam" size={30} color="#DCD9CD"></Icon>
      </TouchableHighlight>) : (<TouchableHighlight onPress={this.onPressVideoOn}>
          <Icon name="ios-videocam-outline" size={30} color="#DCD9CD"></Icon>
      </TouchableHighlight>);
    const audioButton = !this.state.publishingAudio ? (<TouchableHighlight onPress={this.onPressAudioOn}>
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

  onPressAudioOn() {
    this.session.setPublishAudio(true);
    this.setState({
      publishingAudio: true,
    });
  },

  onPressAudioOff() {
    this.session.setPublishAudio(false);
    this.setState({
      publishingAudio: false,
    });
  },

  onPressVideoOn() {
    this.session.setPublishVideo(true);
    this.setState({
      publishingVideo: true,
    });
  },

  onPressVideoOff() {
    this.session.setPublishVideo(false);
    this.setState({
      publishingVideo: false,
    });
  },

  onPressCameraPosition() {
    const position = this.state.cameraPosition === 'front' ? 'back' : 'front';
    this.session.setPublisherCameraPosition(position)
      .then(() => this.getCameraPosition())
      .catch(err => {
        alert(err);
      });
  },

  getCameraPosition() {
    return this.session.publisherCameraPosition()
      .then(position => this.setState({ cameraPosition: position }));
  },

  onPressLeaveRoom() {
    this.setState({ sessionState: 'Leaving...' });
    this.session.disconnect()
      .then(() => this.setState({ room: '' }))
      .catch(err => {
        this.setState({ sessionState: 'Error! ' + err });
      });
  },
});

AppRegistry.registerComponent('ReactMeet', () => ReactMeet);
