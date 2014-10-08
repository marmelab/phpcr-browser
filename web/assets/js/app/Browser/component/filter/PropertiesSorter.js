define([], function() {
    'use strict';

    var alphabeticalSorter = function(a, b) {
        if (a.name < b.name) {
            return -1;
        } else {
            return 1;
        }
    };

    function PropertiesSorter() {
        return function(inputs) {
            if (inputs) {
                var jcr = inputs
                    .filter(function(v, k) {
                        return k.match('(.+):(.+)');
                    })
                    .sort(alphabeticalSorter)
                ;

                var others = inputs
                    .filter(function(v, k) {
                        return !k.match('(.+):(.+)');
                    })
                    .sort(alphabeticalSorter)
                ;

                inputs = others.concat(jcr);
            }

            return inputs;
        };
    };

    return PropertiesSorter;
});
