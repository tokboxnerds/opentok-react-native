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
} = React;

var OT = require('./src/index.ios.js');

var {
  PublisherView,
  SubscriberView,
  initPublisher,
  initSession
} = OT;

var apiKey = 1127;
var sessionId = '2_MX4xMTI3fn4xNDM5MTcwMjQ1Njgxfm1tUlpUVVNmVmEwbGJpM0p6YzRaUm1xWH5-';
var token = 'T1==cGFydG5lcl9pZD0xMTI3JnNpZz05MDllZWM2NmQxY2M0YjUwMzhmNjQwZGQ0ZDBjYWZjZjMyM2U3YWU1OnNlc3Npb25faWQ9Ml9NWDR4TVRJM2ZuNHhORE01TVRjd01qUTFOamd4Zm0xdFVscFVWVk5tVm1Fd2JHSnBNMHA2WXpSYVVtMXhXSDUtJmNyZWF0ZV90aW1lPTE0MzkxNzAyNDYmbm9uY2U9MC4yNTg0MTU1NTEzOTA0OTg5JnJvbGU9bW9kZXJhdG9yJmV4cGlyZV90aW1lPTE0NDE3NjIyNDY=';

var rntb = React.createClass({

  getInitialState: function() {
    return {
      sessionState: 'DISCONNECTED',
      streams: [],
      publishing: false,
    };
  },

  session: null,

  componentDidMount: function() {
    initSession(apiKey, sessionId, token)
      .then(session => {
        this.setState({ sessionState: 'Connecting...' });
        this.session = session;
        session.on('streamCreated', this.streamCreated);
        session.on('streamDestroyed', this.streamDestroyed);
        return session.connect();
      })
      .then(() => {
        this.setState({ sessionState: 'Getting camera...' });
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

  render: function() {
    var publisher;
    if (this.state.publishing) {
      publisher = <PublisherView style={{ width: 320, height: 240, backgroundColor: 'black' }} />;
    }

    var subscriberViews = this.state.streams.map(item => {
      return <SubscriberView subscriberId={ item.subscriberId }
                                   key={ item.subscriberId }
                                 style={{ width: 320, height: 240, backgroundColor: 'black' }}/>
    });

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
