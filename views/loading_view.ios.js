import React, {
  ActivityIndicatorIOS,
  StyleSheet,
  View,
} from 'react-native';

const styles = StyleSheet.create({

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

export default class LoadingView extends React.Component {
  render() {
    return (
      <View style={styles.activityContainer}>
        <ActivityIndicatorIOS
          animating={true}
          style={[styles.activityIndicator, { height: 80 }]}
          size="large" />
      </View>
    );
  }
}
