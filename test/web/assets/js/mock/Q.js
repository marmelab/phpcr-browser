define('mock/Q', [
    'mixin'
], function(mixin) {
    'use strict';

    function Q($q) {
        this.$q = $q;
    }

    Q.prototype.defer = function() {
        var deferred = this.$q.defer();
        deferred.promise.resolve = deferred.resolve;
        deferred.promise.reject = deferred.reject;

        return deferred;
    };

    Q.prototype.when = function(value) {
        return this.$q.when(value);
    };

    Q.prototype.reject = function(value) {
        return this.$q.reject(value);
    };

    Q.$inject = ['$q'];

    return Q;
});
