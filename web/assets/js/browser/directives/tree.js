/* global define,$ */
/* jshint indent:2 */

define([
  'app',
  'services/object-mapper',
  //'services/tree-view',
  'services/tree-cache'
], function(app) {
  'use strict';

  app.directive('mbTree', ['mbRouteParametersConverter', 'mbTreeCache', function(RouteParametersConverter, TreeCache) {
    var richTree, scrollTop;

    return {
      restrict: 'E',
      scope: {},
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

          // $scope.$on('drop.delete', function(e, element) {
          //   if (element.hasClass('node')) {
          //     ObjectMapper.find(
          //       '/' +
          //       $scope.container.repository.getName() + '/' +
          //       $scope.container.workspace.getName() +
          //       element.data('path'))
          //     .then(function(node) {
          //       node.delete().then(function() {
          //         $scope.$emit('node.deleted', node.getPath());
          //         $log.log('Node deleted.');
          //       }, function(err) {
          //         if (err.status === 423) { return $log.warn('You can not delete this node. It is locked.'); }
          //         if (err.data && err.data.message) { return $log.error(err, err.data.message); }
          //         $log.error(err);
          //       });
          //     }, function(err) {
          //       if (err.data && err.data.message) { return $log.error(err, err.data.message); }
          //       $log.error(err);
          //     });
          //   }
          // });

          // $scope.moveNode = function(elementDropped, element) {
          //   if (!elementDropped.hasClass('node') || !element.hasClass('node')) { return; }
          //   var name = elementDropped.data('path').split('/').pop();
          //   if (elementDropped.data('path') === element.data('path') ||
          //     element.data('path') + '/' + name === elementDropped.data('path')) { return; }
          //   else if (element.data('path').slice(0, elementDropped.data('path').length) === elementDropped.data('path')) {
          //     $log.warn('Unauthorized move.');
          //     return;
          //   }
          //   $scope.container.find(element.data('path'), $scope.container.tree['/']).updateInProgress = true;
          //   ObjectMapper.find('/' + $scope.container.repository.getName() +
          //     '/' + $scope.container.workspace.getName() +
          //     elementDropped.data('path')).then(function(nodeDropped) {
          //       nodeDropped.move(element.data('path')).then(function() {
          //         $scope.$emit('node.moved', { from: elementDropped.data('path'), to: element.data('path')});
          //       }, function(err) {
          //         if (err.data && err.data.message) { return $log.error(err, err.data.message); }
          //         $log.error(err);
          //       });
          //     }, function(err) {
          //       if (err.data && err.data.message) { return $log.error(err, err.data.message); }
          //       $log.error(err);
          //     });
          // };
        }],

      link: function(scope) {
        TreeCache.getRichTree().then(function(rt) {
          richTree = rt;
          RouteParametersConverter.getCurrentWorkspace().then(function(workspace) {
            scope.repository = workspace.getRepository();
            scope.workspace = workspace;
            scope.$emit('browser.loaded');
          });
        });

        scope.getRichTree = function() {
          return richTree;
        };

        scope.toggleNode = function(path) {
          return richTree.getTree().find(path).then(function(node) {
            return richTree.getTree().refresh(path, { collapsed: !node.collapsed} ).then(function(node) {
              return node;
            });
          });
        };
      }
    };
  }]);
});
