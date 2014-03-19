(function(angular, app) {
  'use strict';

  app.controller('mbRepositoriesCtrl', ['$scope', '$location', 'mbObjectMapper', function($scope, $location, ObjectMapper) {
      $scope.$on('search.change', function(e, value) {
        $scope.search = value;
      });

      $scope.openRepository = function(repository) {
        $location.path('/' + repository.getName());
      };

      ObjectMapper.find().then(function(repositories) {
        $scope.repositories = repositories;
      });
    }]);
})(angular, angular.module('browserApp'));