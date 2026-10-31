'use strict';

const build = require('@microsoft/sp-build-web');

build.addSuppression(`Warning - [sass] The local CSS class 'ms-Grid' is not camelCase and will not be type-safe.`);
build.addSuppression(/Warning - lint.*pair-react-dom-render-unmount/);

build.configureWebpack.mergeConfig({
  additionalConfiguration: (generatedConfiguration) => {
    generatedConfiguration.optimization = generatedConfiguration.optimization || {};
    generatedConfiguration.optimization.splitChunks = false;
    generatedConfiguration.optimization.runtimeChunk = false;
    const minimizers = generatedConfiguration.optimization.minimizer || [];
    minimizers.forEach((plugin) => {
      if (plugin && plugin.options) {
        plugin.options.extractComments = false;
      }
    });
    return generatedConfiguration;
  }
});

var getTasks = build.rig.getTasks;
build.rig.getTasks = function () {
  var result = getTasks.call(build.rig);

  result.set('serve', result.get('serve-deprecated'));

  return result;
};

build.initialize(require('gulp'));
