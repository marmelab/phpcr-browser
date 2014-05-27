/* global define */
/* jshint indent:2 */

define([
  'angular',
  'angularUIRouter',
  'angularUIKeypress',
  'restangular',
  'talker',
  'angularJSToaster',
  'angularXEditable',
  'angularTranslate'
], function(angular) {
  'use strict';

  return angular.module('browserApp', [
    'ui.router',
    'ui.keypress',
    'restangular',
    'talker',
    'toaster',
    'xeditable',
    'pascalprecht.translate'
  ]);
});
