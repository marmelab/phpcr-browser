/* global define */
/* jshint indent:2 */

define([
  'app'
], function(app) {
  'use strict';

  app.directive('mbOverlay', function(){
    return {
      restrict: 'E',
      scope: {
        'text': '@',
        'showOn': '@',
        'hideOn': '@'
      },
      template: '<div class="overlay">{{ text }}</div>',
      link: function($scope, element) {
        $scope.$on($scope.hideOn, function() {
          element.hide();
        });

        $scope.$on($scope.showOn, function() {
          element.show();
        });
      }
    };
  });
});
