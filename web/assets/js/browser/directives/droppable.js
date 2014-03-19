(function(angular, app) {
  'use strict';
  // From http://blog.parkji.co.uk/2013/08/11/native-drag-and-drop-in-angularjs.html
  app.directive('droppable', function() {
    return {
      scope: {
        drop: '=' // parent
      },
      link: function(scope, element) {
        // again we need the native object
        var el = element[0];

        el.addEventListener(
          'dragover',
          function(e) {
            e.dataTransfer.dropEffect = 'move';
            // allows us to drop
            if (e.preventDefault) { e.preventDefault(); }
            this.classList.add('over');
            return false;
          },
          false
        );

        el.addEventListener(
          'dragenter',
          function() {
            this.classList.add('over');
            return false;
          },
          false
        );

        el.addEventListener(
          'dragleave',
          function() {
            this.classList.remove('over');
            return false;
          },
          false
        );

        el.addEventListener(
          'drop',
          function(e) {
            // Stops some browsers from redirecting.
            if (e.stopPropagation) { e.stopPropagation(); }

            this.classList.remove('over');

            var elementDropped = document.getElementById(e.dataTransfer.getData('Text'));
            //this.appendChild(element);
            // call the drop passed drop function
            scope.$apply(function() {
              scope.drop(angular.element(elementDropped), element);
            });
            return false;
          },
          false
        );
      }
    };
  });
})(angular, angular.module('browserApp'));