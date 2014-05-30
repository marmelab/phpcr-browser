/* global define */
/* jshint indent:2 */

define([
  'app',
  'services/rich-tree-factory',
  'services/tree-factory',
], function(app) {
  'use strict';

  /**
   * The TreeCache aims to stored a shared RichTree during a session to avoid to always rebuild it.
   */
  app.factory('mbTreeCache', ['$q', '$rootScope', 'mbRichTreeFactory', 'mbTreeFactory', 'mbNodeFactory', 'mbObjectMapper',
    function($q, $rootScope, RichTreeFactory, TreeFactory, NodeFactory, ObjectMapper) {
    var repository,
        workspace,
        deferred,
        currentRootNode;

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
    var buildRichTree = function(rootNode) {
      currentRootNode = rootNode;
      deferred = $q.defer();
      // rich tree is not built, retrieve the current node with its reduced tree
      repository = rootNode.getWorkspace().getRepository();
      workspace = rootNode.getWorkspace();
        // build the rich tree
      return RichTreeFactory.build(
        rootNode.getReducedTree()[0],
        repository,
        hooks
      ).then(function(richTree) {
        // save the built rich tree
        deferred.resolve(richTree);
      }, function(err) {
        deferred.reject(err);
      });
    };

    /**
     * Get the RichTree stored in the cache
     * @return {promise}
     */
    var getRichTree = function() {
      return deferred.promise;
    };

    /**
     * Get the current rootNode used to build the richTree
     * @return {Node}
     */
    var getCurrentRootNode = function() {
      return currentRootNode;
    };

    return {
      buildRichTree: buildRichTree,
      getRichTree: getRichTree,
      getCurrentRootNode: getCurrentRootNode
    };
  }]);
});
