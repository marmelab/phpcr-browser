angular.module('browserApp').directive('treeNode', function(RecursionHelper) {
    return {
      restrict: 'A',
      scope: '=',
      templateUrl: '/assets/js/browser/directives/templates/treeNode.html',
      compile: function (element){
         return RecursionHelper.compile(element);
      }
    };
  });
