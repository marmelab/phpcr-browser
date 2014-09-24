define('mock/Graph', [
    'app/Graph/component/model/Node',
    'fixture/node',
    'mixin',
    'angular'
], function(Node, nodeFixture, mixin, angular) {
    'use strict';

    function Graph() {

    }

    Graph.prototype.find = function(query, params) {
        var response = {};
        query = query || {};
        params = params || {};

        if (query.path) {
            response = new Node(angular.copy(nodeFixture), {});
        }

        return mixin.buildPromise(response)
    };

    return Graph;
});
