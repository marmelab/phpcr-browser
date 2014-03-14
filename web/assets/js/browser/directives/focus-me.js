(function(app) {
  'use strict';
  // From https://gist.github.com/travisjeffery/2588075
  app.directive('mbFocusMe', function(){
    return function(scope, element){
      element[0].focus();
    };
  });
})(angular.module('browserApp'));