/* global define */
/* jshint indent:2 */

define([
  'app',
  'services/recursion-helper'
], function(app) {
  'use strict';

  app.directive('mbPropertyValue', ['mbRecursionHelper', function(RecursionHelper) {
    return {
      restrict: 'A',
      scope: '=',
      templateUrl: '/assets/js/browser/directives/templates/propertyValue.html',
      compile: function (element){
        return RecursionHelper.compile(element);
      }
    };
  }]);
});
