define('mock/Restangular', [
    'mixin'
], function(mixin) {
    'use strict';

    function Restangular(getListReturn, getReturn) {
        this.getListReturn = getListReturn || [];
        this.getReturn = getReturn || {};
    }

    Restangular.prototype.setBaseUrl = function(url) {};

    Restangular.prototype.one = function() {
        return this;
    };

    Restangular.prototype.all = function() {
        return this;
    };

    Restangular.prototype.get = function() {
        return mixin.buildPromise(this.getReturn);
    };

    Restangular.prototype.getList = function() {
        return mixin.buildPromise(this.getListReturn);
    };

    Restangular.prototype.post = function() {
        return mixin.buildPromise({});
    };

    Restangular.prototype.withHttpConfig = function() {
        return this;
    };

    return Restangular;
});
