angular.module('browserApp').directive('propertyValue', function(RecursionHelper) {
	
    return {
      restrict: 'A',
      scope: '=',
      templateUrl: '/assets/js/browser/view/propertyValue.html',
      compile: function (element){
        return RecursionHelper.compile(element);
      }
    };
  });
