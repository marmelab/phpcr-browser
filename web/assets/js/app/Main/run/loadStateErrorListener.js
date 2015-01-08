define([], function () {
    "use strict";

    function loadStateErrorListener($rootScope, $state, $errorFromResponse) {
        var listener = function(evt, toState, toParams, fromState, fromParams, err) {
            return $state.go('repositories').then(function() {
                $errorFromResponse(err)
                    .timeout(3000)
                    .save();
            });
        };

        $rootScope.$on('$stateChangeError', listener);

        $rootScope.$on('$stateNotFound', listener);
    }

    loadStateErrorListener.$inject = ['$rootScope', '$state', '$errorFromResponse'];

    return loadStateErrorListener;
});
