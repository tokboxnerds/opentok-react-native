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
} = React;


var OpenTokSessionManager = require('./opentok.ios.js');

var { requireNativeComponent } = require('react-native');
// requireNativeComponent automatically resolves this to "RCTMapManager"
var ReactPublisher = requireNativeComponent('ReactPublisher', null);
var ReactSubscriber = requireNativeComponent('ReactSubscriber', null);

var apiKey = 1127;
var sessionId = '2_MX4xMTI3fn4xNDM5MTcwMjQ1Njgxfm1tUlpUVVNmVmEwbGJpM0p6YzRaUm1xWH5-';
var token = 'T1==cGFydG5lcl9pZD0xMTI3JnNpZz05MDllZWM2NmQxY2M0YjUwMzhmNjQwZGQ0ZDBjYWZjZjMyM2U3YWU1OnNlc3Npb25faWQ9Ml9NWDR4TVRJM2ZuNHhORE01TVRjd01qUTFOamd4Zm0xdFVscFVWVk5tVm1Fd2JHSnBNMHA2WXpSYVVtMXhXSDUtJmNyZWF0ZV90aW1lPTE0MzkxNzAyNDYmbm9uY2U9MC4yNTg0MTU1NTEzOTA0OTg5JnJvbGU9bW9kZXJhdG9yJmV4cGlyZV90aW1lPTE0NDE3NjIyNDY=';

console.log('hello');

var rntb = React.createClass({

  getInitialState: function() {
    return {
      sessionState: 'DISCONNECTED',
      streams: [],
      publishing: false,
    };
  },

  componentDidMount: function() {
    OpenTokSessionManager.initSession(apiKey, sessionId, () => {
      this.setState({ sessionState: 'INITIALIZED' });

      OpenTokSessionManager.connect(token, err => {
        if (err) {
          this.setState({ sessionState: 'ERROR' });
        } else {
          this.setState({ sessionState: 'CONNECTED' });

          OpenTokSessionManager.initPublisher(()=> {
            this.setState({ publishing: true });
            OpenTokSessionManager.publishToSession((err)=> {
              this.setState({ sessionState: 'ATTEMPT PUBLISH' });
            });
          });
        }
      });
      // hooray!
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
