(function(angular, app) {
  'use strict';

  app.controller('mbRepositoryCtrl', ['$scope', '$log', 'mbRouteParametersConverter',
    function($scope, $log, mbRouteParametersConverter) {
      $scope.$on('search.change', function(e, value) {
        $scope.search = value;
      });

      mbRouteParametersConverter.getCurrentRepository().then(function(repository) {
        $scope.repository = repository;
        $scope.repository.getWorkspaces().then(function(workspaces) {
          $scope.workspaces = workspaces;
        });
      }, function(err) {
        $log.error(err);
      });
    }]);
})(angular, angular.module('browserApp'));