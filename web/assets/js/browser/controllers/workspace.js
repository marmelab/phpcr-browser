(function(angular, app) {
  'use strict';

  app.controller('mbWorkspaceCtrl', ['$scope', '$log', 'mbRouteParametersConverter',
    function($scope, $log, mbRouteParametersConverter) {
      mbRouteParametersConverter.getCurrentNode().then(function(node) {
        $scope.currentNode = node;
      }, function(err) {
        $log.error(err);
      });
    }]);
})(angular, angular.module('browserApp'));