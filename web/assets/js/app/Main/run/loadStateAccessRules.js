define([], function () {
    "use strict";

    function loadStateAccessRules($rootScope, $graph, $state, $notification) {
        $rootScope.$on('$stateChangeStart', function(evt, toState, toParams, fromState, fromParams, err) {
            $graph.find(toParams, { cache: false }).then(null, function(err) {
                evt.preventDefault();

                if (toState.name === 'node') {
                    return $state
                        .go(
                            'repository',
                            { repository: toParams.repository }
                        )
                        .then(function() {
                            $notification.error('The workspace is not available');
                        })
                    ;
                }

                return $state
                    .go('repositories')
                    .then(function() {
                        $notification.error('The repository is not available');
                    })
                ;
            });
        });
    }

    loadStateAccessRules.$inject = ['$rootScope', '$graph', '$state', '$notification'];

    return loadStateAccessRules;
});

