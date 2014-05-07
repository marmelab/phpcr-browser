/*global define,describe,it,beforeEach,module,inject,expect,jasmine,spyOn*/
/* jshint indent:2 */

define([
  'angular',
  'angularMocks',
  'app',
  'directives/draggable'
], function () {
  'use strict';

  describe('Directive: Draggable', function () {
    var element,
        $rootScope,
        $compile;

    // load the directive's module
    beforeEach(module('browserApp'));

    beforeEach(inject(function($injector) {
      $rootScope = $injector.get('$rootScope');
      $compile = $injector.get('$compile');
    }));

    beforeEach(function() {
      $rootScope.draggable = true;
      element = angular.element('<div draggable="{{ draggable }}"></div>');
      spyOn(element[0], 'addEventListener').andCallThrough();
      element = $compile(element)($rootScope);
      $rootScope.$digest();
    });

    it('should define element as draggable if attribute is true', function () {
      expect(element[0].draggable).toBe(true);
    });

    it('should attach event listeners for dragstart and dragend events', function() {
      expect(element[0].addEventListener).toHaveBeenCalledWith('dragstart', jasmine.any(Function), false);
      expect(element[0].addEventListener).toHaveBeenCalledWith('dragend', jasmine.any(Function), false);
    });
  });
});
