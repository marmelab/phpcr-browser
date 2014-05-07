/*global define,describe,it,beforeEach,module,inject,expect*/
/* jshint indent:2 */

define([
  'angular',
  'angularMocks',
  'app',
  'directives/ui/overlay'
], function () {
  'use strict';

  describe('Directive: Overlay', function () {
    var element,
        text = 'Awesome text',
        hideOn = 'hideMeEvent',
        showOn = 'showOnEvent',
        $rootScope,
        $compile;

    // load the directive's module
    beforeEach(module('browserApp'));

    beforeEach(inject(function($injector) {
      $rootScope = $injector.get('$rootScope');
      $compile = $injector.get('$compile');
    }));

    beforeEach(function() {
      element = '<mb-overlay text="' + text + '" hide-on="' + hideOn + '" show-on="' + showOn + '"></mb-overlay>';
      element = $compile(element)($rootScope);
      $rootScope.$digest();
    });

    it('should contain a div with overlay class and the text inside it', function () {
      expect(element.find('div').hasClass('overlay')).toBe(true);
      expect(element.find('div').html()).toBe(text);
    });

    it('should be hide when hideOn event is broadcasted', function () {
      $rootScope.$broadcast(hideOn);
      expect(element.css('display')).toBe('none');
    });

    it('should be show when showOn event is broadcasted', function () {
      $rootScope.$broadcast(hideOn);
      expect(element.css('display')).toBe('none');
      $rootScope.$broadcast(showOn);
      expect(element.css('display')).not.toBe('none');
    });
  });
});
