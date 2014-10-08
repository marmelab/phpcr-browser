/*global describe,it,expect,beforeEach*/
define([
    'app/Browser/component/filter/Fuzzy'
], function(Fuzzy) {
    'use strict';

    describe('FuzzyFilter', function() {
        var $fuzzyFilter;

        beforeEach(function() {
           $fuzzyFilter = Fuzzy();
        });

        it('shoud find elements', function() {
            var items = ['test', 'toto', 'hep:j', 'a@lm:'],
                result
            ;

            result = $fuzzyFilter(items, 't');
            expect(result).toEqual(['test', 'toto']);

            result = $fuzzyFilter(items, ':');
            expect(result).toEqual(['hep:j', 'a@lm:']);

            result = $fuzzyFilter(items, 'am');
            expect(result).toEqual(['a@lm:']);

            result = $fuzzyFilter(items, 'tt');
            expect(result).toEqual(['test', 'toto']);

            result = $fuzzyFilter(items, 'tto');
            expect(result).toEqual(['toto']);
        });
    });
});
