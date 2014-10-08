define([], function() {
    'use strict';

    function Focus() {
        return function(scope, element){
            element[0].focus();
        };
    }

    Focus.$inject = [];

    return Focus;
});
