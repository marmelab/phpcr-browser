define([
    'text!app/Browser/view/directive/propertyValue.html',
    'angular'
], function(propertyValueTemplate, angular) {
    'use strict';

    function PropertyValue() {
        return {
            scope: {
                'property': '=propertyValue',
                'onEdit': '&'
            },
            template: propertyValueTemplate,
            controller: function($scope){
                $scope.isIterable = function(data) {
                    return angular.isObject(data) || angular.isArray(data);
                };

                $scope.edit = function(value, options) {
                    return $scope.onEdit({
                        value: value,
                        options: options
                    });
                };
            }
        };
    }

    PropertyValue.$inject = [];

    return PropertyValue;
});
