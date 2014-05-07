/*global define,describe,it,beforeEach,module,inject,expect,spyOn*/
/* jshint indent:2 */

define([
  'angular',
  'angularMocks',
  'app',
  'directives/focus-me'
], function (angular) {
  'use strict';

  describe('Directive: FocusMe', function () {
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
      element = angular.element('<input type="text" mb-focus-me/>');
      spyOn(element[0], 'focus').andCallThrough();
      element = $compile(element)($rootScope);
      $rootScope.$digest();
    });

    it('should focus on element', function () {
      expect(element[0].focus).toHaveBeenCalled();
    });
  });
});
