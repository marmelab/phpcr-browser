define([], function() {
    'use strict';

    // from http://stackoverflow.com/a/19705096

    function Unsafe ($sce) {
        return function(value) {
            return $sce.trustAsHtml(value);
        };
    }

    Unsafe.$inject = ['$sce'];

    return Unsafe;
});
