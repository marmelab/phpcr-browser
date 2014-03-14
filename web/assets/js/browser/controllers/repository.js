(function(angular, app) {
  'use strict';

  app.controller('mbRepositoryCtrl', ['$scope', '$log', '$location','mbRouteParametersConverter',
    function($scope, $log, $location, mbRouteParametersConverter) {
      $scope.$on('search.change', function(e, value) {
        $scope.search = value;
      });

      $scope.openWorkspace = function(workspace) {
        $location.path('/' + workspace.getRepository().getName() + '/' + workspace.getName());
      };

      $scope.deleteWorkspace = function(element) {
        angular.forEach($scope.workspaces, function(workspace, k) {
          if (element.attr('id') === workspace.getSlug()) {
            if (workspace.getSupportedOperations().indexOf('workspace.delete') !== -1) {
              workspace.delete().then(function() {
                delete $scope.workspaces[k];
              }, function(err) {
                $log.error(err);
              });
            } else {
              $log.error('This repository does not support workspace deletion');
            }
            return;
          }
        });
      };

      $scope.$emit('browser.load');
      mbRouteParametersConverter.getCurrentRepository().then(function(repository) {
        $scope.repository = repository;
        $scope.repository.getWorkspaces().then(function(workspaces) {
          $scope.workspaces = workspaces;
          $scope.$emit('browser.loaded');
        });
      }, function(err) {
        $log.error(err);
      });
    }]);
})(angular, angular.module('browserApp'));