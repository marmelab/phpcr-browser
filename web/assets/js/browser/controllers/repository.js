/* global define */
/* jshint indent:2 */

define([
  'app',
  'angular',
  'services/workspace-factory',
  'services/route-parameters-converter'
], function(app) {
  'use strict';

  app.controller('mbRepositoryCtrl', ['$scope', '$log', '$location', '$translate', 'mbWorkspaceFactory', 'repository',
    function($scope, $log, $location, $translate, WorkspaceFactory, repository) {
      $scope.displayCreateForm = false;
      $scope.repository = repository;
      $scope.repository.getWorkspaces().then(function(workspaces) {
        $scope.workspaces = workspaces;
      });

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
        if (!repository.supports('workspace.delete')) {
          return $translate('WORKSPACE_NOT_SUPPORT_DELETE').then($log.error, $log.error);
        }

        var index;
        var workspace = $scope.workspaces.filter(function(workspace, key) {
          if (element.attr('id') === workspace.getSlug()) {
            index = key;
            return true;
          }
          return false;
        })[0];

        workspace.delete().then(function() {
          $translate('WORKSPACE_DELETE_SUCCESS').then($log.log, $log.log).finally(function() {
            delete $scope.workspaces[index];
          });
        }, function(err) {
          $translate('ERROR_RETRY', function(translation) {
            $log.error(err, translation);
          }, function() {
            $log.error(err);
          });
        });
      };

      $scope.createWorkspace = function(workspaceName) {
        if (!repository.supports('workspace.create')) {
          return $translate('WORKSPACE_NOT_SUPPORT_DELETE').then($log.error, $log.error);
        }

        if (!workspaceName || workspaceName.trim().length === 0) {
          return $translate('WORKSPACE_CREATE_NAME_EMPTY').then($log.error, $log.error);
        }

        var workspace = WorkspaceFactory.build({ name: workspaceName }, $scope.repository);
        workspace.create().then(function() {
          $scope.repository.getWorkspaces({cache: false}).then(function(workspaces) {
            $scope.workspaces = workspaces;
            $translate('WORKSPACE_CREATE_SUCCESS').then($log.log, $log.log).finally(function() {
              $scope.displayCreateForm = false;
            });
          });
        }, function(err) {
          if (err.data && err.data.message) { return $log.error(err, err.data.message); }
          $log.error(err);
        });
      };
    }]);
});
