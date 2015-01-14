define([], function () {
    "use strict";

    function loadStateErrorListener($rootScope, $state, $notify) {
        var listener = function(evt, toState, toParams, fromState, fromParams, err) {
            return $state.go('repositories').then(function() {
                $notify()
                    .type('response')
                    .content(err)
                    .timeout(3000)
                    .save();
            });
        };

        $rootScope.$on('$stateChangeError', listener);

        $rootScope.$on('$stateNotFound', listener);
    }

    loadStateErrorListener.$inject = ['$rootScope', '$state', '$notify'];

    return loadStateErrorListener;
});
