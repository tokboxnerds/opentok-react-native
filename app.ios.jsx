import React, {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  StatusBarIOS
} from 'react-native';

import {
  PublisherView,
  SubscriberView,
  initPublisher,
  initSession
} from './src/index.ios';

import LoadingView from './views/loading_view.ios';
import RoomInputView from './views/room_input_view.ios';

const styles = StyleSheet.create({
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

const rntb = React.createClass({

  getInitialState: function() {
    return {
      sessionState: 'DISCONNECTED',
      streams: [],
      publishing: false,
      loaded: false,
      room: null,
    };
  },

  componentDidMount: function() {
    StatusBarIOS.setStyle('light-content');
  },

  render: function() {
    if (!this.state.room) {
      return <RoomInputView onSubmit={(room) => this.connectToRoom(room)}/>;
    }

    if (!this.state.loaded) {
      return <LoadingView/>;
    }

    let publisher;
    if (this.state.publishing) {
      publisher = <PublisherView style={{ width: 320, height: 240, backgroundColor: 'black' }} />;
    }

    const subscriberViews = this.state.streams.map(item => {
      return (<SubscriberView subscriberId={ item.subscriberId }
                                   key={ item.subscriberId }
                                 style={{ width: 320, height: 240, backgroundColor: 'black' }}/>);
    });

    return (
      <View style={styles.container}>
        <Text>{this.state.sessionState}</Text>

        {publisher}

        {subscriberViews}
      </View>
    );
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
        alert(err); /* eslint no-alert: 0 */
      });
  },

  streamDestroyed: function(stream) {
    this.setState(function(state) {
      state.streams = state.streams.filter(function(priorStream) {
        return priorStream.streamId !== stream.streamId;
      });
      return state;
    });
  },

  session: null,

  connectToRoom: function(room) {
    // Fetch from meet.tokbox.com
    this.setState((state) => {
      state.room = room;
      return state;
    });
    fetch('https://meet.tokbox.com/' + room).then(data => {
      return data.json();
    }).then(roomConnection => {
      return initSession(roomConnection.apiKey, roomConnection.sessionId, roomConnection.token);
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
});


AppRegistry.registerComponent('rntb', () => rntb);
