/* global define */
/* jshint indent:2 */

define([
  'angular',
  'angularRoute',
  'angularCookies',
  'angularUIRouter',
  'angularUIKeypress',
  'restangular',
  'talker',
  'angularJSToaster',
  'angularXEditable',
  'angularTranslate',
  'angularTranslateStorageCookie'
], function(angular) {
  'use strict';

  return angular.module('browserApp', [
    'ui.router',
    'ui.keypress',
    'restangular',
    'talker',
    'toaster',
    'xeditable',
    'ngCookies',
    'pascalprecht.translate'
  ]);
});
