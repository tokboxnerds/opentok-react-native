'use strict';

var React = require('react-native');
var { requireNativeComponent } = React;

class PublisherView extends React.Component {
  render() {
    return <ReactPublisher {...this.props} />;
  }
}

PublisherView.propTypes = {
};

var ReactPublisher = requireNativeComponent('ReactPublisher', PublisherView);

module.exports = PublisherView;
