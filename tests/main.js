/* global requirejs */
/* jshint indent:2 */

(function() {
  'use strict';

  // // we get all the test files automatically
  var deps = ['domReady', 'jquery', 'bootstrap', 'angular', 'app', 'init'];
  for (var file in window.__karma__.files) {
    if (window.__karma__.files.hasOwnProperty(file)) {
      if (/^\/base\/tests\/(.*)spec\.js$/i.test(file)) {
        deps.push(file);
      }
    }
  }

  var vendor = function(relPath, uncompressed) {
    return '/base/web/bower_components/' + relPath + (!uncompressed ? '.min' : '');
  };

  requirejs({
    baseUrl: '/base/web/assets/js/browser/',
    paths: {
      // Vendors
      angular:            vendor('angular/angular'),
      jquery:             vendor('jquery/dist/jquery'),
      bootstrap:          vendor('bootstrap/dist/js/bootstrap'),
      angularRoute:       vendor('angular-route/angular-route'),
      angularAnimate:     vendor('angular-animate/angular-animate'),
      angularJSToaster:   vendor('AngularJS-Toaster/toaster', true),
      angularUIRouter:    vendor('angular-ui-router/release/angular-ui-router'),
      angularUIKeypress:  vendor('angular-ui-utils/keypress'),
      lodash:             vendor('lodash/dist/lodash'),
      restangular:        vendor('restangular/dist/restangular'),
      talker:             vendor('talker/talker-0.1.0'),
      angularXEditable:   vendor('angular-xeditable/dist/js/xeditable'),
      jsonpatch:          vendor('jsonpatch/jsonpatch'),
      angularMocks:       vendor('angular-mocks/angular-mocks', true),
      domReady:           vendor('requirejs-domready/domReady', true),
      mixins:             '/base/tests/mixins',
      fixtures:           '/base/tests/fixtures',
      mocks:              '/base/tests/mocks'
    },
    shim: {
      angular : {'exports' : 'angular', 'deps': ['jquery']},
      bootstrap: ['jquery'],
      angularMocks: ['angular'],
      angularAnimate: ['angular'],
      angularRoute: ['angular'],
      angularJSToaster: ['angular', 'angularAnimate'],
      angularUIRouter: ['angular'],
      angularUIKeypress: ['angular'],
      restangular: ['angular', 'lodash'],
      talker: ['angular'],
      angularXEditable: ['angular']
    },
    priority: [
      'angular'
    ]
  }, deps, function (domReady) {
    domReady(function () {
      window.__karma__.start();
    });
  });
})();
