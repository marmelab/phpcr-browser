/*global define,describe,it,beforeEach,module,inject,expect*/
/* jshint indent:2 */

define([
  'angular',
  'angularMocks',
  'app',
  'directives/ui/dropper'
], function () {
  'use strict';

  describe('Directive: Dropper', function () {
    var element,
        drop = 'dropCallback',
        $rootScope,
        $compile;

    // load the directive's module
    beforeEach(module('browserApp'));

    beforeEach(inject(function($injector) {
      $rootScope = $injector.get('$rootScope');
      $compile = $injector.get('$compile');
    }));

    beforeEach(function() {
      element = '<mb-dropper drop="' + drop + '"></mb-dropper>';
      element = $compile(element)($rootScope);
      $rootScope.$digest();
    });

    it('should be replaced by a div with dropper class and drop and droppable attribute', function () {
      expect(element[0].tagName).toBe('DIV');
      expect(element.hasClass('dropper')).toBe(true);
      expect(element.attr('drop')).toBe(drop);
      expect(element.attr('droppable')).toBe('');
    });

    it('should contain a trash glyphicon', function () {
      expect(element.find('span').hasClass('glyphicon')).toBe(true);
      expect(element.find('span').hasClass('glyphicon-trash')).toBe(true);
      expect(element.find('span').html()).toBe('');
    });
  });
});
