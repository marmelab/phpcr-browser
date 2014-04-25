/* global define */
/* jshint indent:2 */

define([
  'app'
], function(app) {
  'use strict';
  // From http://blog.parkji.co.uk/2013/08/11/native-drag-and-drop-in-angularjs.html
  app.directive('draggable', function() {
    return {
      link: function(scope, element, attrs) {
        // this gives us the native JS object

        if (!attrs.draggable) { return; }

        var el = element[0];

        el.draggable = true;

        var dragstart  = function(e) {
          e.dataTransfer.effectAllowed = 'move';
          e.dataTransfer.setData('Text', this.id);
          this.classList.add('drag');
          return false;
        };
        el.addEventListener(
          'dragstart',
          dragstart,
          false
        );

        var dragend = function() {
          this.classList.remove('drag');
          return false;
        };

        el.addEventListener(
          'dragend',
          dragend,
          false
        );
      }
    };
  });
});
