(function(app) {
  'use strict';

  app.directive('mbTreeNode', ['mbRecursionHelper', function(RecursionHelper) {
    return {
      restrict: 'A',
      scope: '=',
      templateUrl: '/assets/js/browser/directives/templates/treeNode.html',
      compile: function (element){
        return RecursionHelper.compile(element);
      },
      controller: function($scope, $location) {
        $scope.container = $scope.$parent.container;
        $scope.toggleCollapsed = function(node) {
          node.collapsed = !node.collapsed;
          if (!node.collapsed) { $scope.openNode(node); }
        };

        $scope.openNode = function(node) {
          $location.path('/' + $scope.container.repository.getName() + '/' + $scope.container.workspace.getName() + node.path);
        };
      }
    };
  }]);
})(angular.module('browserApp'));
