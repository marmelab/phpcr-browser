(function(app) {
  'use strict';

  app.controller('mbFrontCtrl', ['$scope', 'mbObjectMapper', function($scope, ObjectMapper) {
    var retrieveRepositories = function() {
      ObjectMapper.find().then(function(repositories) {
        $scope.repositories = repositories;
      });
    };

    retrieveRepositories();
  }]);
})(angular.module('browserApp'));