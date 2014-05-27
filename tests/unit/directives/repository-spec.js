/*global define,describe,it,beforeEach,module,inject,expect,jasmine*/
/* jshint indent:2 */

define([
  'mocks',
  'angular',
  'angularMocks',
  'app',
  'directives/ui/repository',
  'directives/templates/repository'
], function (mocks) {
  'use strict';

  describe('Directive: Repository', function () {
    var element,
        $rootScope,
        $compile;

    // load the directive's module
    beforeEach(module('browserApp'));

    // load the directive's template
    beforeEach(module('/assets/js/browser/directives/templates/repository.html'));

    beforeEach(inject(function($injector) {
      $rootScope = $injector.get('$rootScope');
      $compile = $injector.get('$compile');
    }));

    beforeEach(function() {
      $rootScope.repository = mocks.getRepositoryMock();
      $rootScope.openRepository = jasmine.createSpy('openRepository');
      element = '<mb-repository entity="repository" open="openRepository"></mb-repository>';
      element = $compile(element)($rootScope);
      $rootScope.$digest();
    });

    it('should be replaced by the good template', function () {
      expect(element[0].tagName).toBe('DIV');
      expect(element.hasClass('col-sm-3')).toBe(true);

      // div.panel.panel-repository
      expect(element.find('div').hasClass('panel')).toBe(true);
      expect(element.find('div').hasClass('panel-box')).toBe(true);
      expect(element.find('div').attr('ng-click')).not.toBeUndefined();

      // div.panel-heading
      expect(element.find('div').find('div').hasClass('panel-heading')).toBe(true);
      expect(element.find('div').find('div').html().trim()).toBe('Repository');

      // div.panel-body.text-center
      expect(element.find('div').find('div').eq(1).hasClass('panel-body')).toBe(true);
      expect(element.find('div').find('div').eq(1).hasClass('text-center')).toBe(true);

      // p.lead
      expect(element.find('div').find('div').eq(1).find('p').hasClass('lead')).toBe(true);
      expect(element.find('div').find('div').eq(1).find('p').html().trim()).toBe($rootScope.repository.getName());

      // p
      expect(element.find('div').find('div').eq(1).find('p').eq(1).html().trim()).toBe($rootScope.repository.getFactoryName());
    });

    it('should call openRepository on click', function() {
      element.find('div').click();
      expect($rootScope.openRepository).toHaveBeenCalled();
    });
  });
});
