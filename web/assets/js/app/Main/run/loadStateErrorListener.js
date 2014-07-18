define([], function () {
    "use strict";

    function loadRequestAnimationFrame($rootScope, $log, $translate) {
        $rootScope.$on('$stateChangeError', function(evt, toState, toParams, fromState, fromParams, err) {
            if (err.data && err.data.message) {
                return $log.error(err, err.data.message);
            }
            console.log(err);
            $translate('ERROR_RETRY', function(translation) {console.log(translation);
                $log.error(err, translation);
            }, function() {
                $log.error(err);
            });
        });
    }

    loadRequestAnimationFrame.$inject = ['$rootScope', '$log', '$translate', 'toaster'];

    return loadRequestAnimationFrame;
});

