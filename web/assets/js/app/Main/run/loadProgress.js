define([], function () {
    "use strict";

    function loadProgress($rootScope, $progress) {
        $progress.configure({ showSpinner: false });

        $rootScope.$on('$stateChangeStart', function(evt, toState, toParams, fromState, fromParams, err) {
            if (!$progress.isStarted()) {
                $progress.start();
            }
        });

        $rootScope.$on('$stateChangeSuccess', function(evt, toState, toParams, fromState, fromParams, err) {
            $progress.done();
        });

        $rootScope.$on('$stateChangeError', function(evt, toState, toParams, fromState, fromParams, err) {
            $progress.done();
        });
    }

    loadProgress.$inject = ['$rootScope', '$progress'];

    return loadProgress;
});

