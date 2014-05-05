/* global define*/
/* jshint indent:2 */

define([
  'app',
  'services/rich-tree-factory',
  'services/route-parameters-converter'
], function(app) {
  'use strict';

  app.factory('mbTreeCache', ['$q', '$window', '$rootScope', 'mbRichTreeFactory', 'mbRouteParametersConverter', function($q, $window, $rootScope, RichTreeFactory, RouteParametersConverter) {
    var cache = {},
        deferred = $q.defer();

    RouteParametersConverter.getCurrentNode(true).then(function(node) {
      cache.richTree = RichTreeFactory.build(node.getReducedTree()[0], node.getWorkspace().getRepository());
      $rootScope.$emit('browser.loaded');
      deferred.resolve(cache.richTree);
    });

    var getRichTree = function() {
      return deferred.promise;
    };

    $rootScope.$on('$stateChangeSuccess', function(evt, toState, toParams, fromState, fromParams){
      if (toState.name === 'workspace' && fromState.name !== 'workspace') {
        $rootScope.$emit('browser.load');
      } else if(toState.name === fromState.name &&
        (toParams.repository !== fromParams.repository ||
        toParams.workspace !== fromParams.workspace)) {
        $rootScope.$emit('browser.load');
      } else if(toState.name === fromState.name &&
        toState.name === 'workspace' &&
        toParams.repository === fromParams.repository &&
        toParams.workspace === fromParams.workspace &&
        toParams.path !== fromParams.path) {

        getRichTree().then(function(richTree) {
          var target = richTree.getTree().find(toParams.path);
          if (!target.collapsed) {
            RouteParametersConverter.getCurrentNode().then(function(node) {
              richTree.getTree().findParent(toParams.path).then(function(parent) {
                richTree.getTree().remove(node.getPath()).then(function() {
                  richTree.getTree().append(parent.path, node.getRawData());
                });
              });

              $window.requestAnimFrame(function() {
                $('.scrollable-tree').scrollTop(scrollTop);
              });
            }, function(err) {
              //$log.error(err, null, false);
            });
          }
        });
      }
    });

    return {
      getRichTree: getRichTree
    };
  }]);
});
