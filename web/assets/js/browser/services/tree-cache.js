/* global define*/
/* jshint indent:2 */

define([
  'app',
  'services/rich-tree-factory',
  'services/tree-factory',
  'services/route-parameters-converter'
], function(app) {
  'use strict';

  app.factory('mbTreeCache', ['$q', '$window', '$rootScope', 'mbRichTreeFactory', 'mbTreeFactory', 'mbRouteParametersConverter', 'mbObjectMapper',
    function($q, $window, $rootScope, RichTreeFactory, TreeFactory, RouteParametersConverter, ObjectMapper) {
    var cache = {},
        deferred = $q.defer(),
        repository,
        workspace;
    var hooks = [
      {
        event: TreeFactory.HOOK_PRE_REFRESH,
        callback: function(next, path, node) {
          ObjectMapper.find(repository.getName() + '/' + workspace.getName() + path).then(function(_node) {
            _node.getChildren().then(function(children) {
              node.children = children;
              next();
            });
          });
        }
      }
    ];

    RouteParametersConverter.getCurrentNode(true).then(function(node) {
      repository = node.getWorkspace().getRepository();
      workspace = node.getWorkspace();
      RichTreeFactory.build(
        node.getReducedTree()[0],
        repository,
        hooks
      ).then(function(richTree) {
        cache.richTree = richTree;
        $rootScope.$emit('browser.loaded');
        deferred.resolve(cache.richTree);
      });
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
            richTree.getTree().refresh(toParams.path, { collapsed: true} ).then(function() {

            });
              //});

              // $window.requestAnimFrame(function() {
              //   $('.scrollable-tree').scrollTop(scrollTop);
              // });
          }
        });
      }
    });

    return {
      getRichTree: getRichTree
    };
  }]);
});
