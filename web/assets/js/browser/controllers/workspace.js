(function(angular, app) {
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
})(angular, angular.module('browserApp'));
