define([
    'angular'
], function(angular) {
    'use strict';

    function NodeController($scope, $state, $graph, $search, $fuzzyFilter, $notification, $treeFactory, $timeout, $q) {
        this.$scope = $scope;
        this.$state = $state;
        this.$graph = $graph;
        this.$search = $search;
        this.$fuzzyFilter = $fuzzyFilter;
        this.$notification = $notification;
        this.$treeFactory = $treeFactory;
        this.$timeout = $timeout;
        this.$q = $q;

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
        this.$scope.savedProperty = null;

        this.$scope.nodePropertyFormDisplayed = false;
        this.$scope.nodePropertyForm = {
            name: null,
            value: null,
            type: null
        };

        this.$scope.$watch(function() {
            return self.$scope.nodeRenameFormDisplayed || self.$scope.nodePropertyFormDisplayed;
        }, function (value) {
            self.$pending = value;
        });

        this.cancelSearchListener = this.$search.registerListener(function(search) {
            if (self.search !== search) {
                self.search = search;
                self.$$filterProperties();
            }
        });

        this.$$loadNode();

        this.$scope.$on('_$elementDropSuccess_', function($event, data) {
            if (!data.draggableData.property && !data.droppableData.trash) {
                return;
            }

            return self.$$removeProperty(data.draggableData.property);
        });

        this.$scope.$on('$destroy', function() {
            self.$$destroy();
        });
    };

    NodeController.prototype.$$loadNode = function(cache) {
        cache = cache !== undefined ? !!cache : cache;

        var self = this;

        return this.$graph.find({
            repository: this.$state.params.repository,
            workspace: this.$state.params.workspace,
            path: this.$state.params.path ? this.$state.params.path : '/'
        }, { cache: cache }).then(function(node) {
            self.$scope.node = node;
            self.$scope.nodeRenameForm = {
                name: node.name
            };
            self.$$filterProperties();
        });
    };

    NodeController.prototype.refresh = function() {
        var self = this;

        this.$$loadNode(false);
    };

    NodeController.prototype.showNodeRenameForm = function() {
        if (this.$scope.node.path === '/') {
            return;
        }

        this.$scope.nodeRenameFormDisplayed = true;
    };

    NodeController.prototype.showNodePropertyForm = function() {
       this.$scope.nodePropertyFormDisplayed = true;
    };

    NodeController.prototype.hideNodePropertyForm = function() {
       this.$scope.nodePropertyFormDisplayed = false;

       this.$scope.nodePropertyForm = {
            name: null,
            value: null,
            type: null
        };
    };

    NodeController.prototype.hideNodeRenameForm = function() {
        this.$scope.nodeRenameFormDisplayed = false;
        this.$scope.nodeRenameForm.name = this.$scope.node.name;
    };

    NodeController.prototype.renameNode = function($event) {
        if ($event) {
            // When the form is submitted using the button we have to stop this event to avoid blur callback
            // That is also why we use a mousedown event, indeed we want to be triggered before the blur
            $event.preventDefault();
        }

        var self = this;

        if (this.$scope.nodeRenameForm.name === null || this.$scope.nodeRenameForm.name.trim().length === 0) {
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

    NodeController.prototype.addProperty = function($event) {
        if ($event) {
            // When the form is submitted using the button we have to stop this event to avoid blur callback
            // That is also why we use a mousedown event, indeed we want to be triggered before the blur
            $event.preventDefault();
        }

        if (this.$scope.nodePropertyForm.name === undefined || this.$scope.nodePropertyForm.name.trim().length === 0) {
            return this.$notification.error('Name is empty');
        }

        if (this.$scope.nodePropertyForm.value === undefined || this.$scope.nodePropertyForm.value.trim().length === 0) {
            return this.$notification.error('Value is empty');
        }

        if (Object.keys(this.$scope.node.properties).indexOf(this.$scope.nodePropertyForm.name) !== -1) {
            return this.$notification.error('The property already exists');
        }

        var self = this,
            value
        ;

        this.$scope.nodePropertyForm.type = this.propertyTypes.indexOf(this.$scope.nodePropertyForm.type);

        if (this.$scope.nodePropertyForm.type === -1) {
            this.$scope.nodePropertyForm.type = 0;
        }



        this.$$createProperty(this.$scope.nodePropertyForm)
            .then(function() {
                self.hideNodePropertyForm();
            })
            .then(function() {
                self.$notification.success('Property created');
            }, function(err) {
                self.$scope.nodePropertyForm.type = self.propertyTypes[self.$scope.nodePropertyForm.type];
                self.$notification.errorFromResponse(err);
            })
        ;
    };

    NodeController.prototype.$$createProperty = function(property) {
        var self = this,
            value,
            oldValue = property.value
        ;

        try {
            value = JSON.parse(property.value);
        } catch (e) {
            value = oldValue;
        }

        property.value = value;
        return this.$scope.node.createProperty(property)
            .then(function() {
                return self.$$loadNode(false);
            }, function(err) {
                property.value = oldValue;

                return self.$q.reject(err);
            })
        ;
    }

    NodeController.prototype.isPropertyNameValid = function(nameField) {
        var valid = !nameField.$dirty || (nameField.$dirty && !nameField.$error.required);

        var exists = Object.keys(this.$scope.node.properties).indexOf(this.$scope.nodePropertyForm.name) !== -1;

        return valid && !exists;
    };

    NodeController.prototype.isPropertyValueValid = function(valueField) {
        return !valueField.$dirty || (valueField.$dirty && !valueField.$error.required);
    };

    NodeController.prototype.restoreSavedProperty = function() {
        var self = this;

        this.$$createProperty(this.$scope.savedProperty)
            .then(function() {
                self.clearSavedProperty();
                self.$notification.success('Property restored');
            }, function(err) {
                self.$notification.errorFromResponse(err);
            })
        ;
    };

    NodeController.prototype.clearSavedProperty = function() {
        this.$scope.savedProperty = null;

        if (self.savedPropertyTimeout) {
            self.$timeout.cancel(self.savedPropertyTimeout);
        }
    };

    NodeController.prototype.$$removeProperty = function(property) {
        var self = this;

        this.$scope.node
            .removeProperty(property.name)
            .then(function() {
                return self.$$loadNode(false);
            })
            .then(function() {
                self.$scope.savedProperty = property;
                self.savedPropertyTimeout = self.$timeout(function() {
                    self.$scope.savedProperty = null;
                }, 5000);
                self.$notification.success('Property removed');
            }, function(err) {
                self.$notification.errorFromResponse(err);
            })
        ;
    };

    NodeController.prototype.editProperty = function(value, options) {
        var self = this;

        if (value ===  null || value.trim().length === 0) {
            this.$notification.error('Value is empty');
            return self.$q.reject();
        }

        var property = options.property;
        var oldValue = property.value;
        property.value = value;

        return this.$$createProperty(property)
            .then(function() {
                self.$notification.success('Property updated');
            }, function(err) {
                property.value = oldValue;
                self.$notification.errorFromResponse(err);
                return self.$q.reject(err);
            })
        ;
    };

    NodeController.prototype.$$filterProperties = function() {
        var filteredPropertyNames = this.$fuzzyFilter(Object.keys(this.$scope.node.properties), this.search),
            properties = [],
            self = this;

        angular.forEach(filteredPropertyNames, function(propertyName) {
            properties.push({
                name: propertyName,
                value: self.$scope.node.properties[propertyName].value,
                type: self.$scope.node.properties[propertyName].type
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
        this.$timeout = undefined;
        this.$q = undefined;

        this.search = undefined;
        this.propertyTypes = undefined;
    };

    NodeController.$inject = ['$scope', '$state', '$graph', '$search', '$fuzzyFilter', '$notification', '$treeFactory', '$timeout', '$q'];

    return NodeController;
});
