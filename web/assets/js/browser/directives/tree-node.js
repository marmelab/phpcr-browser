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
      controller: function($scope) {
        $scope.container = $scope.$parent.container;
        $scope.toggleCollapsed = function(node) {
          node.collapsed = !node.collapsed;
        };
      }
    };
  }]);
})(angular.module('browserApp'));
