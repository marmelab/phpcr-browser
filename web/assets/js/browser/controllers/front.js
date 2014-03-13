(function(app) {
  'use strict';

  app.controller('mbFrontCtrl', ['$scope', 'mbObjectMapper', function($scope, ObjectMapper) {
    $scope.$on('_search.change', function(e, value) {
      $scope.$broadcast('search.change', value);
    });

    var retrieveRepositories = function() {
      ObjectMapper.find().then(function(repositories) {
        $scope.repositories = repositories;
      });
    };

    retrieveRepositories();
  }]);
})(angular.module('browserApp'));