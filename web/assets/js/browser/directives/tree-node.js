(function(app) {
  'use strict';

  app.directive('mbTreeNode', function(RecursionHelper) {
    return {
      restrict: 'A',
      templateUrl: '/assets/js/browser/directives/templates/treeNode.html',
      compile: function (element){
        return RecursionHelper.compile(element);
      }
    };
  });
})(angular.module('browserApp'));
