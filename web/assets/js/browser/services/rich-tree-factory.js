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
      if (node.collapsed) {
        return;
      }

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

      var richTreeHooks = {
        decorate: [
          {
            event: TreeFactory.HOOK_DECORATE,
            callback: function(next, node) {
              if (!node) {
                return next();
              }

              hasChildren(node, true);
              isCollapsed(node);
              isDraggable(node, self.repository);
              next();
            }
          }
        ],
        pre: [
          {
            event: TreeFactory.HOOK_PRE_APPEND,
            callback: function(next, parentPath, childNode, parent) {
              if (!parent) {
                return next();
              }

              parent.inProgress = true;
              next();
            }
          },
          {
            event: TreeFactory.HOOK_PRE_REMOVE,
            callback: function(next, path, parent) {
              if (!parent) {
                return next();
              }

              parent.inProgress = true;
              next();
            }
          },
          {
            event: TreeFactory.HOOK_PRE_MOVE,
            callback: function(next, fromPath, toPath, node) {
              if (!node) {
                return next();
              }

              node.inProgress = true;
              next();
            }
          },
          {
            event: TreeFactory.HOOK_PRE_REFRESH,
            callback: function(next, path, node) {
              if (!node) {
                return next();
              }

              node.inProgress = true;
              next();
            }
          }
        ],
        post: [
          {
            event: TreeFactory.HOOK_POST_APPEND,
            callback: function(next, parentPath, childNode, parent) {
              if (!parent) {
                return next();
              }

              hasChildren(parent);
              delete parent.inProgress;
              next();
            }
          },
          {
            event: TreeFactory.HOOK_POST_REMOVE,
            callback: function(next, path, old, parent) {
              if (!parent) {
                return next();
              }

              hasChildren(parent);
              delete parent.inProgress;
              next();
            }
          },
          {
            event: TreeFactory.HOOK_POST_MOVE,
            callback: function(next, fromPath, toPath, node) {
              if (!node) {
                return next();
              }

              this.findParent(node.path).then(function(parent) {
                hasChildren(parent);
                delete node.inProgress;
                next();
              });
            }
          },
          {
            event: TreeFactory.HOOK_POST_REFRESH,
            callback: function(next, path, node) {
              if (!node) {
                return next();
              }

              hasChildren(node, true);
              delete node.inProgress;
              next();
            }
          }
        ]
      };

      hooks = richTreeHooks.decorate
                .concat(richTreeHooks.pre)
                .concat(hooks)
                .concat(richTreeHooks.post);

      return TreeFactory.build(tree, hooks).then(function(tree) {
        self.tree = tree;
        return self;
      });
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
