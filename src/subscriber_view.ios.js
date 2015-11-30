import React, { requireNativeComponent } from 'react-native';

class SubscriberView extends React.Component {
  render() {
    return <ReactSubscriber {...this.props} />;
  }
}

SubscriberView.propTypes = {
  /* The subscriber to show */
  subscriberId: React.PropTypes.string.isRequired,
};

const ReactSubscriber = requireNativeComponent('ReactSubscriber', SubscriberView);

module.exports = SubscriberView;
