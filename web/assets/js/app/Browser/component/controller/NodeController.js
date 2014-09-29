define([
    'angular'
], function(angular) {
    'use strict';

    function NodeController($scope, $state, $graph, $search, $fuzzyFilter, $notification) {
        this.$scope = $scope;
        this.$state = $state;
        this.$graph = $graph;
        this.$search = $search;
        this.$fuzzyFilter = $fuzzyFilter;
        this.$notification = $notification;

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
            self.hideNodeRenameForm();
        }, function(err) {
            var message = 'An error occured',
                type = 'error'
            ;

            if (err.status === 423) {
                message = 'The resource is locked';
                type = 'warning';
            } else if (err.data.message) {
                message = err.data.message;
            }

            self.$notification[type](message);
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
        this.search = undefined;
        this.propertyTypes = undefined;
    };

    NodeController.$inject = ['$scope', '$state', '$graph', '$search', '$fuzzyFilter', '$notification'];

    return NodeController;
});
