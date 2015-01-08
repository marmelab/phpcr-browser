define('mock/NotificationFactory', [], function() {
    'use strict';

    return function() {
        return {
            content: function() {
                return {
                    timeout: function() {
                        return {
                            save: function() {}
                        }
                    }
                }
            }
        };
    };
});
