(function(app) {
  'use strict';

  app.directive('mbScrollable', function(){
    return {
      restrict: 'E',
      transclude: true,
      replace: true,
      scope: '=',
      template: '<div class="scrollable" ng-transclude></div>',
    };
  });
})(angular.module('browserApp'));