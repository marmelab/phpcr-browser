/* global define */
/* jshint indent:2 */

define([
  'app',
  'directives/property-value',
  'directives/tree-node',
  'directives/tree'
], function(app) {
  'use strict';

  app.controller('mbWorkspaceCtrl', ['$scope', '$log', 'mbTreeCache',
    function($scope, $log, TreeCache) {

      $scope.workspace   = $scope.currentNode.getWorkspace();
      $scope.repository  = $scope.currentNode.getWorkspace().getRepository();
      $scope.displayTree = false; // used in mobile mode

      $scope.$on('search.change', function(e, value) {
        $scope.search = value;
      });

      $scope.$on('tree.toggle', function() {
        $('#sidebar').toggleClass('active');
        // $scope.displayTree = !$scope.displayTree;
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
