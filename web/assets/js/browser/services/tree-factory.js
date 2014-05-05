/* global define */
/* jshint indent:2 */

define([
  'app',
  'angular'
], function(app, angular) {
  'use strict';

  app.factory('mbTreeFactory', ['$q', function($q) {
    var decorate = function (tree){
      for (var node in tree.children) {
        if (tree.children.hasOwnProperty(node)) {
          if (tree.path === '/') {
            node.path = tree.path + node.name;
          } else {
            node.path = tree.path + '/' + node.name;
          }
          tree.children[node] = decorate.apply(this, [tree.children[node]]);
        }
      }

      this._hook(Tree.HOOK_DECORATE, tree);

      return tree;
    };

    var compact = function(array) {
      var compacted = [];
      array.map(function(value) {
        if (value !== undefined) {
          compacted.push(value);
        }
      });
      return compacted;
    };


    var parentPath = function(path) {
      var parent = path.split('/');
      parent.pop();
      return parent.join('/');
    };

    var Tree = function(tree, hooks) {
      this.hooks = {};

      if (hooks) {
        for (var i in hooks) {
          this.registerHook(hooks[i].event, hooks[i].callback);
        }
      }
      this.tree = { '/': decorate.apply(this, [tree]) };
    };

    Tree.HOOK_DECORATE = 1;
    Tree.HOOK_PRE_REMOVE = 10;
    Tree.HOOK_POST_REMOVE = 11;
    Tree.HOOK_PRE_APPEND = 20;
    Tree.HOOK_POST_APPEND = 21;
    Tree.HOOK_PRE_MOVE = 30;
    Tree.HOOK_POST_MOVE = 31;

    Tree.prototype.registerHook = function(event, callback) {
      if (!this.hooks[event]) {
        this.hooks[event] = [];
      }

      this.hooks[event].push(callback);
    };

    Tree.prototype._hook = function(event) {
      if (this.hooks[event]) {
        for (var i in this.hooks[event]) {
          var args = [].slice.apply(arguments);
          args.shift();
          this.hooks[event][i].apply(this, args);
        }
      }
    };

    Tree.prototype.getRawTree = function() {
      return this.tree;
    };

    Tree.prototype.find = function(path, root){
      var search = function (target, tree){
        if(target.length > 0){
          for (var child in tree.children){
            if (tree.children.hasOwnProperty(child) &&
                tree.children[child] &&
                target[0] === tree.children[child].name){
              target.shift();
              return search(target,tree.children[child]);
            }
          }
          return undefined;
        }
        return tree;
      };

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

    Tree.prototype.findParent = function(path){
      return this.find(parentPath(path));
    };

    Tree.prototype.remove = function(path, noHooks) {
      var deferred = $q.defer(), self = this;
      try {
        this.find(parentPath(path)).then(function(parent) {
          if (!noHooks) {
            self._hook(Tree.HOOK_PRE_REMOVE, path, parent);
          }
          for (var child in parent.children){
            if (parent.children[child] && parent.children[child].path === path) {
              var old = angular.copy(parent.children[child]);
              parent.children[child] = undefined;
              parent.children = compact(parent.children);
              if (!noHooks) {
                self._hook(Tree.HOOK_POST_REMOVE, path, old, parent);
              }
              deferred.resolve(old);
            }
          }
        }, function(err) {
          if (!noHooks) {
            self._hook(Tree.HOOK_POST_REMOVE, path, undefined);
          }
          deferred.reject(err);
        });
      } catch (e) {
        deferred.reject(e);
      }

      return deferred.promise;
    };

    Tree.prototype.append = function(parentPath, childNode, noHooks) {
      var deferred = $q.defer(), self = this;
      try {
        this.find(parentPath, this.tree['/']).then(function(parent) {
          if (!noHooks) {
            self._hook(Tree.HOOK_PRE_APPEND, parentPath, childNode, parent);
          }

          if (parent.path === '/') {
            childNode.path = parent.path + childNode.name;
          } else {
            childNode.path = parent.path + '/' + childNode.name;
          }

          parent.children.push(decorate.apply(self, [childNode]));
          if (!noHooks) {
            self._hook(Tree.HOOK_POST_APPEND, parentPath, childNode, parent);
          }
          deferred.resolve(childNode);
        }, function(err) {
          if (!noHooks) {
            self._hook(Tree.HOOK_POST_APPEND, parentPath, undefined);
          }
          deferred.reject(err);
        });
      } catch (e) {
        deferred.reject(e);
      }

      return deferred.promise;
    };

    Tree.prototype.move = function(fromPath, toPath) {
      var deferred = $q.defer(), self = this;
      try {
        this.find(fromPath).then(function(node) {
          self._hook(Tree.HOOK_PRE_MOVE, fromPath, toPath, node);
          self.remove(fromPath, true).then(function(node) {
            self.append(toPath, node, true).then(function(node) {
              self._hook(Tree.HOOK_POST_MOVE, fromPath, toPath, node);
              deferred.resolve(node);
            }, function(err) {
              self._hook(Tree.HOOK_POST_MOVE, fromPath, toPath, undefined);
              deferred.reject(err);
            });
          }, function(err) {
            self._hook(Tree.HOOK_POST_MOVE, fromPath, toPath, undefined);
            deferred.reject(err);
          });
        }, function(err) {
          self._hook(Tree.HOOK_POST_MOVE, fromPath, toPath, undefined);
          deferred.reject(err);
        });
      } catch (e) {
        deferred.reject(e);
      }
      return deferred.promise;
    };

    return {
      build: function(tree, hooks) {
        return new Tree(tree, hooks);
      },
      accept: function(data) {
        return data.name !== undefined && data.path !== undefined && data.children !== undefined;
      },
      HOOK_DECORATE: Tree.HOOK_DECORATE,
      HOOK_PRE_REMOVE: Tree.HOOK_PRE_REMOVE,
      HOOK_POST_REMOVE: Tree.HOOK_POST_REMOVE,
      HOOK_PRE_APPEND: Tree.HOOK_PRE_APPEND,
      HOOK_POST_APPEND: Tree.HOOK_POST_APPEND,
      HOOK_PRE_MOVE: Tree.HOOK_PRE_MOVE,
      HOOK_POST_MOVE: Tree.HOOK_POST_MOVE
    };
  }]);
});
