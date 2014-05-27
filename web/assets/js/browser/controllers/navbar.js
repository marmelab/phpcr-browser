/* global define */
/* jshint indent:2 */

define([
  'app',
  'directives/navbar-item',
  'filters/jaro-winkler',
  'services/menu'
], function(app) {
  'use strict';

  app.controller('mbNavbarCtrl', ['$scope', '$translate', 'mbMenu', function($scope, $translate, mbMenu) {

    $scope.isPreferredLanguage = function(key) {
      return $translate.use() === key;
    };

    $scope.changeLanguage = $translate.use;

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
