/*global describe,it,expect,beforeEach*/
define([
    'app/Browser/component/directive/Focus'
], function(Focus) {
    'use strict';

    describe('FocusDirective', function() {
        var focusDirective;

        beforeEach(function() {
           focusDirective = Focus();
        });

        it('shoud call focus on its element', function() {
            var element = [
                {
                    focus: jasmine.createSpy('focus')
                }
            ];

            focusDirective({}, element);
            expect(element[0].focus).toHaveBeenCalled();
        });
    });
});
