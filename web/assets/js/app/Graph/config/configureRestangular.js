define([], function () {
    "use strict";

    function configureRestangular(RestangularProvider) {
        RestangularProvider.setDefaultHttpFields({cache: true});
        RestangularProvider.setResponseExtractor(function(response, operation) {
            return response.message;
        });
    }

    configureRestangular.$inject = ['RestangularProvider'];

    return configureRestangular;
});

