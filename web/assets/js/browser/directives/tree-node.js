(function(app) {
  'use strict';

  app.directive('mbTreeNode', function(RecursionHelper) {
    return {
      restrict: 'A',
      scope: '=',
      templateUrl: '/assets/js/browser/directives/templates/treeNode.html',
      compile: function (element){
        return RecursionHelper.compile(element);
      },
      controller: function($scope) {
        $scope.currentNode = $scope.$parent.currentNode;
      }
    };
  });
})(angular.module('browserApp'));
