define([
    'lodash'
], function(_) {
    'use strict';

    // Adapted from http://jsfiddle.net/trevordixon/pXzj3/2/

    function Fuzzy () {
        return function (items, search) {
            if (!search) {
                return items;
            }

            search = search.toLowerCase();

            var results = [];

            items.map(function(item) {
                var j = 0, // remembers position of last found character
                    score = 0;

                // consider each search character one at a time
                for (var i = 0; i < search.length; i++) {
                    var l = search[i];
                    if (l === ' ') {
                        continue;     // ignore spaces
                    }

                    var oldJ = j;
                    j = item.toLowerCase().indexOf(l, j);     // search for character & update position

                    score += j - oldJ;

                    if (j === -1) {
                        return;  // if it's not found, exclude this item
                    }
                }

                results.push({
                    score: score,
                    item: item
                });
            });

            return results
                .sort(function(a, b) {
                    return a.score - b.score;
                })
                .map(function(result) {
                    return result.item;
                })
            ;
        };
    }

    return Fuzzy;
});
