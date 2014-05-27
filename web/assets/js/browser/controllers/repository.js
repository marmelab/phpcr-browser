/* global define */
/* jshint indent:2 */

define([
  'app',
  'angular',
  'services/workspace-factory',
  'services/route-parameters-converter'
], function(app, angular) {
  'use strict';

  app.controller('mbRepositoryCtrl', ['$scope', '$log', '$location', '$translate', 'mbRouteParametersConverter', 'mbWorkspaceFactory',
    function($scope, $log, $location, $translate, RouteParametersConverter, WorkspaceFactory) {
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
        for (var k in $scope.workspaces) {
          var workspace = $scope.workspaces[k];
          if (element.attr('id') === workspace.getSlug()) {
            if (workspace.getRepository().supports('workspace.delete')) {
              return workspace.delete().then(function() {
                $translate('WORKSPACE_DELETE_SUCCESS').then($log.log, $log.log).finally(function() {
                  delete $scope.workspaces[k];
                });
              }, function(err) {
                $translate('ERROR_RETRY', function(translation) {
                  $log.error(err, translation);
                }, function() {
                  $log.error(err);
                });
              });
            } else {
              return $translate('WORKSPACE_NOT_SUPPORT_DELETE').then($log.error, $log.error);
            }
          }
        }
      };

      $scope.createWorkspace = function(workspaceName) {
        if ($scope.repository.supports('workspace.create')) {
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
        } else {
          $translate('WORKSPACE_NOT_SUPPORT_DELETE').then($log.error, $log.error);
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
          $translate('ERROR_RETRY', function(translation) {
            $log.error(err, translation);
          }, function() {
            $log.error(err);
          });
        });
      }, function(err) {
        if (err.data && err.data.message) { return $log.error(err, err.data.message); }
        $translate('ERROR_RETRY', function(translation) {
          $log.error(err, translation);
        }, function() {
          $log.error(err);
        });
      });
    }]);
});
