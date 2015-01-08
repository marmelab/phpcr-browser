/*global describe,it,expect,beforeEach*/
define([
    'app/Main/component/controller/AppController',
    'angular',
    'angular-mocks'
], function(AppController, angular) {
    'use strict';

    describe('AppController', function() {
        var $injector = angular.injector(['ngMock']),
            $scope,
            $notification,
            appController
        ;

        beforeEach(function() {
            $scope = $injector.get('$rootScope').$new();

            appController = new AppController($scope);
            spyOn(appController, '$$destroy').andCallThrough();
        });

        it('should call $$destroy on $scope.$destroy() and set to undefined all its dependencies', function() {
            expect(appController.$$destroy).not.toHaveBeenCalled();
            appController.$scope.$destroy();
            expect(appController.$$destroy).toHaveBeenCalled();
            expect(appController.$scope).toBeUndefined();
        });
    });
});
