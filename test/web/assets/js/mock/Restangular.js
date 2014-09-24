define('mock/Restangular', [
    'mixin'
], function(mixin) {
    'use strict';

    function Restangular() {

    }

    Restangular.prototype.setBaseUrl = function(url) {};

    Restangular.prototype.one = function() {
        return this;
    };

    Restangular.prototype.all = function() {
        return this;
    };

    Restangular.prototype.get = function() {
        return mixin.buildPromise(this);
    };

    Restangular.prototype.getList = function() {
        return mixin.buildPromise([this]);
    };

    Restangular.prototype.post = function() {
        return mixin.buildPromise({});
    };

    Restangular.prototype.withHttpConfig = function() {
        return this;
    };

    return Restangular;
});
