(function(app) {
  'use strict';

  app.directive('mbNavbar', function(){
    return {
      restrict: 'E',
      transclude: true,
      replace: true,
      scope: '=',
      templateUrl: '/assets/js/browser/directives/templates/navbar.html',
      link: function($scope, element, attrs) {
        $scope.brand = attrs.brand;
      }
    };
  });
})(angular.module('browserApp'));