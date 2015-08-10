'use strict';

var React = require('react-native');
var { requireNativeComponent } = React;

class SubscriberView extends React.Component {
  render() {
    return <ReactSubscriber {...this.props} />;
  }
}

SubscriberView.propTypes = {
  /* The subscriber to show */
  subscriberId: React.PropTypes.string.isRequired,
};

var ReactSubscriber = requireNativeComponent('ReactSubscriber', SubscriberView);

module.exports = SubscriberView;
