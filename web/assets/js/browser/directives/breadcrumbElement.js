angular.module('browserApp').directive('breadcrumbElement', function(RecursionHelper) {
    return {
      restrict: 'A',
      scope: '=',
      templateUrl: '/assets/js/browser/view/breadcrumbElement.html',
      compile: function (element){
         return RecursionHelper.compile(element); 
      }
    };
  });
