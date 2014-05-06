/* global define */
/* jshint indent:2 */

define([
  'app',
  'directives/property-value',
  'directives/tree-node',
  'directives/tree',
  'services/route-parameters-converter'
], function(app) {
  'use strict';

  app.controller('mbWorkspaceCtrl', ['$scope', '$log', 'mbRouteParametersConverter', 'mbTreeCache',
    function($scope, $log, RouteParametersConverter, TreeCache) {
      $scope.$on('search.change', function(e, value) {
        $scope.search = value;
      });

      $scope.delete = function(element) {
        $scope.$broadcast('drop.delete', element);
      };

      TreeCache.getRichTree().then(function(rt) {
        $scope.richTree = rt;
      }).then(function() {
        return RouteParametersConverter.getCurrentNode().then(function(node) {
          $scope.currentNode = node;
          $scope.repository = node.getWorkspace().getRepository();
          $scope.workspace = node.getWorkspace();
          $scope.$emit('browser.loaded');
        });
      }, function(err) {
        if (err.data && err.data.message) { return $log.error(err, err.data.message); }
        $log.error(err);
      });
    }]);
});
