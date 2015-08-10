/*global require */

var React = require('react-native');
var {
  ActivityIndicatorIOS,
  StyleSheet,
  View
} = React;

var styles = StyleSheet.create({

  activityContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#262422',
  },

  activityIndicator: {
    alignItems: 'center',
    justifyContent: 'center',
  },

});

var LoadingView = React.createClass({
  render() {
    return (
      <View style={styles.activityContainer}>
        <ActivityIndicatorIOS
          animating={true}
          style={[styles.activityIndicator, {height: 80}]}
          size="large" />
      </View>
    );
  }
});

module.exports = LoadingView;
