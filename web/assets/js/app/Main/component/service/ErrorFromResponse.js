define([], function () {
    'use strict';

    function ErrorFromResponse($error, $warning) {
        return function(err) {
            if (err.status === 423) {
                return $warning().content('The resource is locked');
            }

            return $error().content(err.data.message || 'An error occured')
        };
    }

    ErrorFromResponse.$inject = ['$error', '$warning'];

    return ErrorFromResponse;
});
