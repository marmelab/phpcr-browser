(function(app) {
  'use strict';

  app.controller('mbFrontCtrl', ['$scope', 'mbMenu', 'mbApi', function($scope, mbMenu, mbApi) {
    var retrieveRepositories = function() {
      mbApi.getRepositories().then(function(repositories) {
        $scope.repositories = repositories;
      });
    };

    retrieveRepositories();
  }]);
})(angular.module('browserApp'));