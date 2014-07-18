define([], function () {
    'use strict';

    function Search() {
        this.$$init();
    }

    Search.prototype.$$init = function() {
        this.listeners = [];
    };

    Search.prototype.registerListener = function(listener) {
        this.listeners.push(listener);
        var self = this;

        return (function(listener) {
            return function() {
                self.listeners.splice(self.listeners.indexOf(listener), 1);
            };
        }(listener));
    }

    Search.prototype.notify = function(data) {
        for (var i in this.listeners) {
            if (this.listeners.hasOwnProperty(i)) {
                this.listeners[i].apply(this.listeners[i], [data]);
            }
        }
    };

    Search.$inject = [];

    return Search;
});
