(function(app) {
  'use strict';

  app.directive('mbTree', function() {
    return {
      restrict: 'E',
      scope: {
        currentNode: '=mbCurrentNode'
      },
      templateUrl: '/assets/js/browser/directives/templates/tree.html',
      controller: function($scope, mbTreeView) {
        $scope.container = mbTreeView.getTreeContainer();
      }
    };
  });
})(angular.module('browserApp'));