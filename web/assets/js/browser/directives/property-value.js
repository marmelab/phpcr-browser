/* global define */
/* jshint indent:2 */

define([
  'app',
  'angular',
  'services/recursion-helper'
], function(app, angular) {
  'use strict';

  app.directive('mbPropertyValue', ['mbRecursionHelper', function(RecursionHelper) {
    return {
      restrict: 'A',
      scope: {
        property: '=mbProperty',
        createProperty: '=mbCreate',
        updateProperty: '=mbUpdate',
        deleteProperty: '=mbDelete'
      },
      templateUrl: '/assets/js/browser/directives/templates/propertyValue.html',
      compile: function (element){
        return RecursionHelper.compile(element);
      },
      controller: function($scope) {
        $scope.isObject = angular.isObject;
      }
    };
  }]);
});
