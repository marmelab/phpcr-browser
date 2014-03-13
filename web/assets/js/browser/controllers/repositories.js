(function(angular, app) {
  'use strict';

  app.controller('mbRepositoriesCtrl', ['$scope', 'mbObjectMapper', function($scope, ObjectMapper) {
      $scope.$on('search.change', function(e, value) {
        $scope.search = value;
      });

      var retrieveRepositories = function() {
        ObjectMapper.find().then(function(repositories) {
          $scope.repositories = repositories;
        });
      };

      retrieveRepositories();
    }]);
})(angular, angular.module('browserApp'));