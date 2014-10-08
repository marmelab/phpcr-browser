define([
    'text!app/Browser/view/directive/recursiveTable.html',
    'angular'
], function(recursiveTableTemplate, angular) {
    'use strict';

    function RecursiveTable() {
        return {
            template: recursiveTableTemplate,
            link: function(scope, element, attrs){
                scope.isIterable = function(data) {
                    return angular.isObject(data) || angular.isArray(data);
                };

                scope.isHtml = function(data) {
                    return !!angular.element(data)[0];
                };

                scope.data = scope.$eval(attrs.recursiveTable);
            }
        };
    }

    RecursiveTable.$inject = [];

    return RecursiveTable;
});
