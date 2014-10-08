/*global describe,it,expect,beforeEach*/
define([
    'app/Main/component/service/Search'
], function(Search) {
    'use strict';

    describe('Search', function() {
        var $search;

        beforeEach(function() {
            $search = new Search();
        });

        it('should init listeners list', function() {
            expect($search.listeners).toEqual([]);
        });

        it('should add a listener when registerListener is called and an unplug function', function() {
            var listener = jasmine.createSpy('listener');
            var removeListener = $search.registerListener(listener);
            expect($search.listeners[0]).toBe(listener);

            removeListener();
            expect($search.listeners.length).toBe(0);
        });

         it('should notify all listeners when notify is called', function() {
            var listener1 = jasmine.createSpy('listener1'),
                listener2 = jasmine.createSpy('listener2')
            ;

            $search.registerListener(listener1);
            $search.registerListener(listener2);

            $search.notify('test');

            expect(listener1).toHaveBeenCalledWith('test');
            expect(listener2).toHaveBeenCalledWith('test');
        });
    });
});
