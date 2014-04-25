/* global define */
/* jshint indent:2 */

define([
  'app'
], function(app) {
  'use strict';

  app.service('mbEventBridge', ['$rootScope', function($rootScope){
    $rootScope.$on('browser.load', function() {
      $rootScope.$broadcast('_browser.load');
    });

    $rootScope.$on('browser.loaded', function() {
      $rootScope.$broadcast('_browser.loaded');
    });
  }]);
});
