/*global define*/
/* jshint indent:2 */

define([
  'app',
  'angular'
], function(app, angular) {
  'use strict';

  /**
   * TreeFactory is a factory to build Tree which expose append/move/delete/refresh features.
   */
  app.factory('mbTreeFactory', ['$q', function($q) {

    /**
     * Decorate a tree and call all listeners for decorate hook
     * @param  {object} tree
     * @return {promise}
     */
    var decorate = function (tree){
      var deferred = $q.defer(), self = this;

      /**
       * Decorate all children of a node
       * @param  {object} tree
       * @return {promise}
       */
      var decorateTree = function(tree) {
        var deferred = $q.defer(), cursor = 0;

        // this function is give to each node decorator and execute the next one if no error is triggered
        var next = function(err) {
          // the current listener returned an error, reject the promise and stop the hook listeners chain
          if (err) {
            return deferred.reject(err);
          }

          // all is good to continue we increment the cursor to retrieve the next child
          cursor ++;
          if (tree.children.length > cursor) {
            return decorateNode.apply(self, [next, tree.children[cursor], tree]);
          }
          // we reach the end of the children, resolve the promise
          deferred.resolve(tree);
        };

        // call the decorator on the first child of the tree
        if (tree.children.length > cursor) {
          decorateNode.apply(self, [next, tree.children[cursor], tree]);
        } else {
          deferred.resolve(tree);
        }

        return deferred.promise;
      };

      /**
       * Decorate a node
       * @param  {Function} next
       * @param  {object}   node
       * @param  {object}   parent
       * @return {promise}
       */
      var decorateNode = function(next, node, parent) {
        if (parent && parent.path === '/') {
          node.path = parent.path + node.name;
        } else if (parent) {
          node.path = parent.path + '/' + node.name;
        }

        // if node has children, it is sub tree and we decorate it
        return decorateTree(node).then(function(node) {
          // the children are decorated
          // call all decorate hook listeners
          self._hook(Tree.HOOK_DECORATE, false, node).then(function() {
            // no error occured, we go to the next node
            next();
          }, next);
        });
      };

      // decorate the node given as argument
      decorateNode(function(err) {
        if (err) {
          return deferred.reject(err);
        }
        deferred.resolve(tree);
      }, tree);
      return deferred.promise;
    };

    /**
     * Compact an array by removing all undefined lines
     * @param  {array} array
     * @return {array}
     */
    var compact = function(array) {
      var compacted = [];
      array.map(function(value) {
        if (value !== undefined) {
          compacted.push(value);
        }
      });
      return compacted;
    };

    /**
     * Get the parent path of a node
     * @param  {string} path
     * @return {string}
     */
    var parentPath = function(path) {
      var parent = path.split('/');
      parent.pop();
      return parent.join('/');
    };

    /**
     * Update the path of nodes recursively
     * @param  {string} parentPath
     * @param  {object} node
     */
    var updatePath = function(parentPath, node) {
      if (parentPath !== '/') {
        node.path = parentPath + '/' + node.name;
      } else {
        node.path = parentPath + node.name;
      }

      if (node.children.length > 0) {
        for (var i in node.children) {
          if (node.children.hasOwnProperty(i)) {
            updatePath(node.path, node.children[i]);
          }
        }
      }
    };

    /**
     * Tree constructor
     * @param {object} tree
     * @param {array} hooks
     * @return {promise}
     */
    var Tree = function(tree, hooks) {
      var self = this;
      this.hooks = {};

      if (hooks) {
        for (var i in hooks) {
          this.registerHook(hooks[i].event, hooks[i].callback);
        }
      }

      return decorate.apply(this, [tree]).then(function() {
        self.tree = { '/': tree };
        return self;
      }, function(err) {
        return $q.reject(err);
      });
    };

    // All available hooks
    Tree.HOOK_DECORATE     = 1;
    Tree.HOOK_PRE_REMOVE   = 10;
    Tree.HOOK_POST_REMOVE  = 11;
    Tree.HOOK_PRE_APPEND   = 20;
    Tree.HOOK_POST_APPEND  = 21;
    Tree.HOOK_PRE_MOVE     = 30;
    Tree.HOOK_POST_MOVE    = 31;
    Tree.HOOK_PRE_REFRESH  = 40;
    Tree.HOOK_POST_REFRESH = 41;

    /**
     * Register a listener for a hook
     * @param  {int}   event
     * @param  {Function} callback
     */
    Tree.prototype.registerHook = function(event, callback) {
      if (!this.hooks[event]) {
        this.hooks[event] = [];
      }

      this.hooks[event].push(callback);
    };

    /**
     * Call all listeners for a hook
     * @param  {int} event
     * @param  {boolean} ignore
     * @return {promise}
     */
    Tree.prototype._hook = function(event, ignore) {
      var deferred = $q.defer(), self = this, cursor = 0;
      if (this.hooks[event] && !ignore) {
        var args = [].slice.apply(arguments);

        // this function is give to each listener and execute the next one if no error is triggered
        var next = function(err) {
          // the current listener returned an error, reject the promise and stop the hook listeners chain
          if (err) {
            return deferred.reject(err);
          }

          // all is good to continue we increment the cursor to retrieve the next hook listener
          cursor++;
          if (self.hooks[event].length > cursor) {
            return self.hooks[event][cursor].apply(self, args);
          }
          // we reach the end of the hook listeners chain, resolve the promise
          deferred.resolve();
        };

        // the two first arguments of the _hook method are useless for the hook listeners
        // we remove the first one and replace the second by the next callback
        args.shift();
        args[0] = next;

        // call the first hook listener of the chain
        if (this.hooks[event].length > cursor) {
          this.hooks[event][cursor].apply(self, args);
        }
      } else {
        // no hook listeners found
        deferred.resolve();
      }

      return deferred.promise;
    };

    /**
     * Get the raw data of the tree
     * @return {object}
     */
    Tree.prototype.getRawTree = function() {
      return this.tree;
    };

    /**
     * Find a node in the tree
     * @param  {string} path
     * @param  {object} root
     * @return {promise}
     */
    Tree.prototype.find = function(path, root){

      /**
       * Perform a recursive search
       * @param  {array} target
       * @param  {object} tree
       * @return {mixed}
       */
      var search = function (target, tree){
        if(target.length > 0){
          // we did not reach the wanted node
          for (var child in tree.children){
            if (tree.children.hasOwnProperty(child) &&
                tree.children[child] &&
                target[0] === tree.children[child].name){
              target.shift();
              // we found the children which is on the path of the wanted node, we restart a search in it
              return search(target,tree.children[child]);
            }
          }
          // no node found
          return undefined;
        }
        // finally found the wanted node
        return tree;
      };

      // build target array
      // if path is /path/of/node, target will contains ['path', 'of', 'node']
      var target = path.split('/');
      if (path === '/') {
        target = [];
      } else {
        target.shift();
      }
      root = root || this.tree['/'];

      var deferred = $q.defer(),
          result = search(target, root);

      if (result) {
        deferred.resolve(result);
      } else {
        deferred.reject('Unknown node');
      }

      return deferred.promise;
    };

    /**
     * Find the parent of a node
     * @param  {string} path
     * @return {promise}
     */
    Tree.prototype.findParent = function(path){
      return this.find(parentPath(path));
    };

    /**
     * Remove a node of the tree
     * @param  {string} path
     * @param  {boolean} ignoreHooks
     * @return {promise}
     */
    Tree.prototype.remove = function(path, ignoreHooks) {
      var self = this;
      // find the parent node of the node to be removed
      return this.find(parentPath(path)).then(function(parent) {
        // call execute all preRemove hook listeners
        return self._hook(Tree.HOOK_PRE_REMOVE, ignoreHooks, path, parent).then(function() {
          // all listeners worked without error, propagate the parent argument to the next promise
          return parent;
        }, function(err) {
          // an error occured in a listener, terminate the promise chain
          return $q.reject(err);
        });
      }).then(function(parent) {
        // find the target node in the children of the parent node
        for (var child in parent.children) {
          if (parent.children[child] && parent.children[child].path === path) {
            // found it, let's save a copy to return it
            var deletedNode = angular.copy(parent.children[child]);

            // delete the node
            parent.children[child] = undefined;
            parent.children = compact(parent.children);

            // finally, call all postRemove hook listeners
            return self._hook(Tree.HOOK_POST_REMOVE, ignoreHooks, path, deletedNode, parent).then(function() {
              return deletedNode;
            }, function(err) {
              // an error occured in a listener, terminate the promise chain
              return $q.reject(err);
            });
          }
        }
        $q.reject('Unknown node');
      }, function(err) {
        // an error occured, call all postRemove hook listeners before finishing
        return self._hook(Tree.HOOK_POST_REMOVE, ignoreHooks, path, undefined).then(function() {
          return $q.reject(err);
        }, function(err) {
          // an error occured in a listener, terminate the promise chain
          return $q.reject(err);
        });
      });
    };

    /**
     * Append a node to the tree
     * @param  {string} parentPath
     * @param  {object} childNode
     * @param  {boolean} ignoreHooks
     * @return {promise}
     */
    Tree.prototype.append = function(parentPath, childNode, ignoreHooks) {
      var self = this;
      // find the parent node of the node to be added
      return this.find(parentPath, this.tree['/']).then(function(parent) {
        // call execute all preAppend hook listeners
        return self._hook(Tree.HOOK_PRE_APPEND, ignoreHooks, parentPath, childNode, parent).then(function() {
            // all listeners worked without error, propagate the parent argument to the next promise
            return parent;
          }, function(err) {
            // an error occured in a listener, terminate the promise chain
            return $q.reject(err);
          });
      }).then(function(parent) {
        // normalize node data
        if (parent.path === '/') {
          childNode.path = parent.path + childNode.name;
        } else {
          childNode.path = parent.path + '/' + childNode.name;
        }

        if (!childNode.children) {
          childNode.children = [];
        }

        // update path in children of childNode
        updatePath(parent.path, childNode);

        // call all decorate hooks listeners
        return decorate.apply(self, [childNode]).then(function(childNode) {
          parent.children.push(childNode);
          return parent;
        }, function(err) {
          // an error occured in a listener, terminate the promise chain
          return $q.reject(err);
        });
      }).then(function(parent) {
        // finally, call all postAppend hook listeners
        return self._hook(Tree.HOOK_POST_APPEND, ignoreHooks, parentPath, childNode, parent).then(function() {
          return childNode;
        }, function(err) {
          // an error occured in a listener, terminate the promise chain
          return $q.reject(err);
        });
      }, function(err) {
        // an error occured, call all postAppend hook listeners before finishing
        return self._hook(Tree.HOOK_POST_APPEND, ignoreHooks, parentPath, undefined).then(function() {
          return $q.reject(err);
        }, function(err) {
          // an error occured in a listener, terminate the promise chain
          return $q.reject(err);
        });
      });
    };

    /**
     * Move node in the tree
     * @param  {string} fromPath
     * @param  {string} toPath
     * @return {promise}
     */
    Tree.prototype.move = function(fromPath, toPath) {
      var self = this;
      // find the node to be moved
      return this.find(fromPath).then(function(node) {
        // call execute all preMove hook listeners
        return self._hook(Tree.HOOK_PRE_MOVE, false, fromPath, toPath, node);
      }).then(function() {
        // remove the node from its current parent
        return self.remove(fromPath, true);
      }).then(function(node) {
        // append the node to the new parent
        return self.append(toPath, node, true);
      }).then(function(node) {
        // call execute all postMove hook listeners
        return self._hook(Tree.HOOK_POST_MOVE, false, fromPath, toPath, node).then(function() {
          return node;
        }, function(err) {
          // an error occured in a listener, terminate the promise chain
          return $q.reject(err);
        });
      }, function(err) {
        // an error occured, call all postMove hook listeners before finishing
        return self._hook(Tree.HOOK_POST_MOVE, false, fromPath, toPath, undefined).then(function() {
          return $q.reject(err);
        }, function(err) {
          // an error occured in a listener, terminate the promise chain
          return $q.reject(err);
        });
      });
    };

    /**
     * Update a node in the tree
     * @param  {string} path
     * @param  {object} data
     * @return {promise}
     */
    Tree.prototype.refresh = function(path, data) {
      var self = this;
      // find the node to be refreshed
      return this.find(path).then(function(node) {
        // call execute all preRefresh hook listeners
        return self._hook(Tree.HOOK_PRE_REFRESH, false, path, node, data).then(function() {
          // all listeners worked without error, propagate the node argument to the next promise
          return node;
        }, function(err) {
          // an error occured in a listener, terminate the promise chain
          return $q.reject(err);
        });
      }).then(function(node) {
        // Refresh node data
        for (var i in data) {
          if (data.hasOwnProperty(i)) {
            node[i] = data[i];
          }
        }
        // call all decorate hooks listeners
        return decorate.apply(self, [node]);
      }).then(function(node) {
        // finally, call all postRefresh hook listeners
        return self._hook(Tree.HOOK_POST_REFRESH, false, path, node, data).then(function() {
          return node;
        }, function(err) {
          // an error occured in a listener, terminate the promise chain
          return $q.reject(err);
        });
      }, function(err) {
        // an error occured, call all postRefresh hook listeners before finishing
        return self._hook(Tree.HOOK_POST_REFRESH, false, path, undefined).then(function() {
          return $q.reject(err);
        }, function(err) {
          // an error occured in a listener, terminate the promise chain
          return $q.reject(err);
        });
      });
    };

    return {

      /**
       * Build a Tree object
       * @param  {object} tree
       * @param  {array} hooks
       * @return {promise}
       */
      build: function(tree, hooks) {
        return new Tree(tree, hooks);
      },

      /**
       * Test raw data validity
       * @param  {object} data
       * @return {boolean}
       */
      accept: function(data) {
        return data.name !== undefined && data.path !== undefined && data.children !== undefined;
      },

      HOOK_DECORATE: Tree.HOOK_DECORATE,
      HOOK_PRE_REMOVE: Tree.HOOK_PRE_REMOVE,
      HOOK_POST_REMOVE: Tree.HOOK_POST_REMOVE,
      HOOK_PRE_APPEND: Tree.HOOK_PRE_APPEND,
      HOOK_POST_APPEND: Tree.HOOK_POST_APPEND,
      HOOK_PRE_MOVE: Tree.HOOK_PRE_MOVE,
      HOOK_POST_MOVE: Tree.HOOK_POST_MOVE,
      HOOK_PRE_REFRESH: Tree.HOOK_PRE_REFRESH,
      HOOK_POST_REFRESH: Tree.HOOK_POST_REFRESH
    };
  }]);
});
