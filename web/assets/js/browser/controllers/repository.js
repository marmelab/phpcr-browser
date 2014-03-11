(function(angular, app) {
  'use strict';

  app.controller('mbRepositoryCtrl', ['$scope', '$log', 'mbRouteParametersConverter',
    function($scope, $log, mbRouteParametersConverter) {
    var buildNavbar = function(repository, workspaces) {
      var link = {
        label: repository.getName(),
        sublinks: []
      };

      angular.forEach(workspaces, function(workspace) {
        link.sublinks.push({
          label: workspace.getName(),
          href: '/' + repository.getName() + '/' + workspace.getName()
        });
      });
    };

    mbRouteParametersConverter.getCurrentRepository().then(function(repository) {
      $scope.repository = repository;
      $scope.repository.getWorkspaces().then(function(workspaces) {
        $scope.workspaces = workspaces;
        buildNavbar($scope.repository, $scope.workspaces);
      });
    }, function(err) {
      $log.error(err);
    });

  }]);
})(angular, angular.module('browserApp'));