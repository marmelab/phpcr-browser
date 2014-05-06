/* global define */
/* jshint indent:2 */

define([
  'app',
  'services/node-factory',
  'services/recursion-helper'
], function(app) {
  'use strict';

  app.directive('mbTreeNode', ['$log', '$timeout', 'mbRecursionHelper',
    function($log, $timeout, RecursionHelper) {
    return {
      restrict: 'A',
      require: '^mbTree',
      scope: '=',
      templateUrl: '/assets/js/browser/directives/templates/treeNode.html',
      compile: function (element){
        return RecursionHelper.compile(element);
      },
      controller: function($scope, $location) {
        $scope.order = 'name';

        $scope.openNode = function(node) {
          var target = '/' + $scope.repository.getName() + '/' + $scope.workspace.getName() + node.path;
          if (target !== $location.path()) {
            return $location.path('/' + $scope.repository.getName() + '/' + $scope.workspace.getName() + node.path);
          }
          $scope.toggleNode(node.path);
        };

        $scope.toggleCreateForm = function(node) {
          node.displayCreateForm = !node.displayCreateForm;
        };

        $scope.createChildNode = function(node, nodeName) {
          if ($scope.repository.supports('node.create')) {
            if (!nodeName || nodeName.trim().length === 0) {
              return $log.error('Name is empty.');
            }

            var path;
            if (node.path !== '/') {
              path = node.path + '/' + nodeName;
            } else {
              path = node.path + nodeName;
            }

            $scope.richTree.getTree().append(node.path, { name: nodeName, path: path }).then(function() {
              node.displayCreateForm = false;
              $log.log('Node created');
            }, function(err) {
              if (err.data && err.data.message) { return $log.error(err, err.data.message); }
              $log.error(err);
            });
          } else {
            $log.error('This repository does not support node creation.');
          }
        };
      }
    };
  }]);
});
