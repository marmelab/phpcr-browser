/* global define */
/* jshint indent:2 */

define([
  'app',
  'controllers/navbar',
  'controllers/properties',
  'controllers/repositories',
  'controllers/repository',
  'controllers/workspace',
  'directives/ui/overlay',
  'directives/ui/dropper',
  'directives/draggable',
  'directives/droppable',
  'directives/focus-me'
], function(app) {
  'use strict';

  app.controller('mbFrontCtrl', ['$scope', function($scope) {
    $scope.$on('_search.change', function(e, value) {
      $scope.$broadcast('search.change', value);
    });
  }]);
});
