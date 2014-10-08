define('mock/Translate', [
    'mixin'
], function(mixin) {
    'use strict';

    function Translate() {
        return mixin.buildPromise('test');
    }

    Translate.use = function() {};

    return Translate;
});
