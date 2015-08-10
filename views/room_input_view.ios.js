var React = require('react-native');
var {
  TextInput,
  StyleSheet,
  View,
  Image
} = React;

var styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#262422',
    padding: 10
  },
  logo: {
    width: 200,
    height: 200
  },
  roomInput: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    color: '#DCD9B5'
  }
});

var RoomInputView = React.createClass({
  render: function() {
    return (
      <View style={styles.container}>
        <Image source={require('image!meet-logo')}
          style={styles.logo}/>
        <TextInput style={styles.roomInput}
          placeholder = "room name"
          placeholderTextColor = '#DCD9B5'
          onSubmitEditing={ (event) => this.props.onSubmit(event.nativeEvent.text) } />
      </View>
    );
  }
});

module.exports = RoomInputView;
