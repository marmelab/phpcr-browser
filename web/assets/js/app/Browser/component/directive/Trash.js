define([], function() {
    'use strict';

    function Trash() {
        return {
            restrict: 'E',
            scope: '=',
            template: '<div class="dropper" droppable><span class="glyphicon glyphicon-trash"></span></div>'
        };
    }

    Trash.$inject = [];

    return Trash;
});
