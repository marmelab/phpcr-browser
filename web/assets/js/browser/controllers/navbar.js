(function(angular, app) {
  'use strict';

  app.controller('mbNavbarCtrl', ['$scope', function($scope) {
    $scope.links = [];
    $scope.$on('navbar.push', function(e, link) {
      $scope.links.push(link);
    });

  }]);
})(angular, angular.module('browserApp'));