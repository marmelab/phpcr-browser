define([], function () {
    'use strict';

    function notificationPatcher(factory, $translate) {
        return function() {
            var notification = factory(),
                save = notification.save;

            notification.save = function(delay) {
                $translate(notification.content())
                    .then(function(message) {
                        notification.content(message);
                    })
                    .finally(save);
            }

            return notification;
        }
    }

    return notificationPatcher;
});
