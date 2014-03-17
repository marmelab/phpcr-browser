(function(app) {
  'use strict';

  app.factory('mbJsonPatch', ['$document', '$q', '$rootScope', function ($document, $q, $rootScope) {
    var defered = $q.defer();
    var onScriptLoad = function() {
      // Load client in the browser
      $rootScope.$apply(function() { defered.resolve(window.jsonpatch); });
    };
    var scriptTag = $document[0].createElement('script');
    scriptTag.type = 'text/javascript';
    scriptTag.async = true;
    scriptTag.src = '/bower_components/jsonpatch/jsonpatch.min.js';
    scriptTag.onreadystatechange = function () {
      if (this.readyState === 'complete') { onScriptLoad(); }
    };
    scriptTag.onload = onScriptLoad;

    var s = $document[0].getElementsByTagName('body')[0];
    s.appendChild(scriptTag);
    return defered.promise;
  }]);
})(angular.module('browserApp'));