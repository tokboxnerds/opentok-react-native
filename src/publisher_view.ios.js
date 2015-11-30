import React, { requireNativeComponent } from 'react-native';

class PublisherView extends React.Component {
  render() {
    return <ReactPublisher {...this.props} />;
  }
}

PublisherView.propTypes = {
};

const ReactPublisher = requireNativeComponent('ReactPublisher', PublisherView);

module.exports = PublisherView;
