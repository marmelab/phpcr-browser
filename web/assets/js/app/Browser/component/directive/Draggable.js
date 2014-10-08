define([], function() {
    'use strict';
    // From http://blog.parkji.co.uk/2013/08/11/native-drag-and-drop-in-angularjs.html
    function Draggable($parse) {
        return {
            restrict: 'A',
            link: function(scope, element, attrs) {
                if (!$parse(attrs.draggable)(scope)) {
                    return;
                }

                var el = element[0];
                scope.draggableData = $parse(attrs.draggableData)(scope) || {};

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
            }
        };
    }

    Draggable.$inject = ['$parse'];

    return Draggable;
});
