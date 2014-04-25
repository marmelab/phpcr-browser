/* global require */
/* jshint indent:2 */

(function() {
  'use strict';

  var vendor = function(relPath, uncompressed) {
    return '/bower_components/' + relPath + (!uncompressed ? '.min' : '');
  };

  require.config({
    baseUrl: '/assets/js/browser',
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
      angularXEditable:   vendor('angular-xeditable/dist/js/xeditable')
    },
    shim: {
      angular : {'exports' : 'angular', 'deps': ['jquery']},
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
  });

  //http://code.angularjs.org/1.2.1/docs/guide/bootstrap#overview_deferred-bootstrap
  window.name = 'NG_DEFER_BOOTSTRAP!';

  require([
    'angular',
    'app',
    'init'
  ], function (angular, app) {
    angular.element().ready(function () {
      angular.resumeBootstrap([app.name]);
    });
  });
})();
