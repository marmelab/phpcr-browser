define([], function () {
    'use strict';

    var $$notificationIndex = -1;

    function Notification($translate, $timeout) {
        this.$translate = $translate;
        this.$timeout = $timeout;

        this.$$init();
    }

    Notification.prototype.$$init = function() {
        this.notifications = [];
    };

    Notification.prototype.$$dispatch = function(type, message) {
        var self = this;

        var index = ++$$notificationIndex;

        return this.$translate(message)
            .then(function(translation) {
                self.notifications.push({
                    type: type,
                    content: translation
                });
            }, function() {
                self.notifications[index] = {
                    type: type,
                    content: message,
                    expire: false,
                    $$hashKey: index
                };
            })
            .finally(function() {
                self.$timeout(function() {
                    self.close(index);
                }, 3000);
            })
        ;
    };

    Notification.prototype.close = function(index) {
        this.notifications[index].expire = true;
    };

    Notification.prototype.error = function(message) {
        return this.$$dispatch('danger', message);
    };

    Notification.prototype.info = function(message) {
        return this.$$dispatch('info', message);
    };

    Notification.prototype.success = function(message) {
        return this.$$dispatch('success', message);
    };

    Notification.prototype.warning = function(message) {
        return this.$$dispatch('warning', message);
    };

    Notification.$inject = ['$translate', '$timeout'];

    return Notification;
});
