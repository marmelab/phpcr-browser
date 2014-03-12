(function(app) {
  'use strict';

  app.directive('mbTree', function() {
    return {
      restrict: 'E',
      scope: {
        currentNode: '=mbCurrentNode'
      },
      templateUrl: '/assets/js/browser/directives/templates/tree.html'
    };
  });
})(angular.module('browserApp'));