(function(app) {
  'use strict';

  app.controller('mbFrontCtrl', ['$scope', 'mbApi', function($scope, mbApi) {
    mbApi.getRepositories().then(function(repositories) {
      $scope.repositories = repositories;
      var link = {
        label: 'Repositories',
        sublinks: []
      };

      angular.forEach($scope.repositories, function(repository) {
        link.sublinks.push({
          label: repository.getName(),
          href: '/' + repository.getName()
        });
      });

      $scope.$broadcast('navbar.push', link);
    });
  }]);
})(angular.module('browserApp'));