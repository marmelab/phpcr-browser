/*global describe,it,expect,beforeEach*/
define([
    'app/Main/component/service/Notification',
    'mock/Translate',
    'angular',
    'angular-mocks'
], function(Notification, Translate, angular) {
    'use strict';

    describe('Notification', function() {
        var $injector = angular.injector(['ngMock']),
            $notification,
            $translate,
            $timeout
        ;

        beforeEach(function() {
            $translate = jasmine.createSpy('$translate').andCallFake(Translate);
            angular.extend($translate, Translate);

            $timeout = jasmine.createSpy('$timeout').andCallFake($injector.get('$timeout'));
            angular.extend($timeout, $injector.get('$timeout'));

            $notification = new Notification($translate, $timeout);
        });

        it('should init notifications list', function() {
            expect($notification.notifications).toEqual([]);
        });

        it('should translate the message and create the notification when $$dispatch is called', function() {
            spyOn($notification, 'close').andCallThrough();

            $notification.$$dispatch('info', 'hello');

            expect($translate).toHaveBeenCalledWith('hello');
            // As we use our mock, the promises are always resolved synchronously
            expect($notification.notifications[0]).toEqual({
                type: 'info',
                content: 'test',
                expired: false,
                $$hashKey: 0
            });
            expect($timeout).toHaveBeenCalledWith(jasmine.any(Function), 3000);
            $timeout.flush();
            expect($notification.close).toHaveBeenCalledWith(0);
        });

        it('should set expired to true when close is called', function() {
            $notification.notifications.push({ expired: false });
            $notification.close(0);
            expect($notification.notifications[0].expired).toBe(true);
        });

        it('should call $$dispatch with error as type when error is called', function() {
            spyOn($notification, '$$dispatch');
            $notification.error('test');
            expect($notification.$$dispatch).toHaveBeenCalledWith('danger', 'test');
        });

        it('should call $$dispatch with info as type when info is called', function() {
            spyOn($notification, '$$dispatch');
            $notification.info('test');
            expect($notification.$$dispatch).toHaveBeenCalledWith('info', 'test');
        });

        it('should call $$dispatch with success as type when success is called', function() {
            spyOn($notification, '$$dispatch');
            $notification.success('test');
            expect($notification.$$dispatch).toHaveBeenCalledWith('success', 'test');
        });

        it('should call $$dispatch with warning as type when warning is called', function() {
            spyOn($notification, '$$dispatch');
            $notification.warning('test');
            expect($notification.$$dispatch).toHaveBeenCalledWith('warning', 'test');
        });
    });
});
