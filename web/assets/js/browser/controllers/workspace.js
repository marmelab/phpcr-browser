/* global define */
/* jshint indent:2 */

define([
  'app',
  'directives/property-value',
  'directives/tree-node',
  'directives/tree'
], function(app) {
  'use strict';

  app.controller('mbWorkspaceCtrl', ['$scope', '$log', 'mbTreeCache', 'node',
    function($scope, $log, TreeCache, node) {

      $scope.currentNode = node;
      $scope.workspace   = node.getWorkspace();
      $scope.repository  = node.getWorkspace().getRepository();

      $scope.$on('search.change', function(e, value) {
        $scope.search = value;
      });

      $scope.delete = function(element) {
        $scope.$broadcast('drop.delete', element);
      };

      TreeCache.getRichTree().then(function(rt) {
        $scope.richTree = rt;
        $scope.$emit('browser.loaded');
      });
    }]);
});
