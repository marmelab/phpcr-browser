/* global define,$ */
/* jshint indent:2 */

define([
  'app',
  'services/object-mapper',
  'services/tree-cache'
], function(app) {
  'use strict';

  /**
   * Tree display a tree of nodes.
   */
  app.directive('mbTree', ['$log', '$location', '$q', '$translate', function($log, $location, $q, $translate) {
    var deleteNode;

    return {
      restrict: 'E',
      scope: {
        currentNode: '=mbCurrentNode',
        richTree: '=mbRichTree',
        repository: '=mbRepository',
        workspace: '=mbWorkspace'
      },
      templateUrl: '/assets/js/browser/directives/templates/tree.html',
      controller: ['$scope', function($scope) {
        $scope.$on('drop.delete', function(event, element) {
          deleteNode(element);
        });
      }],
      link: function(scope) {
        /**
         * Delete a node in the tree
         * @param  {object} element
         */
        deleteNode = function(element) {
          if (element.hasClass('node')) {
            scope.richTree.getTree().remove(element.data('path')).then(function() {

              $translate('NODE_DELETE_SUCCESS').then($log.log, $log.log);

              // If the current was in the deleted hierarchy we display the parent node of the deleted node
              if ($location.path().substr(
                  scope.repository.getName().length + 2 +
                  scope.workspace.getName().length,
                  element.data('path').length
                ) === element.data('path')) {

                var parentPath = element.data('path').split('/');
                parentPath.pop();
                parentPath = parentPath.join('/');

                $location.path(scope.repository.getName() + '/' + scope.workspace.getName() + parentPath);
              }
            });
          }
        };

        /**
         * Toggle collapsed on a node
         * @param  {string} path
         * @return {promise}
         */
        scope.toggleNode = function(path) {
          if (!scope.richTree) {
            return $q.reject();
          }

          return scope.richTree.getTree().find(path).then(function(node) {
            return scope.richTree.getTree().refresh(path, { collapsed: !node.collapsed} );
          }).then(function(node) {
            if (node.collapsed) {
              node.displayCreateForm = false;
            }
            return node;
          });
        };

        /**
         * Move a node in the tree
         * @param  {object} elementDropped
         * @param  {object} element
         */
        scope.moveNode = function(elementDropped, element) {
          if (!elementDropped.hasClass('node') || !element.hasClass('node')) {
            return;
          }

          var name = elementDropped.data('path').split('/').pop();

          if (elementDropped.data('path') === element.data('path') ||
            element.data('path') + '/' + name === elementDropped.data('path')) {
            return;
          } else if (element.data('path').slice(0, elementDropped.data('path').length) === elementDropped.data('path')) {
            return $translate('NODE_MOVE_FORBIDDEN').then($log.warn, $log.warn);
          }

          scope.richTree.getTree().move(elementDropped.data('path'), element.data('path')).then(function(node) {
            scope.$emit('node.moved', { from: elementDropped.data('path'), to: element.data('path')});
            $translate('NODE_MOVE_SUCCESS').then($log.log, $log.log);
            $location.path(scope.repository.getName() + '/' + scope.workspace.getName() + node.path);
          });
        };
      }
    };
  }]);
});
