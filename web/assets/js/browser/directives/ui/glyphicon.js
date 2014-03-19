(function(app) {
  'use strict';

  app.directive('glyphicon', function(){
    return {
      restrict: 'E',
      scope: {
        'icon': '@'
      },
      template: '<span class="glyphicon glyphicon-{{ icon }}"></span>',
    };
  });
})(angular.module('browserApp'));