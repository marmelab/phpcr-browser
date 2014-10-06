define([], function () {
    "use strict";

    function loadProgress($progress) {
        $progress.configure({ showSpinner: false });
    }

    loadProgress.$inject = ['$progress'];

    return loadProgress;
});

