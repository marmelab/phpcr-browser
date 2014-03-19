(function(app) {
  'use strict';

  app.directive('fontAwesome', function(){
    return {
      restrict: 'E',
      scope: {
        'icon': '@'
      },
      template: '<i class="fa {{ _icon }}"></i>',
      link: function($scope) {
        $scope._icon = $scope.icon.split(' ').map(function(i) {
          return 'fa-'+i;
        }).join(' ');
      }
    };
  });
})(angular.module('browserApp'));