(function(e, a) { for(var i in a) e[i] = a[i]; }(exports, /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	/*** IMPORTS FROM imports-loader ***/
	var React = __webpack_require__(1);

	'use strict';

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	var _reactNative = __webpack_require__(1);

	var _reactNative2 = _interopRequireDefault(_reactNative);

	var _srcIndexIos = __webpack_require__(2);

	var _viewsLoading_viewIos = __webpack_require__(9);

	var _viewsLoading_viewIos2 = _interopRequireDefault(_viewsLoading_viewIos);

	var _viewsRoom_input_viewIos = __webpack_require__(10);

	var _viewsRoom_input_viewIos2 = _interopRequireDefault(_viewsRoom_input_viewIos);

	var styles = _reactNative.StyleSheet.create({
	  container: {
	    flex: 1,
	    justifyContent: 'center',
	    alignItems: 'center',
	    backgroundColor: '#F5FCFF'
	  },
	  welcome: {
	    fontSize: 20,
	    textAlign: 'center',
	    margin: 10
	  },
	  instructions: {
	    textAlign: 'center',
	    color: '#333333',
	    marginBottom: 5
	  }
	});

	var rntb = _reactNative2['default'].createClass({
	  displayName: 'rntb',

	  getInitialState: function getInitialState() {
	    return {
	      sessionState: 'DISCONNECTED',
	      streams: [],
	      publishing: false,
	      loaded: false,
	      room: null
	    };
	  },

	  componentDidMount: function componentDidMount() {
	    _reactNative.StatusBarIOS.setStyle('light-content');
	  },

	  render: function render() {
	    var _this = this;

	    return _reactNative2['default'].createElement(_reactNative.Navigator, {
	      initialRoute: { name: 'My First Scene', index: 0 },
	      renderScene: function (route, navigator) {
	        return _reactNative2['default'].createElement(_viewsRoom_input_viewIos2['default'], {
	          name: route.name,
	          onForward: function () {
	            var nextIndex = route.index + 1;
	            navigator.push({
	              name: 'Scene ' + nextIndex,
	              index: nextIndex
	            });
	          },
	          onBack: function () {
	            if (route.index > 0) {
	              navigator.pop();
	            }
	          }
	        });
	      }
	    });

	    if (!this.state.room) {
	      return _reactNative2['default'].createElement(_viewsRoom_input_viewIos2['default'], { onSubmit: function (room) {
	          return _this.connectToRoom(room);
	        } });
	    }

	    if (!this.state.loaded) {
	      return _reactNative2['default'].createElement(_viewsLoading_viewIos2['default'], null);
	    }

	    var publisher = undefined;
	    if (this.state.publishing) {
	      publisher = _reactNative2['default'].createElement(_srcIndexIos.PublisherView, { style: { width: 320, height: 240, backgroundColor: 'black' } });
	    }

	    var subscriberViews = this.state.streams.map(function (item) {
	      return _reactNative2['default'].createElement(_srcIndexIos.SubscriberView, { subscriberId: item.subscriberId,
	        key: item.subscriberId,
	        style: { width: 320, height: 240, backgroundColor: 'black' } });
	    });

	    return _reactNative2['default'].createElement(
	      _reactNative.View,
	      { style: styles.container },
	      _reactNative2['default'].createElement(
	        _reactNative.Text,
	        null,
	        this.state.sessionState
	      ),
	      publisher,
	      subscriberViews
	    );
	  },

	  streamCreated: function streamCreated(stream) {
	    var _this2 = this;

	    this.session.subscribe(stream.streamId).then(function (subscriberId) {
	      _this2.setState(function (state) {
	        state.streams.push({ subscriberId: subscriberId, streamId: stream.streamId });
	        return state;
	      });
	    })['catch'](function (err) {
	      alert(err); /* eslint no-alert: 0 */
	    });
	  },

	  streamDestroyed: function streamDestroyed(stream) {
	    this.setState(function (state) {
	      state.streams = state.streams.filter(function (priorStream) {
	        return priorStream.streamId !== stream.streamId;
	      });
	      return state;
	    });
	  },

	  session: null,

	  connectToRoom: function connectToRoom(room) {
	    var _this3 = this;

	    // Fetch from meet.tokbox.com
	    this.setState(function (state) {
	      state.room = room;
	      return state;
	    });
	    fetch('https://meet.tokbox.com/' + room).then(function (data) {
	      return data.json();
	    }).then(function (roomConnection) {
	      return (0, _srcIndexIos.initSession)(roomConnection.apiKey, roomConnection.sessionId, roomConnection.token);
	    }).then(function (session) {
	      _this3.setState({ sessionState: 'Connecting...' });
	      _this3.session = session;
	      session.on('streamCreated', _this3.streamCreated);
	      session.on('streamDestroyed', _this3.streamDestroyed);
	      return session.connect();
	    }).then(function () {
	      _this3.setState({ sessionState: 'Getting camera...', loaded: true });
	      return (0, _srcIndexIos.initPublisher)();
	    }).then(function () {
	      _this3.setState({ sessionState: 'Publishing...' });
	      return _this3.session.publish();
	    }).then(function () {
	      _this3.setState({ sessionState: 'Connected', publishing: true });
	    })['catch'](function (err) {
	      _this3.setState({ sessionState: 'Error! ' + err });
	    });
	  }
	});

	_reactNative.AppRegistry.registerComponent('rntb', function () {
	  return rntb;
	});

/***/ },
/* 1 */
/***/ function(module, exports) {

	module.exports = require("react-native");

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	/*** IMPORTS FROM imports-loader ***/
	var React = __webpack_require__(1);

	'use strict';

	Object.defineProperty(exports, '__esModule', {
	  value: true
	});

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	var _publisher_viewIos = __webpack_require__(3);

	var _publisher_viewIos2 = _interopRequireDefault(_publisher_viewIos);

	var _subscriber_viewIos = __webpack_require__(4);

	var _subscriber_viewIos2 = _interopRequireDefault(_subscriber_viewIos);

	var _init_sessionIos = __webpack_require__(5);

	var _init_sessionIos2 = _interopRequireDefault(_init_sessionIos);

	var _init_publisherIos = __webpack_require__(8);

	var _init_publisherIos2 = _interopRequireDefault(_init_publisherIos);

	exports.PublisherView = _publisher_viewIos2['default'];
	exports.SubscriberView = _subscriber_viewIos2['default'];
	exports.initSession = _init_sessionIos2['default'];
	exports.initPublisher = _init_publisherIos2['default'];

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	/*** IMPORTS FROM imports-loader ***/
	var React = __webpack_require__(1);

	'use strict';

	Object.defineProperty(exports, '__esModule', {
	  value: true
	});

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

	function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	var _reactNative = __webpack_require__(1);

	var _reactNative2 = _interopRequireDefault(_reactNative);

	var PublisherView = (function (_React$Component) {
	  _inherits(PublisherView, _React$Component);

	  function PublisherView() {
	    _classCallCheck(this, PublisherView);

	    _get(Object.getPrototypeOf(PublisherView.prototype), 'constructor', this).apply(this, arguments);
	  }

	  _createClass(PublisherView, [{
	    key: 'render',
	    value: function render() {
	      return _reactNative2['default'].createElement(ReactPublisher, this.props);
	    }
	  }]);

	  return PublisherView;
	})(_reactNative2['default'].Component);

	PublisherView.propTypes = {};

	var ReactPublisher = (0, _reactNative.requireNativeComponent)('ReactPublisher', PublisherView);

	exports['default'] = PublisherView;
	module.exports = exports['default'];

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	/*** IMPORTS FROM imports-loader ***/
	var React = __webpack_require__(1);

	'use strict';

	Object.defineProperty(exports, '__esModule', {
	  value: true
	});

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

	function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	var _reactNative = __webpack_require__(1);

	var _reactNative2 = _interopRequireDefault(_reactNative);

	var SubscriberView = (function (_React$Component) {
	  _inherits(SubscriberView, _React$Component);

	  function SubscriberView() {
	    _classCallCheck(this, SubscriberView);

	    _get(Object.getPrototypeOf(SubscriberView.prototype), 'constructor', this).apply(this, arguments);
	  }

	  _createClass(SubscriberView, [{
	    key: 'render',
	    value: function render() {
	      return _reactNative2['default'].createElement(ReactSubscriber, this.props);
	    }
	  }]);

	  return SubscriberView;
	})(_reactNative2['default'].Component);

	SubscriberView.propTypes = {
	  /* The subscriber to show */
	  subscriberId: _reactNative2['default'].PropTypes.string.isRequired
	};

	var ReactSubscriber = (0, _reactNative.requireNativeComponent)('ReactSubscriber', SubscriberView);

	exports['default'] = SubscriberView;
	module.exports = exports['default'];

/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	/*** IMPORTS FROM imports-loader ***/
	var React = __webpack_require__(1);

	'use strict';

	Object.defineProperty(exports, '__esModule', {
	  value: true
	});

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	var _opentokIos = __webpack_require__(6);

	var _opentokIos2 = _interopRequireDefault(_opentokIos);

	var initSession = function initSession(apiKey, sessionId, token) {
	  return new Promise(function (resolve /* , reject */) {
	    var session = undefined;

	    var connect = function connect() {
	      return new Promise(function (connectResolve, connectReject) {
	        _opentokIos2['default'].connect(token, function (err) {
	          if (err) {
	            connectReject(err);
	          } else {
	            connectResolve();
	          }
	        });
	      });
	    };

	    var publish = function publish() {
	      return new Promise(function (publishResolve, publishReject) {
	        _opentokIos2['default'].publishToSession(function (err) {
	          if (err) {
	            publishReject(err);
	          } else {
	            (function () {
	              var streamCreated = undefined,
	                  publishFailed = undefined;
	              streamCreated = session.on('publisherStreamCreated', function (stream) {
	                publishResolve(stream);
	                streamCreated.remove();
	                publishFailed.remove();
	              });
	              publishFailed = session.on('publisherDidFailWithError', function (error) {
	                publishReject(error);
	                streamCreated.remove();
	                publishFailed.remove();
	              });
	            })();
	          }
	        });
	      });
	    };

	    var subscribe = function subscribe(streamId) {
	      return new Promise(function (subscribeResolve, subscribeReject) {
	        _opentokIos2['default'].subscribeToStream(streamId, function (err, subscriberId) {
	          if (err) {
	            subscribeReject(err);
	          } else {
	            subscribeResolve(subscriberId);
	          }
	        });
	      });
	    };

	    _opentokIos2['default'].initSession(apiKey, sessionId, function () {
	      session = {
	        connect: connect,
	        publish: publish,
	        subscribe: subscribe,
	        on: _opentokIos2['default'].addEventListener,
	        off: _opentokIos2['default'].removeEventListener
	      };
	      resolve(session);
	    });
	  });
	};

	exports['default'] = initSession;
	module.exports = exports['default'];

/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, '__esModule', {
	  value: true
	});

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	var _reactNative = __webpack_require__(1);

	var _NativeModules = __webpack_require__(7);

	var _NativeModules2 = _interopRequireDefault(_NativeModules);

	var NativeOpenTokSessionManager = _NativeModules2['default'].OpenTokSessionManager;

	var deviceEventHandlers = {};

	var OpenTokSessionManager = {

	  addEventListener: function addEventListener(type, handler) {
	    if (!deviceEventHandlers[type]) {
	      deviceEventHandlers[type] = {};
	    }
	    deviceEventHandlers[type][handler] = _reactNative.DeviceEventEmitter.addListener(type, function (event) {
	      return handler(event);
	    });

	    return {
	      remove: function remove() {
	        OpenTokSessionManager.removeEventListener(type, handler);
	      }
	    };
	  },

	  removeEventListener: function removeEventListener(type, handler) {
	    if (!deviceEventHandlers[type][handler]) {
	      return;
	    }

	    deviceEventHandlers[type][handler].remove();
	    deviceEventHandlers[type][handler] = null;
	  },

	  initSession: NativeOpenTokSessionManager.initSession,

	  connect: NativeOpenTokSessionManager.connect,

	  initPublisher: NativeOpenTokSessionManager.initPublisher,

	  publishToSession: NativeOpenTokSessionManager.publishToSession,

	  subscribeToStream: NativeOpenTokSessionManager.subscribeToStream
	};

	exports['default'] = OpenTokSessionManager;
	module.exports = exports['default'];

/***/ },
/* 7 */
/***/ function(module, exports) {

	module.exports = require("NativeModules");

/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	/*** IMPORTS FROM imports-loader ***/
	var React = __webpack_require__(1);

	'use strict';

	Object.defineProperty(exports, '__esModule', {
	  value: true
	});

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	var _opentokIos = __webpack_require__(6);

	var _opentokIos2 = _interopRequireDefault(_opentokIos);

	var initPublisher = function initPublisher() {
	  return new Promise(function (resolve, reject) {
	    _opentokIos2['default'].initPublisher(function (err) {
	      if (err) {
	        reject(err);
	      } else {
	        resolve();
	      }
	    });
	  });
	};

	exports['default'] = initPublisher;
	module.exports = exports['default'];

/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	/*** IMPORTS FROM imports-loader ***/
	var React = __webpack_require__(1);

	'use strict';

	Object.defineProperty(exports, '__esModule', {
	  value: true
	});

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	var _reactNative = __webpack_require__(1);

	var _reactNative2 = _interopRequireDefault(_reactNative);

	var styles = _reactNative.StyleSheet.create({

	  activityContainer: {
	    flex: 1,
	    flexDirection: 'row',
	    justifyContent: 'center',
	    alignItems: 'center',
	    backgroundColor: '#262422'
	  },

	  activityIndicator: {
	    alignItems: 'center',
	    justifyContent: 'center'
	  }

	});

	exports['default'] = _reactNative2['default'].createClass({
	  displayName: 'loading_view.ios',

	  render: function render() {
	    return _reactNative2['default'].createElement(
	      _reactNative.View,
	      { style: styles.activityContainer },
	      _reactNative2['default'].createElement(_reactNative.ActivityIndicatorIOS, {
	        animating: true,
	        style: [styles.activityIndicator, { height: 80 }],
	        size: 'large' })
	    );
	  }
	});
	module.exports = exports['default'];

/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	/*** IMPORTS FROM imports-loader ***/
	var React = __webpack_require__(1);

	'use strict';

	Object.defineProperty(exports, '__esModule', {
	  value: true
	});

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	var _reactNative = __webpack_require__(1);

	var _reactNative2 = _interopRequireDefault(_reactNative);

	/* eslint block-scoped-var: 0 */
	/* global require */
	var meetLogo = __webpack_require__(11);

	var styles = _reactNative.StyleSheet.create({
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
	    padding: 5,
	    color: '#DCD9B5'
	  }
	});

	exports['default'] = _reactNative2['default'].createClass({
	  displayName: 'RoomInputView',

	  propTypes: {
	    onSubmit: _reactNative2['default'].PropTypes.func.isRequired
	  },

	  render: function render() {
	    var _this = this;

	    return _reactNative2['default'].createElement(
	      _reactNative.View,
	      { style: styles.container },
	      _reactNative2['default'].createElement(_reactNative.Image, { source: meetLogo,
	        style: styles.logo }),
	      _reactNative2['default'].createElement(_reactNative.TextInput, { style: styles.roomInput,
	        placeholder: 'room name',
	        placeholderTextColor: '#DCD9B5',
	        onSubmitEditing: function (event) {
	          return _this.props.onSubmit(event.nativeEvent.text);
	        } })
	    );
	  }
	});
	module.exports = exports['default'];

/***/ },
/* 11 */
/***/ function(module, exports) {

	module.exports = require("image!meet-logo");

/***/ }
/******/ ])));