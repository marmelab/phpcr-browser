define([], function() {
    'use strict';

    function NodeCreationForm() {
        return {
            controller: 'NodeCreationFormController',
            controllerAs: 'nodeCreationFormController'
        };
    }

    NodeCreationForm.$inject = [];

    return NodeCreationForm;
});
