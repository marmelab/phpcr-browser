(function(app) {
  'use strict';

  app.controller('mbFrontCtrl', ['$scope', function($scope) {
    $scope.$on('_search.change', function(e, value) {
      $scope.$broadcast('search.change', value);
    });
  }]);
})(angular.module('browserApp'));