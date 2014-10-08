define('mock/Graph', [
    'app/Graph/component/model/Node',
    'fixture/node',
    'mixin',
    'angular'
], function(Node, nodeFixture, mixin, angular) {
    'use strict';

    function Graph() {}

    Graph.prototype.find = function() {};

    return Graph;
});
