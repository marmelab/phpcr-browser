/* global define,$*/
/* jshint indent:2 */

define([
  'app',
  'services/rich-tree-factory',
  'services/tree-factory',
  'services/route-parameters-converter'
], function(app) {
  'use strict';

  app.factory('mbTreeCache', ['$q', 'mbRichTreeFactory', 'mbTreeFactory', 'mbRouteParametersConverter', 'mbObjectMapper',
    function($q, RichTreeFactory, TreeFactory, RouteParametersConverter, ObjectMapper) {
    var cache = {},
        deferred = $q.defer(),
        repository,
        workspace;

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
        deferred.resolve(cache.richTree);
      });
    });

    var getRichTree = function() {
      return deferred.promise;
    };


    return {
      getRichTree: getRichTree
    };
  }]);
});
