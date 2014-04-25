/* global define */
/* jshint indent:2 */

define([
  'app',
  'angular',
  'services/workspace-factory',
  'services/route-parameters-converter'
], function(app, angular) {
  'use strict';

  app.controller('mbRepositoryCtrl', ['$scope', '$log', '$location','mbRouteParametersConverter', 'mbWorkspaceFactory',
    function($scope, $log, $location, RouteParametersConverter, WorkspaceFactory) {
      $scope.displayCreateForm = false;

      $scope.$on('search.change', function(e, value) {
        $scope.search = value;
      });

      $scope.showCreateForm = function() {
        $scope.displayCreateForm = true;
      };

      $scope.hideCreateForm = function() {
        $scope.displayCreateForm = false;
      };

      $scope.openWorkspace = function(workspace) {
        $location.path('/' + workspace.getRepository().getName() + '/' + workspace.getName());
      };

      $scope.deleteWorkspace = function(element) {
        angular.forEach($scope.workspaces, function(workspace, k) {
          if (element.attr('id') === workspace.getSlug()) {
            if (workspace.getRepository().supports('workspace.delete')) {
              workspace.delete().then(function() {
                $log.log('Workspace deleted');
                delete $scope.workspaces[k];
              }, function(err) {
                $log.error(err, 'An error occurred, please retry.');
              });
            } else {
              $log.error('This repository does not support workspace deletion.');
            }
            return;
          }
        });
      };

      $scope.createWorkspace = function(workspaceName) {
        if ($scope.repository.supports('workspace.create')) {
          if (!workspaceName || workspaceName.trim().length === 0) {
            return $log.error('Name is empty.');
          }
          var workspace = WorkspaceFactory.build({ name: workspaceName }, $scope.repository);
          workspace.create().then(function() {
            $scope.repository.getWorkspaces({cache: false}).then(function(workspaces) {
              $scope.workspaces = workspaces;
              $log.log('Workspace created');
              $scope.displayCreateForm = false;
            });
          }, function(err) {
            if (err.data && err.data.message) { return $log.error(err, err.data.message); }
            $log.error(err);
          });
        } else {
          $log.error('This repository does not support workspace creation.');
        }
      };

      $scope.$emit('browser.load');
      RouteParametersConverter.getCurrentRepository().then(function(repository) {
        $scope.repository = repository;
        $scope.repository.getWorkspaces().then(function(workspaces) {
          $scope.workspaces = workspaces;
          $scope.$emit('browser.loaded');
        }, function(err) {
          if (err.data && err.data.message) { return $log.error(err, err.data.message); }
          $log.error(err, 'An error occurred, please retry.');
        });
      }, function(err) {
        if (err.data && err.data.message) { return $log.error(err, err.data.message); }
        $log.error(err, 'An error occurred, please retry.');
      });
    }]);
});
