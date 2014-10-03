define([], function () {
    "use strict";

    function loadRequestAnimationFrame($rootScope, $notification, $state) {
        var listener = function(evt, toState, toParams, fromState, fromParams, err) {
            return $state.go('repositories').then(function() {
                $notification.errorFromResponse(err);
            });
        };

        $rootScope.$on('$stateChangeError', listener);

        $rootScope.$on('$stateNotFound', listener);
    }

    loadRequestAnimationFrame.$inject = ['$rootScope', '$notification', '$state'];

    return loadRequestAnimationFrame;
});

