/*global describe,it,expect,beforeEach*/
define([
    'app/Main/component/controller/AppController',
    'mock/Notification',
    'angular',
    'angular-mocks'
], function(AppController, Notification, angular) {
    'use strict';

    describe('AppController', function() {
        var $injector = angular.injector(['ngMock']),
            $scope,
            $notification,
            appController
        ;

        beforeEach(function() {
            $scope = $injector.get('$rootScope').$new();

            $notification = new Notification();

            appController = new AppController($scope, $notification);
            spyOn(appController, '$$destroy').andCallThrough();
        });

        it('should expose $notification on its $scope', function() {
            expect(appController.$scope.$notification).toBe($notification);
        });

        it('should call $$destroy on $scope.$destroy() and set to undefined all its dependencies', function() {
            expect(appController.$$destroy).not.toHaveBeenCalled();
            appController.$scope.$destroy();
            expect(appController.$$destroy).toHaveBeenCalled();
            expect(appController.$scope).toBeUndefined();
        });
    });
});
