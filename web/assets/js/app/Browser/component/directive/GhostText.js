define([
    'jquery'
], function($) {
    'use strict';

    function GhostText() {
        return function(scope, element, attrs){
            element.find(attrs.ghostText).hide();

            element.on('mouseenter', function() {
                element.find(attrs.ghostText).show();
            });

            element.on('mouseleave', function() {
                element.find(attrs.ghostText).hide();
            });
        };
    }

    GhostText.$inject = [];

    return GhostText;
});
