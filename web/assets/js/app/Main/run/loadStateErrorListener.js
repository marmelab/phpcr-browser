define([], function () {
    "use strict";

    function loadRequestAnimationFrame($rootScope, $log, $notification, $state) {
        $rootScope.$on('$stateChangeError', function(evt, toState, toParams, fromState, fromParams, err) {

            if (err.data && err.data.message) {
                return $state.go('repositories').then(function() {
                    return $notification.error(err.data.message);
                });
            }

            return $state.go('repositories').then(function() {
                $notification.error('An error occured, please retry');
            });
        });

        $rootScope.$on('$stateNotFound', function(evt, toState, toParams, fromState, fromParams, err) {

            if (err.data && err.data.message) {
                return $state.go('repositories').then(function() {
                    return $notification.error(err.data.message);
                });
            }

            return $state.go('repositories').then(function() {
                $notification.error('An error occured, please retry');
            });
        });
    }

    loadRequestAnimationFrame.$inject = ['$rootScope', '$log', '$notification', '$state'];

    return loadRequestAnimationFrame;
});

