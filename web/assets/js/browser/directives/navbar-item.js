/* global define */
/* jshint indent:2 */

define([
  'app'
], function(app) {
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
});
