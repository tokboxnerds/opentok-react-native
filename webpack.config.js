var path = require('path');

var webpack = require('webpack');

var reactNativeExternalsPromise = (function () {
  var reactNativeRoot = path.dirname(require.resolve('react-native/package'));
  var blacklist = require('react-native/packager/blacklist');
  var ReactPackager = require('react-native/packager/react-packager');
  var reactNativePackage = require('react-native/package');

  return ReactPackager.getDependencies({
    assetRoots: [reactNativeRoot],
    blacklistRE: blacklist(false),
    projectRoots: [reactNativeRoot],
    transformModulePath: require.resolve('react-native/packager/transformer')
  }, reactNativePackage.main)
    .then(function (dependencies) {
      return dependencies.filter(function (dependency) {
        return !dependency.isPolyfill;
      });
    })
    .then(function (dependencies) {
      return dependencies.map(function (dependency) {
        return dependency.id;
      });
    });
}());

module.exports = {
  debug: true,
  entry: {
    'index.ios': path.join(__dirname, 'app.ios')
  },
  externals: [
    function (context, request, cb) {
      reactNativeExternalsPromise.then(function (reactNativeExternals) {
        if (['react-native'].concat(reactNativeExternals).indexOf(request) !== -1 || request.indexOf('image!') === 0) {
          cb(null, request);
        } else{
          cb();
        }
      });
    }
  ],
  module: {
    loaders: [
      {test: /\.js$/, loader: 'babel?blacklist[]=react', exclude: /node_modules\//},
      {test: /\.jsx$/, loader: 'imports?React=react-native!babel'},
    ]
  },
  output: {
    filename: '[name].js',
    libraryTarget: 'commonjs'
  },
  plugins: [
    new webpack.DefinePlugin({
      __DEV__: true
    })
  ],
  resolve: {
    extensions: [
      '',
      '.js',
      '.jsx'
    ]
  }
};
