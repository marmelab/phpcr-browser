/*global define,describe,it,beforeEach,module,inject,expect*/
/* jshint indent:2 */

define([
  'angular',
  'angularMocks',
  'app',
  'directives/navbar-item',
  'directives/templates/navbarItem'
], function () {
  'use strict';

  describe('Directive: NavbarItem', function () {
    var element,
        $rootScope,
        $compile;

    // load the directive's module
    beforeEach(module('browserApp'));

    // load the directive's template
    beforeEach(module('/assets/js/browser/directives/templates/navbarItem.html'));

    beforeEach(inject(function($injector) {
      $rootScope = $injector.get('$rootScope');
      $compile = $injector.get('$compile');
    }));

    beforeEach(function() {
      $rootScope.link = {
        label: 'AwesomeLink',
        href: '/awesome-link',
        sublinks: [
          {
            label: 'SubLink',
            href: '/sublink',
            class: 'active'
          }
        ]
      };

      element = '<li mb-navbar-item mb-link="link"></li>';
      element = $compile(element)($rootScope);
      $rootScope.$digest();
    });

    it('should contain the good template', function () {
      expect(element.find('a').hasClass('dropdown-toggle')).toBe(true);
      expect(element.find('a').attr('data-toggle')).toBe('dropdown');
      expect(element.find('a').html().trim()).toBe($rootScope.link.label);
      expect(element.find('ul').hasClass('dropdown-menu')).toBe(true);
      expect(element.find('ul').hasClass('large')).toBe(true);
      expect(element.find('ul').find('li').hasClass('active')).toBe(true);
      expect(element.find('ul').find('li').find('a').attr('href')).toBe('#' + $rootScope.link.sublinks[0].href);
      expect(element.find('ul').find('li').find('a').html().trim()).toBe($rootScope.link.sublinks[0].label);
    });
  });
});
