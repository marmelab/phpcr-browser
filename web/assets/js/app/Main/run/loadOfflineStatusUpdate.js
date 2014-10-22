define([], function () {
    "use strict";

    function loadOfflineStatusUpdate($rootScope, $graph, $state, $interval) {
        $interval(function() {
            var params = {};

            if ($state.current.name !== 'repositories') {
                params = {
                    repository: $state.params.repository
                };
            }

            $graph.find(params, { cache: false }).then(function() {
                $rootScope.$broadcast('$offlineStatusUpdate', false);
            }, function(err) {
                $rootScope.$broadcast('$offlineStatusUpdate', true);
            });
        }, 30000);
    }

    loadOfflineStatusUpdate.$inject = ['$rootScope', '$graph', '$state', '$interval'];

    return loadOfflineStatusUpdate;
});

