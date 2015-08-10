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
  StatusBarIOS
} = React;


var OpenTokSessionManager = require('./opentok.ios.js');

var { requireNativeComponent } = require('react-native');
// requireNativeComponent automatically resolves this to "RCTMapManager"
var ReactPublisher = requireNativeComponent('ReactPublisher', null);
var ReactSubscriber = requireNativeComponent('ReactSubscriber', null);
var LoadingView = require('./views/loading_view.ios.js');
var RoomInputView = require('./views/room_input_view.ios.js');

console.log('hello');

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
      OpenTokSessionManager.initSession(room.apiKey, room.sessionId, () => {
        this.setState({ sessionState: 'INITIALIZED' });
        OpenTokSessionManager.connect(room.token, err => {
          if (err) {
            this.setState({ sessionState: 'ERROR', loaded: true });
          } else {
            this.setState({ sessionState: 'CONNECTED', loaded: true });

            OpenTokSessionManager.initPublisher(()=> {
              this.setState({ publishing: true });
              OpenTokSessionManager.publishToSession((err)=> {
                this.setState({ sessionState: 'ATTEMPT PUBLISH' });
              });
            });
          }
        });
      });
    });

    OpenTokSessionManager.addEventListener('streamCreated', this.streamCreated);
    OpenTokSessionManager.addEventListener('streamDestroyed', this.streamDestroyed);

    OpenTokSessionManager.addEventListener('publisherStreamCreated', stream => {
      this.setState({ sessionState: 'PUBLISHING' });
    });
    OpenTokSessionManager.addEventListener('publisherStreamDestroyed', function(stream) {
      console.log('publisherStreamDestroyed', stream);
    });
  },

  streamCreated: function(stream) {
    this.setState(function(state) {
      state.streams.push(stream);
      return state;
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

  render: function() {
    if (!this.state.room) {
      return <RoomInputView onSubmit={(room) => this.connectToRoom(room)}/>;
    }
    if (!this.state.loaded) {
      return <LoadingView/>;
    }
    var subscriberViews = this.state.streams.map(item => {
      return <ReactSubscriber streamId={ item.streamId }
                                   key={ item.streamId }
                                 style={{ width: 320, height: 240, backgroundColor: 'blue' }}/>
    });

    var publisher;

    if (this.state.publishing) {
      publisher = <ReactPublisher style={{ width: 320, height: 240, backgroundColor: 'green' }} />;
    }

    return (
      <View style={styles.container}>
        <Text>{this.state.sessionState}</Text>

        {publisher}

        {subscriberViews}

      </View>
    );
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
