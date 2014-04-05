(function($, angular, app) {
  'use strict';

  app.service('mbTreeView', ['$rootScope', '$location', '$log', '$window', 'mbObjectMapper', 'mbRouteParametersConverter',
    function($rootScope, $location, $log, $window, ObjectMapper, RouteParametersConverter) {
    var container = {
      tree: {}
    };

    var find = function(path, root){
      function search(target, tree){
        if(target.length > 0){
          for (var child in tree.children){
            if (tree.children.hasOwnProperty(child) &&
                tree.children[child] &&
                target[0] === tree.children[child].name){
              target.shift();
              return search(target,tree.children[child]);
            }
          }
        }
        return tree;
      }

      var target = path.split('/');
      target.shift();
      return search(target, root);
    };

    var deleteNode = function(path) {
      var parent = path.split('/');
      parent.pop();
      parent = parent.join('/');
      parent = find(parent, container.tree['/']);

      for (var child in parent.children){
        if (parent.children[child] && parent.children[child].path === path) {
          if (parent.children.length === 1) { parent.hasChildren = false; }
          return (parent.children[child] = undefined);
        }
      }
    };

    var normalize = function (tree){
      for (var node in tree.children) {
        if (tree.children.hasOwnProperty(node)) {
          if (tree.children[node]) {
            tree.children[node] = normalize(tree.children[node]);
          }
        }
      }

      tree.slug = tree.path.replace('/', '_');
      if (tree.children.length > 0) {
        tree.collapsed = false;
      } else {
        tree.collapsed = true;
      }

      tree.draggable =
        (tree.path === '/'||
        (container.repository.supports('node.move') && container.repository.supports('node.delete')));

      tree.id = tree.path.split('/').join('_');
      return tree;
    };

    var refresh = function (path) {
      var target = find(path, container.tree['/']);
      target.updateInProgress = true;
      return ObjectMapper.find('/' + container.repository.getName() + '/' + container.workspace.getName() + path, { cache: false }).then(function(node) {
        var rawData = normalize(node.getRawData());
        target.children = rawData.children;
        target.hasChildren = rawData.hasChildren;
        target.updateInProgress = false;
        return target;
      }, function(err) {
        $log.error(err, null, false);
        target.updateInProgress = false;
      });
    };

    var initContainer = function(callback) {
      RouteParametersConverter.getCurrentNode(true).then(function(node) {
        container.workspace = node.getWorkspace();
        container.repository = node.getWorkspace().getRepository();
        container.tree['/'] = normalize(node.getReducedTree()[0]);
        container.find = find;
        container.refresh = refresh;

        $rootScope.$emit('browser.loaded');
        if (callback) { callback(node); }
      });
    };

    $rootScope.$emit('browser.load');
    initContainer();

    var scrollTop = 0;
    $rootScope.$on('$stateChangeSuccess', function(){
      scrollTop = $('.scrollable-tree').scrollTop();
    });

    $rootScope.$on('$stateChangeSuccess', function(evt, toState, toParams, fromState, fromParams){
      if (toState.name === 'workspace' && fromState.name !== 'workspace') {
        $rootScope.$emit('browser.load');
        initContainer();
      } else if(toState.name === fromState.name &&
        (toParams.repository !== fromParams.repository ||
        toParams.workspace !== fromParams.workspace)) {
        $rootScope.$emit('browser.load');
        initContainer();
      } else if(toState.name === fromState.name &&
        toState.name === 'workspace' &&
        toParams.repository === fromParams.repository &&
        toParams.workspace === fromParams.workspace &&
        toParams.path !== fromParams.path) {

        var currentNodeLoader = function() {
          var target = find(toParams.path, container.tree['/']);

          if (!target.collapsed) {
            RouteParametersConverter.getCurrentNode().then(function(node) {
              target.children = normalize(node.getRawData()).children;
              target.updateInProgress = false;
              $window.requestAnimFrame(function() {
                $('.scrollable-tree').scrollTop(scrollTop);
              });
            }, function(err) {
              $log.error(err, null, false);
              target.updateInProgress = false;
            });
          } else { target.updateInProgress = false; }
        };

        if (!container.tree['/']) { return initContainer(currentNodeLoader); }  // Happens when last state was an invalid path, so the tree is not in cache
        currentNodeLoader();
      }
    });

    $rootScope.$on('node.deleted', function(e, path) {
      deleteNode(path);
      var absolutePath = '/' + container.repository.getName() + '/' + container.workspace.getName() + path;

      // If we are on/in a deleted node we have to go back in hierarchy
      if (absolutePath === $location.path().slice(0, absolutePath.length)) {
        var parent = path.split('/');
        parent.pop();
        parent = parent.join('/');
        $location.path('/' + container.repository.getName() + '/' + container.workspace.getName() + parent);
      }
    });

    this.getTreeContainer = function() {
      return container;
    };

    $rootScope.$on('node.moved', function(e, data) {
      var parent = data.from.split('/');
      parent.pop();
      parent = parent.join('/');
      parent = find(parent, container.tree['/']);
      parent.updateInProgress = true;

      var target = find(data.to, container.tree['/']);
      target.updateInProgress = true;
      target.hasChildren = true;

      var node = find(data.from, container.tree['/']);
      target.children.push(node);

      var parentChildrenCount = parent.children.length;

      angular.forEach(parent.children, function(children, k) {
        if (children.path === data.from) {
          parent.children.splice(k,1);
          if (parentChildrenCount === 1) { parent.hasChildren = true;}
          target.updateInProgress = false;
          parent.updateInProgress = false;
          var targetPath = target.path.split('/');
          var root = container.tree['/'];
          targetPath.shift();
          while (targetPath.length > 0) {
            root = find('/'+ targetPath[0], root);
            root.collapsed = false;
            targetPath.shift();
          }
          node.path = data.to;
          if ( target.path !== '/') {
            $location.path('/' + container.repository.getName() + '/' + container.workspace.getName() + target.path + '/' + node.name);
          } else {
            $location.path('/' + container.repository.getName() + '/' + container.workspace.getName() + target.path + node.name);
          }
          $log.log('Node moved.');
          return;
        }
      });
    });
  }]);
})($, angular, angular.module('browserApp'));
