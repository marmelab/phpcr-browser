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

  app.controller('mbWorkspaceCtrl', ['$scope', '$log', 'mbRouteParametersConverter',
    function($scope, $log, mbRouteParametersConverter) {
      $scope.$on('search.change', function(e, value) {
        $scope.search = value;
      });

      $scope.delete = function(element) {
        $scope.$broadcast('drop.delete', element);
      };

      mbRouteParametersConverter.getCurrentNode().then(function(node) {
        $scope.currentNode = node;
      }, function(err) {
        if (err.data && err.data.message) { return $log.error(err, err.data.message); }
        $log.error(err);
      });
    }]);
});
