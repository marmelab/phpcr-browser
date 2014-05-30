/* global define */
/* jshint indent:2 */

define([
  'app',
  'angular',
  'services/workspace-factory'
], function(app) {
  'use strict';

  app.controller('mbRepositoryCtrl', ['$scope', '$log', '$location', '$translate', 'mbWorkspaceFactory', 'repository',
    function($scope, $log, $location, $translate, WorkspaceFactory) {
      $scope.displayCreateForm = false;

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
        if (!$scope.repository.supports('workspace.delete')) {
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
        });
      };

      $scope.createWorkspace = function(workspaceName) {
        if (!$scope.repository.supports('workspace.create')) {
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
        });
      };
    }]);
});
