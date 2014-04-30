/* global define */
/* jshint indent:2 */

define([
  'app'
], function(app) {
  'use strict';

  app.service('mbMenu', ['$rootScope', function($rootScope) {

    var menu,
        builders = {};

    var resetMenu = function() {
      menu = {};
    };

    resetMenu();

    var getMenu = function() {
      return menu;
    };

    var runBuilder = function(name, builder) {
      if (typeof(builder) === 'function') {
        return builder(function(link) {
          menu[name] = link;
        });
      }

      for (var i=0; i<builder.length; i++) {
        if (i < builder.length-1) {
          runBuilder(builder[i], builders[builder[i]]);
        } else {
          runBuilder(name, builder[i]);
        }
      }
    };

    var appendBuilder = function(builderContainer) {
      builders[builderContainer.name] = builderContainer.builder;
    };

    var compileMenu = function(routeName) {
      resetMenu();
      if (builders[routeName]) {
        runBuilder(routeName, builders[routeName]);
      }
    };

    $rootScope.$on('$stateChangeSuccess', function(evt, toState, toParams, fromState, fromParams){
      if (toState.name === fromState.name &&
        toParams.repository === fromParams.repository &&
        toParams.workspace === fromParams.workspace ) { return; }

      compileMenu(toState.name);
    });

    return {
      appendBuilder: appendBuilder,
      getMenu: getMenu
    };
  }]);
});
