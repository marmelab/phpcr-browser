(function(angular, app) {
  'use strict';

  app.controller('mbRepositoriesCtrl', ['$scope', '$location', 'mbObjectMapper', function($scope, $location, ObjectMapper) {
      $scope.$on('search.change', function(e, value) {
        $scope.search = value;
      });

      $scope.openRepository = function(repository) {
        $location.path('/' + repository.getName());
      };

      $scope.$emit('browser.load');
      ObjectMapper.find().then(function(repositories) {
        $scope.repositories = repositories;
        $scope.$emit('browser.loaded');
      });
    }]);
})(angular, angular.module('browserApp'));