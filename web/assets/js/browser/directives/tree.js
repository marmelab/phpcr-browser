/* global define,$ */
/* jshint indent:2 */

define([
  'app',
  'services/object-mapper',
  'services/tree-cache'
], function(app) {
  'use strict';

  app.directive('mbTree', ['$log', '$location', function($log, $location) {
    var scrollTop,
        deleteNode;

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
        $scope.$on('node.open.start', function(){
          scrollTop = $('.scrollable-tree').scrollTop();
        });

        $scope.$on('node.open.success', function(event, repositoryName, workspaceName, nodePath){
          $scope.toggleNode(nodePath).then(function() {
            $('.scrollable-tree').scrollTop(scrollTop);
          });
        });

        $scope.$on('drop.delete', function(event, element) {
          deleteNode(element);
        });
      }],
      link: function(scope) {
        deleteNode = function(element) {
          if (element.hasClass('node')) {
            scope.richTree.getTree().remove(element.data('path')).then(function() {
              $log.log('Node deleted.');

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
            }, function(err) {
              if (err.status === 423) { return $log.warn('You can not delete this node. It is locked.'); }
              if (err.data && err.data.message) { return $log.error(err, err.data.message); }
              $log.error(err);
            });
          }
        };

        scope.toggleNode = function(path) {
          return scope.richTree.getTree().find(path).then(function(node) {
            return scope.richTree.getTree().refresh(path, { collapsed: !node.collapsed} ).then(function(node) {
              return node;
            });
          });
        };

        scope.moveNode = function(elementDropped, element) {
          if (!elementDropped.hasClass('node') || !element.hasClass('node')) {
            return;
          }

          var name = elementDropped.data('path').split('/').pop();

          if (elementDropped.data('path') === element.data('path') ||
            element.data('path') + '/' + name === elementDropped.data('path')) {
            return;
          } else if (element.data('path').slice(0, elementDropped.data('path').length) === elementDropped.data('path')) {
            $log.warn('Unauthorized move.');
            return;
          }

          scope.richTree.getTree().move(elementDropped.data('path'), element.data('path')).then(function() {
            scope.$emit('node.moved', { from: elementDropped.data('path'), to: element.data('path')});
          }, function(err) {
            if (err.status === 423) { return $log.warn('You can not move this node. It is locked.'); }
            if (err.data && err.data.message) { return $log.error(err, err.data.message); }
            $log.error(err);
          });
        };
      }
    };
  }]);
});
