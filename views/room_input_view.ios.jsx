import React, {
  TextInput,
  StyleSheet,
  View,
  Image
} from 'react-native';

/* eslint block-scoped-var: 0 */
/* global require */
const meetLogo = require('image!meet-logo');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#262422',
    padding: 10,
  },
  logo: {
    width: 200,
    height: 200,
  },
  roomInput: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    padding: 5,
    color: '#DCD9B5',
  },
});

export default React.createClass({
  displayName: 'RoomInputView',

  propTypes: {
    onSubmit: React.PropTypes.func.isRequired,
  },

  render: function() {
    return (
      <View style={styles.container}>
        <Image source={meetLogo}
          style={styles.logo}/>
        <TextInput style={styles.roomInput}
          placeholder="room name"
          placeholderTextColor="#DCD9B5"
          onSubmitEditing={ (event) => this.props.onSubmit(event.nativeEvent.text) } />
      </View>
    );
  },
});
