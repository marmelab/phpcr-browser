/* global define */
/* jshint indent:2 */

define([
  'app'
], function(app) {
  'use strict';
  // from http://stackoverflow.com/a/18609594
  app.factory('mbRecursionHelper', ['$compile', function($compile){

    var RecursionHelper = {
      compile: function(element) {
        var contents = element.contents().remove();
        var compiledContents;
        return function(scope, element) {
          if (!compiledContents) {
            compiledContents = $compile(contents);
          }
          compiledContents(scope, function(clone){
            element.append(clone);
          });
        };
      }
    };

    return RecursionHelper;
  }]);
});
