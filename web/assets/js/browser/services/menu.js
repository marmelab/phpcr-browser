/* global define */
/* jshint indent:2 */

define([
  'app'
], function(app) {
  'use strict';

  /**
   * Menu provide logic to build the navbar. It uses builders (see MenuBuilderFactory) to generate each link.
   */
  app.service('mbMenu', ['$rootScope', function($rootScope) {

    var menu,
        builders = {};

    /**
     * Reset the menu container
     */
    var resetMenu = function() {
      menu = {};
    };

    resetMenu();

    /**
     * Get the menu container
     * @return {object}
     */
    var getMenu = function() {
      return menu;
    };

    /**
     * Run a menu link builder
     * @param  {name} name
     * @param  {mixed} builder
     */
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

    /**
     * Register a menu link builder
     * @param  {object} builderContainer
     */
    var appendBuilder = function(builderContainer) {
      builders[builderContainer.name] = builderContainer.builder;
    };

    /**
     * Compile the menu for a route
     * @param  {string} routeName
     */
    var compileMenu = function(routeName) {
      resetMenu();
      if (builders[routeName]) {
        runBuilder(routeName, builders[routeName]);
      }
    };

    /**
     * Route change listener to build automatically the menu
     */
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
