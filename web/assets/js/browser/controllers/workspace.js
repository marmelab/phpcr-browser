(function(angular, app) {
  'use strict';

  app.controller('mbWorkspaceCtrl', ['$scope', '$log', 'mbRouteParametersConverter',
    function($scope, $log, mbRouteParametersConverter) {
      mbRouteParametersConverter.getCurrentWorkspace().then(function(workspace) {
        $scope.workspace = workspace;
      }, function(err) {
        $log.error(err);
      });
    }]);
})(angular, angular.module('browserApp'));