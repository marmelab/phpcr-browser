/* global define */
/* jshint indent:2 */

define([
  'app',
  'services/tree-factory'
], function(app) {
  'use strict';

  app.factory('mbRichTreeFactory', ['$q', 'mbTreeFactory', function($q, TreeFactory) {
    var hasChildren = function(node, trust) {
      if (trust && node.hasChildren) {
        return;
      }

      node.hasChildren = node.children.length > 0;
    };

    var isDraggable = function(node, repository) {
      if (node.path !== '/' &&
          repository.supports('node.move') &&
          repository.supports('node.delete')) {
        node.draggable = true;
      }
    };

    var isCollapsed = function(node) {
      if (node.hasChildren && node.children.length > 0) {
        node.collapsed = false;
      } else {
        node.collapsed = true;
      }
    };

    var RichTree = function(tree, repository, hooks) {
      this.repository = repository;
      var self = this;
      hooks = hooks || [];

      this.tree = TreeFactory.build(tree, [
        {
          event: TreeFactory.HOOK_DECORATE,
          callback: function(node) {
            hasChildren(node, true);
            isCollapsed(node);
            isDraggable(node, self.repository);
          }
        },
        {
          event: TreeFactory.HOOK_POST_APPEND,
          callback: function(parentPath, childNode, parent) {
            hasChildren(parent);
            delete parent.inProgress;
          }
        },
        {
          event: TreeFactory.HOOK_POST_REMOVE,
          callback: function(path, old, parent) {
            hasChildren(parent);
            delete parent.inProgress;
          }
        },
        {
          event: TreeFactory.HOOK_POST_MOVE,
          callback: function(fromPath, toPath, node) {
            this.findParent(node.path).then(function(parent) {
              hasChildren(parent);
            });
            delete node.inProgress;
          }
        },
        {
          event: TreeFactory.HOOK_PRE_APPEND,
          callback: function(parentPath, childNode, parent) {
            parent.inProgress = true;
          }
        },
        {
          event: TreeFactory.HOOK_PRE_REMOVE,
          callback: function(path, parent) {
            parent.inProgress = true;
          }
        },
        {
          event: TreeFactory.HOOK_PRE_MOVE,
          callback: function(fromPath, toPath, node) {
            node.inProgress = true;
          }
        }
      ].concat(hooks));
    };

    RichTree.prototype.getTree = function() {
      return this.tree;
    };

    return {
      build: function(tree, repository, hooks) {
        return new RichTree(tree, repository, hooks);
      },
      accept: function(data) {
        return TreeFactory.accept(data);
      }
    };
  }]);
});
