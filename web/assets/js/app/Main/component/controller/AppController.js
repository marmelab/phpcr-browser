define([], function () {
    'use strict';

    /**
     *
     * @param {$scope} $scope
     * @constructor
     */
    function AppController($scope, $notification) {
        this.$scope = $scope;
        this.$scope.$notification = $notification;

        this.$$init();
    }

    AppController.prototype.$$init = function() {
        var self = this;

        this.$scope.$on('$destroy', function () {
            self.$$destroy();
        });
    };

    AppController.prototype.$$destroy = function() {
        this.$scope = undefined;
    };

    AppController.$inject = ['$scope', '$notification'];

    return AppController;
});
