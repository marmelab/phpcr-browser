define([], function() {
    'use strict';

    function Trash() {
        return {
            restrict: 'E',
            template: '<div class="dropper" droppable droppable-data="{ trash: true }"><span class="glyphicon glyphicon-trash"></span></div>'
        };
    }

    Trash.$inject = [];

    return Trash;
});
