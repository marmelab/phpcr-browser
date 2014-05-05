/* global define */
/* jshint indent:2 */

define([
  'app',
  'angular'
], function(app, angular) {
  'use strict';

  app.factory('mbTreeFactory', ['$q', function($q) {
    var decorate = function (tree){
      var deferred = $q.defer(), self = this;

      var decorateTree = function(tree) {
        var deferred = $q.defer(), cursor = 0;
        var next = function(err) {
          if (err) {
            return deferred.reject(err);
          }

          cursor ++;
          if (tree.children.length > cursor) {
            return decorateNode.apply(self, [next, tree.children[cursor], tree]);
          }
          deferred.resolve(tree);
        };

        if (tree.children.length > cursor) {
          decorateNode.apply(self, [next, tree.children[cursor], tree]);
        } else {
          deferred.resolve(tree);
        }
        return deferred.promise;
      };

      var decorateNode = function(next, node, parent) {
        if (parent && parent.path === '/') {
          node.path = parent.path + node.name;
        } else if (parent) {
          node.path = parent.path + '/' + node.name;
        }

        decorateTree(node).then(function(node) {
          self._hook(Tree.HOOK_DECORATE, false, node).then(function() {
            next();
          }, next);
        });
      };

      decorateNode(function(err) {
        if (err) {
          return deferred.reject(err);
        }
        deferred.resolve(tree);
      }, tree);
      return deferred.promise;
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
      var deferred = $q.defer(), self = this;
      this.hooks = {};

      if (hooks) {
        for (var i in hooks) {
          this.registerHook(hooks[i].event, hooks[i].callback);
        }
      }

      decorate.apply(this, [tree]).then(function() {
        self.tree = { '/': tree };
        deferred.resolve(self);
      }, deferred.reject);
      return deferred.promise;
    };

    Tree.HOOK_DECORATE = 1;
    Tree.HOOK_PRE_REMOVE = 10;
    Tree.HOOK_POST_REMOVE = 11;
    Tree.HOOK_PRE_APPEND = 20;
    Tree.HOOK_POST_APPEND = 21;
    Tree.HOOK_PRE_MOVE = 30;
    Tree.HOOK_POST_MOVE = 31;
    Tree.HOOK_PRE_REFRESH = 40;
    Tree.HOOK_POST_REFRESH = 41;

    Tree.prototype.registerHook = function(event, callback) {
      if (!this.hooks[event]) {
        this.hooks[event] = [];
      }

      this.hooks[event].push(callback);
    };

    Tree.prototype._hook = function(event, ignore) {
      var deferred = $q.defer(), self = this, cursor = 0;
      if (this.hooks[event] && !ignore) {
        var args = [].slice.apply(arguments);

        var next = function(err) {
          if (err) {
            return deferred.reject(err);
          }

          cursor++;
          if (self.hooks[event].length > cursor) {
            return self.hooks[event][cursor].apply(self, args);
          }
          deferred.resolve();
        };

        args.shift();
        args[0] = next;
        if (this.hooks[event].length > cursor) {
          this.hooks[event][cursor].apply(self, args);
        }
      } else {
        deferred.resolve();
      }

      return deferred.promise;
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

    Tree.prototype.remove = function(path, ignoreHooks) {
      var deferred = $q.defer(), self = this;
      this.find(parentPath(path)).then(function(parent) {
        self._hook(Tree.HOOK_PRE_REMOVE, ignoreHooks, path, parent).then(function() {
          for (var child in parent.children){
            if (parent.children[child] && parent.children[child].path === path) {
              var old = angular.copy(parent.children[child]);
              parent.children[child] = undefined;
              parent.children = compact(parent.children);

              self._hook(Tree.HOOK_POST_REMOVE, ignoreHooks, path, old, parent).then(function() {
                deferred.resolve(old);
              }, deferred.reject);
              return;
            }
          }

          self._hook(Tree.HOOK_POST_REMOVE, ignoreHooks, path, undefined).then(function() {
            deferred.reject('Unknown node');
          }, deferred.reject);

        }, deferred.reject);
      }, function(err) {
        self._hook(Tree.HOOK_POST_REMOVE, ignoreHooks, path, undefined).then(function() {
          deferred.reject(err);
        }, deferred.reject);
      });

      return deferred.promise;
    };

    Tree.prototype.append = function(parentPath, childNode, ignoreHooks) {
      var deferred = $q.defer(), self = this;
      this.find(parentPath, this.tree['/']).then(function(parent) {
        self._hook(Tree.HOOK_PRE_APPEND, ignoreHooks, parentPath, childNode, parent).then(function() {
          if (parent.path === '/') {
            childNode.path = parent.path + childNode.name;
          } else {
            childNode.path = parent.path + '/' + childNode.name;
          }

          decorate.apply(self, [childNode]).then(function(childNode) {
            parent.children.push(childNode);

            self._hook(Tree.HOOK_POST_APPEND, ignoreHooks, parentPath, childNode, parent).then(function() {
              deferred.resolve(childNode);
            }, deferred.reject);
          }, deferred.reject);

        }, deferred.reject);
      }, function(err) {
        self._hook(Tree.HOOK_POST_APPEND, ignoreHooks, parentPath, undefined).then(function() {
          deferred.reject(err);
        }, deferred.reject);
      });
      return deferred.promise;
    };

    Tree.prototype.move = function(fromPath, toPath) {
      var deferred = $q.defer(), self = this;
      this.find(fromPath).then(function(node) {
        self._hook(Tree.HOOK_PRE_MOVE, false, fromPath, toPath, node).then(function() {
          self.remove(fromPath, true).then(function(node) {
            self.append(toPath, node, true).then(function(node) {
              self._hook(Tree.HOOK_POST_MOVE, false, fromPath, toPath, node).then(function() {
                deferred.resolve(node);
              }, deferred.reject);
            }, function(err) {
              self._hook(Tree.HOOK_POST_MOVE, false, fromPath, toPath, undefined).then(function() {
                deferred.reject(err);
              }, deferred.reject);
            });
          }, function(err) {
            self._hook(Tree.HOOK_POST_MOVE, false, fromPath, toPath, undefined).then(function() {
              deferred.reject(err);
            }, deferred.reject);
          });
        }, deferred.reject);
      }, function(err) {
        self._hook(Tree.HOOK_POST_MOVE, false, fromPath, toPath, undefined).then(function() {
          deferred.reject(err);
        }, deferred.reject);
      });
      return deferred.promise;
    };

    Tree.prototype.refresh = function(path, data) {
      var deferred = $q.defer(), self = this;
      this.find(path).then(function(node) {
        self._hook(Tree.HOOK_PRE_REFRESH, false, path, node, data).then(function() {
          for (var i in data) {
            if (data.hasOwnProperty(i)) {
              node[i] = data[i];
            }
          }
          decorate.apply(self, [node]).then(function(node) {
            self._hook(Tree.HOOK_POST_REFRESH, false, path, node, data).then(function() {
              deferred.resolve(node);
            }, deferred.reject);
          }, deferred.reject);
        }, deferred.reject);
      }, function(err) {
        self._hook(Tree.HOOK_POST_REFRESH, false, path, undefined).then(function() {
          deferred.reject(err);
        }, deferred.reject);
      });
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
      HOOK_POST_MOVE: Tree.HOOK_POST_MOVE,
      HOOK_PRE_REFRESH: Tree.HOOK_PRE_REFRESH,
      HOOK_POST_REFRESH: Tree.HOOK_POST_REFRESH
    };
  }]);
});
