(function(app) {
  'use strict';

  app.directive('mbDropper', function(){
    return {
      restrict: 'E',
      transclude: true,
      replace: true,
      scope: '=',
      template: '<div class="dropper" droppable><glyphicon icon="trash"></glyphicon></div>',
    };
  });
})(angular.module('browserApp'));