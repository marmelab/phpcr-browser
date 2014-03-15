(function(app) {
  'use strict';
  // From http://blog.parkji.co.uk/2013/08/11/native-drag-and-drop-in-angularjs.html
  app.directive('draggable', ['$timeout', function($timeout) {
    return function(scope, element) {
      $timeout(function() { // We wrap it into a timeout to let time to ng-class to init
      // this gives us the native JS object
        if (element[0].className.split(' ').indexOf('no-draggable') !== -1) { return; }

        var el = element[0];

        el.draggable = true;

        el.addEventListener(
          'dragstart',
          function(e) {
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('Text', this.id);
            this.classList.add('drag');
            return false;
          },
          false
        );

        el.addEventListener(
          'dragend',
          function() {
            this.classList.remove('drag');
            return false;
          },
          false
        );
      });
    };
  }]);
})(angular.module('browserApp'));