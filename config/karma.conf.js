/*global module*/
module.exports = function (config) {
  'use strict';

  config.set({
    basePath: '../',

    frameworks: ['requirejs', 'jasmine'],

    files: [
      {pattern: 'web/bower_components/**/*.js', included: false},
      {pattern: 'web/assets/js/**/*.js', included: false},
      {pattern: 'tests/lib/angular/angular-mocks.js', included: false},
      {pattern: 'tests/{spec,unit}/**/*.js', included: false},
      {pattern: 'web/assets/js/browser/views/**/*.html', watched: true, included: false, served: true},
      'tests/main.js'
    ],

    exclude: [
      'web/bower_components/angular-scenario/angular-scenario.js',
      'web/assets/js/browser/main.js'
    ],

    autoWatch: false,
    singleRun: true,
    browsers: ['Chrome'],
    colors: true,

    plugins: [
      'karma-chrome-launcher',
      'karma-jasmine',
      'karma-requirejs',
      //'karma-ng-html2js-preprocessor'
    ],

    preprocessors: {
      //location of templates
     // 'app/views/**/*.html': 'html2js'
    }

    // ngHtml2JsPreprocessor: {
    //   // strip app from the file path
    //   //stripPrefix: 'app/'
    // }
  });
};
