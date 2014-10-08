define('mock/Notification', [], function() {
    'use strict';

    function Notification() {}

    Notification.prototype.close = function() {};

    Notification.prototype.error = function() {};

    Notification.prototype.info = function() {};

    Notification.prototype.success = function() {};

    Notification.prototype.warning = function() {};

    return Notification;
});
