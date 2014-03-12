(function(angular, app) {
  'use strict';

  app.controller('mbNavbarCtrl', ['$scope', 'mbMenu', function($scope, mbMenu) {
    $scope.menu = mbMenu.getMenu();
  }]);
})(angular, angular.module('browserApp'));