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

    $rootScope.$on('$stateChangeSuccess', function(evt, toState, toParams, fromState, fromParams){
      if (toState.name === 'workspace' && fromState.name !== 'workspace') {
        $rootScope.$broadcast('workspace.open.success', toParams.repository, toParams.workspace);
      } else if(toState.name === fromState.name &&
        (toParams.repository !== fromParams.repository ||
        toParams.workspace !== fromParams.workspace)) {
        $rootScope.$broadcast('workspace.open.success', toParams.repository, toParams.workspace);
      } else if(toState.name === fromState.name &&
        toState.name === 'workspace' &&
        toParams.repository === fromParams.repository &&
        toParams.workspace === fromParams.workspace &&
        toParams.path !== fromParams.path) {
        $rootScope.$broadcast('node.open.success', toParams.repository, toParams.workspace, toParams.path);
      }
    });

    $rootScope.$on('$stateChangeStart', function(evt, toState, toParams, fromState, fromParams){
      if (toState.name === 'workspace' && fromState.name !== 'workspace') {
        $rootScope.$broadcast('workspace.open.start', toParams.repository, toParams.workspace);
      } else if(toState.name === fromState.name &&
        (toParams.repository !== fromParams.repository ||
        toParams.workspace !== fromParams.workspace)) {
        $rootScope.$broadcast('workspace.open.start', toParams.repository, toParams.workspace);
      } else if(toState.name === fromState.name &&
        toState.name === 'workspace' &&
        toParams.repository === fromParams.repository &&
        toParams.workspace === fromParams.workspace &&
        toParams.path !== fromParams.path) {
        $rootScope.$broadcast('node.open.start', toParams.repository, toParams.workspace, toParams.path);
      }
    });
  }]);
});
