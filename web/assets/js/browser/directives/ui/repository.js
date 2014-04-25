/* global define */
/* jshint indent:2 */

define([
  'app'
], function(app) {
  'use strict';

  app.directive('mbRepository', function(){
    return {
      restrict: 'E',
      transclude: true,
      replace: true,
      scope: {
        repository: '=entity',
        open: '='
      },
      templateUrl: '/assets/js/browser/directives/templates/repository.html'
    };
  });
});
