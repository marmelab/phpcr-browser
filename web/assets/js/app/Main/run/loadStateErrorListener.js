define([], function () {
    "use strict";

    function loadRequestAnimationFrame($rootScope, $log, $notification) {
        $rootScope.$on('$stateChangeError', function(evt, toState, toParams, fromState, fromParams, err) {
            if (err.data && err.data.message) {
                return $notification.error(err.data.message);
            }

            $notification.error('ERROR_RETRY');
        });
    }

    loadRequestAnimationFrame.$inject = ['$rootScope', '$log', '$notification'];

    return loadRequestAnimationFrame;
});

