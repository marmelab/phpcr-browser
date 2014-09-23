define([], function () {
    "use strict";

    function loadIntervalCheck($rootScope, $graph, $state, $notification, $interval) {
        $interval(function() {
            var params = {};

            if ($state.current.name !== 'repositories') {
                params = {
                    repository: $state.params.repository
                }
            }

            $graph.find(params, { cache: false }).then(null, function(err) {
                return $state
                    .go('repositories')
                    .then(function() {
                        $notification.error(err.data.message);
                    })
                ;
            });
        }, 30000);
    }

    loadIntervalCheck.$inject = ['$rootScope', '$graph', '$state', '$notification', '$interval'];

    return loadIntervalCheck;
});

