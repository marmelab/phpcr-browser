/*global module*/
module.exports = function (config) {
  'use strict';

  config.set({
    basePath: '../',

    frameworks: ['requirejs', 'jasmine'],

    files: [
      {pattern: 'web/bower_components/**/*.js', included: false},
      {pattern: 'web/assets/js/**/*.js', included: false},
      {pattern: 'tests/{spec,unit}/**/*.js', included: false},
      {pattern: 'web/assets/js/browser/views/**/*.html', watched: true, included: false, served: true},
      'tests/main.js',
      'tests/fixtures.js',
      'tests/mixins.js',
      'tests/mocks.js'
    ],

    exclude: [
      'web/bower_components/angular-scenario/angular-scenario.js',
      'web/assets/js/browser/main.js'
    ],

    autoWatch: false,
    singleRun: true,
    browsers: ['PhantomJS'],
    colors: true,

    plugins: [
      'karma-chrome-launcher',
      'karma-phantomjs-launcher',
      'karma-jasmine',
      'karma-requirejs'
    ],

    preprocessors: {
      'web/assets/js/browser/view/**/*.html': 'ng-html2js'
    }
  });
};
