/* global define */
/* jshint indent:2 */

define([
  'app',
  'directives/navbar-item',
  'filters/jaro-winkler',
  'services/menu'
], function(app) {
  'use strict';

  app.controller('mbNavbarCtrl', ['$scope', '$translate', '$state', 'mbMenu', function($scope, $translate, $state, mbMenu) {

    $scope.treeIsDisplayed = false;

    $scope.isWorkspaceState = function() {
      return $state.current.name === 'workspace';
    };

    $scope.isPreferredLanguage = function(key) {
      return $translate.use() === key;
    };

    $scope.changeLanguage = $translate.use;

    $scope.broadcast = function(event, data) {
      $scope.$emit(event, data);
    };

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
