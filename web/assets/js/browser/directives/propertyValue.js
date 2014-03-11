angular.module('browserApp').directive('propertyValue', function(RecursionHelper) {

    return {
      restrict: 'A',
      scope: '=',
      templateUrl: '/assets/js/browser/directives/templates/propertyValue.html',
      compile: function (element){
        return RecursionHelper.compile(element);
      }
    };
  });
