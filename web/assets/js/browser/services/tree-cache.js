/* global define,$*/
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
        workspace,
        scrollTop;

    var hooks = [
      {
        event: TreeFactory.HOOK_PRE_REFRESH,
        callback: function(next, path, node) {
          if (!node.collapsed) {
            return next();
          }

          ObjectMapper.find(repository.getName() + '/' + workspace.getName() + path).then(function(_node) {
            node.children = _node.getRawData().children;
            next();
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

    var toggleNode = function(path) {
      return getRichTree().then(function(richTree) {
        return richTree.getTree().find(path).then(function(node) {
          return richTree.getTree().refresh(path, { collapsed: !node.collapsed} ).then(function(node) {
            return node;
          });
        });
      });
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
        toggleNode(toParams.path).then(function() {
          $('.scrollable-tree').scrollTop(scrollTop);
        });
      }
    });

    $rootScope.$on('$stateChangeStart', function(evt, toState, toParams, fromState, fromParams){
      if(toState.name === fromState.name &&
        toState.name === 'workspace' &&
        toParams.repository === fromParams.repository &&
        toParams.workspace === fromParams.workspace &&
        toParams.path !== fromParams.path) {
        scrollTop = $('.scrollable-tree').scrollTop();
      }
    });

    return {
      getRichTree: getRichTree,
      toggleNode: toggleNode
    };
  }]);
});
