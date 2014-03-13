(function(angular, app) {
  'use strict';

  app.controller('mbNavbarCtrl', ['$scope', 'mbMenu', function($scope, mbMenu) {
    $scope.menu = mbMenu.getMenu();
    $scope.$watch('search', function(value) {
      $scope.$emit('_search.change', value);
    });
  }]);
})(angular, angular.module('browserApp'));