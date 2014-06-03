/* global define */
/* jshint indent:2 */

define([
  'app',
  'services/node-factory',
  'services/recursion-helper'
], function(app) {
  'use strict';

  /**
   * TreeNode displays a node of the tree.
   */
  app.directive('mbTreeNode', ['$log', '$timeout', '$translate', 'mbRecursionHelper',
    function($log, $timeout, $translate, RecursionHelper) {
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

        /**
         * Open a node in the tree
         * @param  {object} node
         */
        $scope.openNode = function(node) {
          var target = '/' + $scope.repository.getName() + '/' + $scope.workspace.getName() + node.path;
          $scope.toggleNode(node.path);
          if (target !== $location.path()) {
            return $location.path('/' + $scope.repository.getName() + '/' + $scope.workspace.getName() + node.path);
          }
        };

        /**
         * Toggle the add node form
         * @param  {object} node
         */
        $scope.toggleCreateForm = function(node) {
          if (node.collapsed && node.hasChildren) {
            return $scope.toggleNode(node.path).then(function() {
              node.displayCreateForm = !node.displayCreateForm;
            });
          }
          node.displayCreateForm = !node.displayCreateForm;
        };

        /**
         * Create a child node
         * @param  {object} node
         * @param  {string} nodeName
         */
        $scope.createChildNode = function(node, nodeName) {
          if ($scope.repository.supports('node.create')) {
            if (!nodeName || nodeName.trim().length === 0) {
              return $translate('NODE_DELETE_NAME_EMPTY').then($log.error, $log.error);
            }

            var path;
            if (node.path !== '/') {
              path = node.path + '/' + nodeName;
            } else {
              path = node.path + nodeName;
            }

            $scope.richTree.getTree().append(node.path, { name: nodeName, path: path }).then(function() {
              node.displayCreateForm = false;
              $translate('NODE_CREATE_SUCCESS').then($log.log, $log.log);
            });
          } else {
            $translate('NODE_NOT_SUPPORT_CREATE').then($log.error, $log.error);
          }
        };
      }
    };
  }]);
});
