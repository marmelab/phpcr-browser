define([], function () {
    "use strict";

    function loadLogListener($log, $translate, toaster) {
        var logListenerFactory = function(title, toastType) {
            return function(message, toast, display) {
                display = display === undefined ? true : display;
                if (display) {
                    if (toast) { message = toast; }
                    $translate(title).then(function(translation) {
                        toaster.pop(toastType, translation, message);
                    }, function(err) {
                        toaster.pop(toastType, err, message);
                    });
                }
            };
        };

        $log.before('error', logListenerFactory('ERROR', 'error'));
        $log.before('log',   logListenerFactory('SUCCESS', 'success'));
        $log.before('info',  logListenerFactory('NOTE', 'note'));
        $log.before('warn',  logListenerFactory('WARNING', 'warning'));

        $log.decorate(function(message) {
            return [message]; // To remove toast in the log
        });
    }

    loadLogListener.$inject = ['$log', '$translate', 'toaster'];

    return loadLogListener;
});

