define([
    'angular'
], function(angular) {
    'use strict';

    function NodeController($scope, $state, $graph, $search, $fuzzyFilter, $notification, $treeFactory) {
        this.$scope = $scope;
        this.$state = $state;
        this.$graph = $graph;
        this.$search = $search;
        this.$fuzzyFilter = $fuzzyFilter;
        this.$notification = $notification;
        this.$treeFactory = $treeFactory;

        this.$$init();
    }

    NodeController.prototype.$$init = function() {
        var self = this;

        this.propertyTypes = [
            'undefined',
            'String',
            'Binary',
            'Long',
            'Double',
            'Date',
            'Boolean',
            'Name',
            'Path',
            'Reference',
            'WeakReference',
            'URI',
            'Decimal',
        ];

        this.search = null;
        this.$pending = false;
        this.$scope.nodeRenameFormDisplayed = false;

        this.$scope.$watch(function() {
            return self.$scope.nodeRenameFormDisplayed;
        }, function (value) {
            self.$pending = value;
        });

        this.cancelSearchListener = this.$search.registerListener(function(search) {
            if (self.search !== search) {
                self.search = search;
                self.$$filterProperties();
            }
        });

        this.$graph.find({
            repository: this.$state.params.repository,
            workspace: this.$state.params.workspace,
            path: this.$state.params.path ? this.$state.params.path : '/'
        }).then(function(node) {
            self.$scope.node = node;
            self.$scope.nodeRenameForm = {
                name: node.name
            };
            self.$$filterProperties();
        });

        this.$scope.$on('$destroy', function() {
            self.$$destroy();
        });
    };

    NodeController.prototype.showNodeRenameForm = function() {
        if (this.$scope.node.path === '/') {
            return;
        }

        this.$scope.nodeRenameFormDisplayed = true;
    };

    NodeController.prototype.hideNodeRenameForm = function() {
        this.$scope.nodeRenameFormDisplayed = false;
        this.$scope.nodeRenameForm.name = this.$scope.node.name;
    };

    NodeController.prototype.renameNode = function() {
        var self = this;

        if (!this.$scope.nodeRenameForm.name) {
            return this.$notification.error('Name is empty');
        }

        if (this.$scope.nodeRenameForm.name === this.$scope.node.name) {
            return self.hideNodeRenameForm();
        }

        this.$scope.node.rename(this.$scope.nodeRenameForm.name).then(function() {
            self.$notification.success('Node renamed');

            // We find the node in the tree to update its name and path
            self.$scope.tree
                .find('/root' + self.$scope.node.path)
                .then(function(currentTree) {
                    currentTree.attr('name', self.$scope.nodeRenameForm.name);

                    self.$treeFactory.walkChildren(currentTree, function(tree) {
                        tree.attr('path', tree.path().replace('/root', ''));
                    });

                    self.hideNodeRenameForm();
                    return self.$state.go('node', {
                        repository: self.$state.params.repository,
                        workspace: self.$state.params.workspace,
                        path: currentTree.attr('path')
                    });
                })
            ;
        }, function(err) {
            self.$notification.errorFromResponse(err);
        });
    };

    NodeController.prototype.$$filterProperties = function() {
        var filteredPropertyNames = this.$fuzzyFilter(Object.keys(this.$scope.node.properties), this.search),
            properties = [],
            self = this;

        angular.forEach(filteredPropertyNames, function(propertyName) {
            properties.push({
                name: propertyName,
                value: self.$scope.node.properties[propertyName].value,
                type: self.propertyTypes[self.$scope.node.properties[propertyName].type]
            });
        });

        this.$scope.properties = properties;
    };

    NodeController.prototype.$$destroy = function() {
        this.cancelSearchListener();

        this.$scope = undefined;
        this.$state = undefined;
        this.$graph = undefined;
        this.$search = undefined;
        this.$fuzzyFilter = undefined;
        this.$notification = undefined;
        this.$treeFactory = undefined;
        this.search = undefined;
        this.propertyTypes = undefined;
    };

    NodeController.$inject = ['$scope', '$state', '$graph', '$search', '$fuzzyFilter', '$notification', '$treeFactory'];

    return NodeController;
});
