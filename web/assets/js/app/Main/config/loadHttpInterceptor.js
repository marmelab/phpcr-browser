define([], function () {
    'use strict';

    function loadHttpInterceptor($httpProvider) {
        $httpProvider.useApplyAsync(true);

        $httpProvider.interceptors.unshift(['$q', '$progress', function($q, $progress) {
            var loadingCount = 0;

            return {
                request: function(config) {
                    if(++loadingCount === 1) {
                        if (!$progress.isStarted()) {
                            $progress.start();
                        }
                    }

                    return config || $q.when(config);
                },

                response: function(response) {
                    if(--loadingCount === 0) {
                        $progress.done();
                    }

                    return response || $q.when(response);
                },

                responseError: function (response) {
                    if(--loadingCount === 0) {
                        $progress.done();
                    }

                    return $q.reject(response);
                }
            };
        }]);
    }

    loadHttpInterceptor.$inject = ['$httpProvider'];

    return loadHttpInterceptor;
});

