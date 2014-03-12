(function(app) {
  'use strict';

  app.directive('mbNavbarItem', function() {
    return {
      restrict: 'A',
      scope: {
        link: '=mbLink',
      },
      templateUrl: '/assets/js/browser/directives/templates/navbarItem.html',
    };
  });
})(angular.module('browserApp'));