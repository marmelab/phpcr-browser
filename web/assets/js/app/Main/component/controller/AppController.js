define([], function () {
    "use strict";

    /**
     *
     * @param {$scope} $scope
     * @constructor
     */
    function AppController($scope) {
        this.$scope = $scope;

        $scope.$on('$destroy', this.destroy.bind(this));
    }

    AppController.prototype.destroy = function() {
        this.$scope = undefined;
    };

    AppController.$inject = ['$scope'];

    return AppController;
});
