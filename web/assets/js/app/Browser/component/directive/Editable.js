define([
    'text!app/Browser/view/directive/editable.html',
    'angular'
], function(editableTemplate, angular) {
    'use strict';

    function Editable() {
        return {
            restrict: 'A',
            scope: {
                value: '=editable',
                editableOptions: '=',
                editableOnSave: '&'
            },
            template: editableTemplate,
            controller: function($scope, $element, $attrs) {
                var resetForm = function() {
                    $scope.form = {
                        value: $scope.value
                    };
                };

                resetForm();
                $scope.$pending = false;

                $scope.edit = function() {
                    $scope.$pending = true;
                };

                $scope.hide = function() {
                    $scope.$pending = false;
                }

                $scope.save = function() {
                    var result = $scope.editableOnSave({
                        value: $scope.form.value,
                        options: $scope.editableOptions
                    });

                    if (result && result.then && typeof(result.then) === 'function') {
                        return result.then(resetForm).then($scope.hide);
                    }

                    $scope.hide();
                    resetForm();
                }

            }
        };
    }

    Editable.$inject = [];

    return Editable;
});
