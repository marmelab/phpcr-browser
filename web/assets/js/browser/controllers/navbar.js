/* global define */
/* jshint indent:2 */

define([
  'app',
  'directives/navbar-item',
  'filters/jaro-winkler',
  'services/menu'
], function(app) {
  'use strict';

  app.controller('mbNavbarCtrl', ['$scope', 'mbMenu', function($scope, mbMenu) {
    $scope.$watch(function() {
      return mbMenu.getMenu();
    }, function(menu) {
      $scope.menu = menu;
    });

    $scope.$watch('search', function(value) {
      $scope.$emit('_search.change', value);
    });
  }]);
});
