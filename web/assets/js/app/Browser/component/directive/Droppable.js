define([], function() {
    'use strict';

    // From http://blog.parkji.co.uk/2013/08/11/native-drag-and-drop-in-angularjs.html
    function Droppable($parse) {
        return {
            link: function(scope, element, attrs) {
                // again we need the native object
                var el = element[0],
                    droppableData = $parse(attrs.droppableData)(scope) || {}
                ;

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

                        var elementDropped = angular.element(document.getElementById(e.dataTransfer.getData('Text'))),
                            draggableData = elementDropped.scope() ? elementDropped.scope().draggableData : null
                        ;

                        if (draggableData) {
                            scope.$emit('$elementDropSuccess', {
                                droppableData: droppableData,
                                draggableData: draggableData
                            });
                        }
                        return false;
                    },
                    false
                );
            }
        };
    }

    Droppable.$inject = ['$parse'];

    return Droppable;
});
