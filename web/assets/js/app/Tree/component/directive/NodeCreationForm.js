define([], function() {
    'use strict';

    function NodeCreationForm() {
        return {
            controller: function($scope, $tree) {
                $scope.createNode = function() {
                    // $tree.find();
                };
            }
        }
    }

    NodeCreationForm.$inject = [];

    return NodeCreationForm;
});
