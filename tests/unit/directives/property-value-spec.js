/*global define,describe,it,beforeEach,module,inject,expect*/
/* jshint indent:2 */

define([
  'fixtures',
  'angular',
  'angularMocks',
  'app',
  'directives/property-value',
  'directives/templates/propertyValue'
], function (fixtures) {
  'use strict';

  describe('Directive: PropertyValue', function () {
    var element,
        $rootScope,
        $compile;

    // load the directive's module
    beforeEach(module('browserApp'));

    // load the directive's template
    beforeEach(module('/assets/js/browser/directives/templates/propertyValue.html'));

    beforeEach(inject(function($injector) {
      $rootScope = $injector.get('$rootScope');
      $compile = $injector.get('$compile');
    }));

    beforeEach(function() {
      $rootScope.property = fixtures.node.properties['jcr:primaryType'];
      element = '<td mb-property-value mb-property="property"></td>';
      element = $compile(element)($rootScope);
      $rootScope.$digest();
    });

    it('should contain a span with the property value', function () {
      expect(element.find('span').html().trim()).toBe(fixtures.node.properties['jcr:primaryType'].value);
    });
  });
});
