/*global define,describe,it,beforeEach,module,inject,expect*/
/* jshint indent:2 */

define([
  'mocks',
  'angular',
  'angularMocks',
  'app',
  'directives/tree',
  'directives/templates/tree',
  'directives/templates/treeNode'
], function (mocks) {
  'use strict';

  describe('Directive: Tree', function () {
    var element,
        $rootScope,
        $compile;

    // load the directive's module
    beforeEach(module('browserApp'));

    // load the directive's template
    beforeEach(module('/assets/js/browser/directives/templates/tree.html'));
    beforeEach(module('/assets/js/browser/directives/templates/treeNode.html'));

    beforeEach(inject(function($injector) {
      $rootScope = $injector.get('$rootScope');
      $compile = $injector.get('$compile');
    }));

    beforeEach(function() {
      $rootScope.repository = mocks.getRepositoryMock();
      $rootScope.workspace = mocks.getWorkspaceMock();
      $rootScope.richTree = mocks.getRichTreeMock();
      $rootScope.currentNode = $rootScope.richTree.getRawTree()['/'];
      element = '<mb-tree mb-current-node="currentNode" mb-rich-tree="richTree" mb-repository="repository" mb-workspace="workspace"></mb-tree>';
      element = $compile(element)($rootScope);
      $rootScope.$digest();
    });

    it('should contain the good template', function () {
      expect(element.find('ul').hasClass('tree')).toBe(true);
      expect(element.find('ul')[0].id).toBe('tree');
      expect(element.find('ul').find('li').find('div').hasClass('node')).toBe(true);

      expect(element.find('ul').find('li').find('div').find('span').hasClass('glyphicon')).toBe(true);
      expect(element.find('ul').find('li').find('div').find('span').hasClass('glyphicon-folder-open')).toBe(true);

      expect(element.find('ul').find('li').find('div').find('span').eq(2).hasClass('glyphicon')).toBe(true);
      expect(element.find('ul').find('li').find('div').find('span').eq(2).hasClass('glyphicon-plus')).toBe(true);
      expect(element.find('ul').find('li').find('div').find('span').eq(2).hasClass('node-add')).toBe(true);

      expect(element.find('ul').find('li').find('div').find('a').hasClass('node')).toBe(true);
      expect(element.find('ul').find('li').find('div').find('a').html().trim()).toBe('root');

      expect(element.find('ul').find('li').find('ul').hasClass('tree')).toBe(true);
      expect(element.find('ul').find('li').find('ul').find('li').find('div').find('span').hasClass('glyphicon')).toBe(true);
      expect(element.find('ul').find('li').find('ul').find('li').find('div').find('span').hasClass('glyphicon-file')).toBe(true);
      expect(element.find('ul').find('li').find('ul').find('li').find('div').find('a').html().trim()).toBe('child');
    });
  });
});
