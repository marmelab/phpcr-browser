/* global define */
/* jshint indent:2 */

define([
  'app'
], function(app) {
  'use strict';

  app.directive('mbDropper', function(){
    return {
      restrict: 'E',
      transclude: true,
      replace: true,
      scope: '=',
      template: '<div class="dropper" droppable><span class="glyphicon glyphicon-trash"></span></div>',
    };
  });
});
