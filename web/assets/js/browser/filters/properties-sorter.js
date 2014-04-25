/* global define */
/* jshint indent:2 */

define([
  'app'
], function(app) {
  'use strict';

  app.filter('mbPropertiesSorter', function() {

    return function(inputs) {
      if (inputs) {
        var alphabeticalSorter = function(a, b) {
          if (a.name < b.name) {
            return -1;
          } else {
            return 1;
          }
        };

        var jcr = inputs.filter(function(a) {
          return a.name.match('(.+):(.+)');
        }).sort(alphabeticalSorter);

        var others = inputs.filter(function(a) {
          return !a.name.match('(.+):(.+)');
        }).sort(alphabeticalSorter);

        inputs = others.concat(jcr);
      }

      return inputs;
    };
  });
});
