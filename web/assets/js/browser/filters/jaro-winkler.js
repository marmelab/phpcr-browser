/* global define */
/* jshint indent:2 */

define([
  'app',
  'angular'
], function(app, angular) {
  'use strict';

  app.filter('mbJaroWinkler', function() {

    return function(inputs, term) {
      var results = [], name, s1, s2, matchMaxDistance, matchesCount, transpositionCount, p, l, boostThreshold, dj, dw;
      if (!term || term.trim().length === 0) { return inputs; }
      angular.forEach(inputs, function(input) {

        if (!term) {
          results.push({value: input, score: 1});
        } else {
          name = input.name ? input.name : input.getName();
          s1 = term.toLowerCase().match(/.{1,1}/g);
          if (!s1) { s1 = []; }
          s2 = name.toLowerCase().match(/.{1,1}/g);

          matchMaxDistance = Math.floor(Math.max(name.length, term.length)/2) - 1;
          matchesCount = 0;
          transpositionCount = 0;
          p = 0.1;
          l = 0; // the length of common prefix at the start of the string up to a maximum of 4 characters
          boostThreshold = 0.7;

          for (var k=0; k<Math.min(4, Math.min(s1.length, s2.length)); k++) {
            if (s1[k] === s2[k]) { l++; }
          }

          for (var i=0; i<s1.length; i++) {
            for (var j=i; j<s2.length; j++) {
              if (s1[i] === s2[j]) {
                if (i === j) {
                  matchesCount++;
                } else if(Math.abs(i-j) <= matchMaxDistance) {
                  matchesCount++;
                  transpositionCount++;
                }
              }
            }
          }

          dj = (matchesCount > 0) ? (1/3)*(matchesCount/name.length + matchesCount/term.length + (matchesCount-transpositionCount/2)/matchesCount) : 0;
          dw = (dj >= boostThreshold) ? dj + (l*p*(1-dj)) : dj;

          results.push({value: input, score: dw});
        }
      });

      results = results.filter(function(result) {
        return result.score > 0.1;
      }).sort(function(a, b){
        return b.score - a.score;
      });

      var obj = [];
      angular.forEach(results, function(result){
        result.value.score = result.score;
        obj.push(result.value);
      });
      return obj;
    };
  });
});
