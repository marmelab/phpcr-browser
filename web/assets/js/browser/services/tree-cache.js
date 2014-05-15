/* global define */
/* jshint indent:2 */

define([
  'app',
  'services/rich-tree-factory',
  'services/tree-factory',
  'services/route-parameters-converter'
], function(app) {
  'use strict';

  /**
   * The TreeCache aims to stored a shared RichTree during a session to avoid to always rebuild it.
   */
  app.factory('mbTreeCache', ['$q', '$rootScope', 'mbRichTreeFactory', 'mbTreeFactory', 'mbNodeFactory', 'mbRouteParametersConverter', 'mbObjectMapper',
    function($q, $rootScope, RichTreeFactory, TreeFactory, NodeFactory, RouteParametersConverter, ObjectMapper) {
    var cache = {},
        repository,
        workspace;

    var hooks = [
      {
        event: TreeFactory.HOOK_PRE_REFRESH,

        /**
         * Listener on pre refresh hook to perform the refresh over the REST API
         * @param  {Function} next
         * @param  {string}   path
         * @param  {object}   node
         */
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

        /**
         * Listener on pre move hook to perform the move over the REST API
         * @param  {Function} next
         * @param  {string}   fromPath
         * @param  {string}   toPath
         */
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

        /**
         * Listener on pre append hook to perform the append over the REST API
         * @param  {Function} next
         * @param  {string}   parentPath
         * @param  {object}   childNode
         */
        callback: function(next, parentPath, childNode) {
          NodeFactory.build(childNode, workspace).create().then(function() {
            next();
          }, next);
        }
      },
      {
        event: TreeFactory.HOOK_PRE_REMOVE,

        /**
         * Listener on pre remove hook to perform the remove over the REST API
         * @param  {Function} next
         * @param  {string}   path
         * @return {Function}
         */
        callback: function(next, path) {
          ObjectMapper.find('/' + repository.getName() + '/' + workspace.getName() + path).then(function(node) {
            node.delete().then(function() {
              next();
            }, next);
          }, next);
        }
      }
    ];

    /**
     * Build a RichTree object based on the current node and cache it
     * @return {promise}
     */
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
        // save the built rich tree
        cache.richTree = richTree;
        return cache.richTree;
      }, function(err) {
        return $q.reject(err);
      });
    };

    /**
     * Invalidate the RichTree in cache to force rebuild
     */
    var invalidateRichTreeCache = function() {
      delete cache.richTree;
    };

    /**
     * Get the RichTree stored in the cache
     * @return {promise}
     */
    var getRichTree = function() {
      if (cache.richTree) {
        // the rich tree is already build, we return it in a resolved promise
        return $q.when(cache.richTree);
      }

      return buildRichTree();
    };

    /**
     * Listener on route change to invalidate the RichTree cache if needed
     */
    $rootScope.$on('workspace.open.start', invalidateRichTreeCache);

    return {
      getRichTree: getRichTree,
      invalidateRichTreeCache: invalidateRichTreeCache
    };
  }]);
});
