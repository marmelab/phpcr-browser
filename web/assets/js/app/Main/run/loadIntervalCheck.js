define([], function () {
    "use strict";

    function loadIntervalCheck($rootScope, $graph, $state, $interval) {
        $interval(function() {
            var params = {};

            if ($state.current.name !== 'repositories') {
                params = {
                    repository: $state.params.repository
                }
            }

            $graph.find(params, { cache: false }).then(function() {
                $rootScope.$broadcast('$checkStatusUpdate', true);
            }, function(err) {
                $rootScope.$broadcast('$checkStatusUpdate', false);
            });
        }, 30000);
    }

    loadIntervalCheck.$inject = ['$rootScope', '$graph', '$state', '$interval'];

    return loadIntervalCheck;
});

