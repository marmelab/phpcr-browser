/*global define,describe,it,beforeEach,module,inject,expect,jasmine,spyOn,xit*/
/* jshint indent:2 */

define([
  'angular',
  'angularMocks',
  'app',
  'directives/droppable'
], function () {
  'use strict';

  describe('Directive: Droppable', function () {
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
      $rootScope.dropCallback = jasmine.createSpy('dropCallback');
      element = angular.element('<div droppable drop="dropCallback"></div>');
      spyOn(element[0], 'addEventListener').andCallThrough();
      element = $compile(element)($rootScope);
      $rootScope.$digest();
    });

    it('should attach event listeners for dragover, dragenter, dragleave and drop events', function() {
      expect(element[0].addEventListener).toHaveBeenCalledWith('dragover', jasmine.any(Function), false);
      expect(element[0].addEventListener).toHaveBeenCalledWith('dragenter', jasmine.any(Function), false);
      expect(element[0].addEventListener).toHaveBeenCalledWith('dragleave', jasmine.any(Function), false);
      expect(element[0].addEventListener).toHaveBeenCalledWith('drop', jasmine.any(Function), false);
    });

    xit('should call dropCallback on drop event', function() {
      // to implement
    });
  });
});
