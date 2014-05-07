/* global define */
/* jshint indent:2 */

define([
  'app',
  'services/rich-tree-factory',
  'services/tree-factory',
  'services/route-parameters-converter'
], function(app) {
  'use strict';

  app.factory('mbTreeCache', ['$q', '$rootScope', 'mbRichTreeFactory', 'mbTreeFactory', 'mbNodeFactory', 'mbRouteParametersConverter', 'mbObjectMapper',
    function($q, $rootScope, RichTreeFactory, TreeFactory, NodeFactory, RouteParametersConverter, ObjectMapper) {
    var cache = {},
        deferred,
        repository,
        workspace;

    var hooks = [
      {
        event: TreeFactory.HOOK_PRE_REFRESH,
        callback: function(next, path, node) {
          if (!node.collapsed) {
            return next();
          }

          ObjectMapper.find(repository.getName() + '/' + workspace.getName() + path, { cache: false }).then(function(_node) {
            node.children = _node.getRawData().children;
            next();
          }, next);
        }
      },
      {
        event: TreeFactory.HOOK_PRE_MOVE,
        callback: function(next, fromPath, toPath) {
          ObjectMapper.find('/' + repository.getName() + '/' + workspace.getName() + fromPath).then(function(nodeDropped) {
            nodeDropped.move(toPath).then(function() {
              next();
            }, next);
          }, next);
        }
      },
      {
        event: TreeFactory.HOOK_PRE_APPEND,
        callback: function(next, parentPath, childNode) {
          NodeFactory.build(childNode, workspace).create().then(function() {
            next();
          }, next);
        }
      },
      {
        event: TreeFactory.HOOK_PRE_REMOVE,
        callback: function(next, path) {
          ObjectMapper.find('/' + repository.getName() + '/' + workspace.getName() + path).then(function(node) {
            node.delete().then(function() {
              next();
            }, next);
          }, next);
        }
      }
    ];

    var buildRichTree = function() {
      // rich tree is not built, retrieve the current node with its reduced tree
      return RouteParametersConverter.getCurrentNode({ reducedTree: true, cache: false }).then(function(node) {
        repository = node.getWorkspace().getRepository();
        workspace = node.getWorkspace();
        return node;
      }).then(function(node) {
        // build the rich tree
        return RichTreeFactory.build(
          node.getReducedTree()[0],
          repository,
          hooks
        );
      }).then(function(richTree) {
        // save the bulit rich tree
        cache.richTree = richTree;
        return cache.richTree;
      }, function(err) {
        return $q.reject(err);
      });
    };

    var getRichTree = function(forceRebuild) {
      if (cache.richTree && !forceRebuild) {
        // the rich tree is already build, we return it in a resolved promise
        return $q.when(cache.richTree);
      }

      return buildRichTree();
    };

    $rootScope.$on('workspace.open.start', function() {
      deferred = $q.defer();
      delete cache.richTree; // invalidate cache
    });

    return {
      getRichTree: getRichTree
    };
  }]);
});
