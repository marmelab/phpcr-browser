/* global define */
/* jshint indent:2 */

define([
  'app',
  'services/tree-factory'
], function(app) {
  'use strict';

  /**
   * The RichTreeFactory is a factory to build RichTree object which are Tree object with some preconfigured hook listeners.
   */
  app.factory('mbRichTreeFactory', ['$q', 'mbTreeFactory', function($q, TreeFactory) {

    /**
     * Decorator for hasChildren attribute
     * @param  {object}  node
     * @param  {boolean}  trust
     */
    var hasChildren = function(node, trust) {
      if (trust && node.hasChildren) {
        return;
      }

      node.hasChildren = node.children.length > 0;
    };

    /**
     * Decorator for draggable attribute
     * @param  {object}  node
     * @param  {Repository}  repository
     */
    var isDraggable = function(node, repository) {
      if (node.path !== '/' &&
          repository.supports('node.move') &&
          repository.supports('node.delete')) {
        node.draggable = true;
      }
    };

    /**
     * Decorator for collapsed attribute
     * @param  {object}  node
     */
    var isCollapsed = function(node) {
      if (node.collapsed) {
        return;
      }

      node.collapsed = !(node.hasChildren && node.children.length > 0);
    };

    /**
     * Decorator for id attribute
     */
    var setId = function(node) {
      node.id = node.path.replace('/','_');
    };

    /**
     * RichTree constructor
     * @param {object} tree
     * @param {Repository} repository
     * @param {array} hooks
     */
    var RichTree = function(tree, repository, hooks) {
      this.repository = repository;
      var self = this;
      hooks = hooks || [];

      var richTreeHooks = {
        decorate: [
          {
            event: TreeFactory.HOOK_DECORATE,

            /**
             * Listener on decorate hook
             * @param  {Function} next
             * @param  {object}   node
             */
            callback: function(next, node) {
              if (!node) {
                return next();
              }

              hasChildren(node, true);
              isCollapsed(node);
              isDraggable(node, self.repository);
              setId(node);
              next();
            }
          }
        ],
        pre: [
          {
            event: TreeFactory.HOOK_PRE_APPEND,

            /**
             * Listener on pre append hook
             * @param  {Function} next
             * @param  {string}   parentPath
             * @param  {object}   childNode
             * @param  {object}   parent
             * @return {Function}
             */
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

            /**
             * Listener on pre remove hook
             * @param  {Function} next
             * @param  {string}   path
             * @param  {object}   parent
             */
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

            /**
             * Listener on pre move hook
             * @param  {Function} next
             * @param  {string}   fromPath
             * @param  {string}   toPath
             * @param  {object}   node
             */
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

            /**
             * Listener on pre refresh hook
             * @param  {Function} next
             * @param  {string}   path
             * @param  {object}   node
             */
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

            /**
             * Listener on post append hook
             * @param  {Function} next
             * @param  {string}   parentPath
             * @param  {object}   childNode
             * @param  {object}   parent
             */
            callback: function(next, parentPath, childNode, parent) {
              if (!parent) {
                return this.find(parentPath).then(function(parent) {
                  delete parent.inProgress;
                  return next();
                });
              }

              hasChildren(parent);
              delete parent.inProgress;
              next();
            }
          },
          {
            event: TreeFactory.HOOK_POST_REMOVE,

            /**
             * Listener on post remove hook
             * @param  {Function} next
             * @param  {string}   path
             * @param  {object}   old
             * @param  {object}   parent
             */
            callback: function(next, path, old, parent) {
              if (!parent) {
                return this.findParent(path).then(function(parent) {
                  delete parent.inProgress;
                  return next();
                });
              }

              hasChildren(parent);
              delete parent.inProgress;
              next();
            }
          },
          {
            event: TreeFactory.HOOK_POST_MOVE,

            /**
             * Listener on post move hook
             * @param  {Function} next
             * @param  {string}   fromPath
             * @param  {string}   toPath
             * @param  {object}   node
             */
            callback: function(next, fromPath, toPath, node) {
              if (!node) {
                return this.find(fromPath).then(function(node) {
                  delete node.inProgress;
                  return next();
                });
              }
              var self = this;
              this.find(toPath).then(function(parent) {
                hasChildren(parent);
                delete node.inProgress;

                self.findParent(fromPath).then(function(parent) {
                  hasChildren(parent);
                  delete node.inProgress;
                  next();
                });
              });
            }
          },
          {
            event: TreeFactory.HOOK_POST_REFRESH,

            /**
             * Listener on post refresh hook
             * @param  {Function} next
             * @param  {string}   path
             * @param  {object}   node
             */
            callback: function(next, path, node) {
              if (!node) {
                return this.find(path).then(function(node) {
                  delete node.inProgress;
                  return next();
                });
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

    /**
     * Get the Tree of the RichTree
     * @return {Tree}
     */
    RichTree.prototype.getTree = function() {
      return this.tree;
    };

    /**
     * Get the raw tree of the Tree in the RichTree
     * @return {[type]}
     */
    RichTree.prototype.getRawTree = function() {
      return this.tree.getRawTree();
    };

    return {

      /**
       * Build a RichTree object
       * @param  {object} tree
       * @param  {Repository} repository
       * @param  {array} hooks
       * @return {RichTree}
       */
      build: function(tree, repository, hooks) {
        return new RichTree(tree, repository, hooks);
      },

      /**
       * Test raw data validity
       * @param  {object} data
       * @return {boolean}
       */
      accept: function(data) {
        return TreeFactory.accept(data);
      }
    };
  }]);
});
