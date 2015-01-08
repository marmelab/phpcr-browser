define([], function() {
    'use strict';

    function NodeCreationFormController($scope, $tree, $treeFactory, $error) {
        this.$scope = $scope;
        this.$tree = $tree;
        this.$treeFactory = $treeFactory;
        this.$error = $error;

        this.$$init();
    }

    NodeCreationFormController.prototype.$$init = function() {
        var self = this;

        this.$scope.nodeCreationForm = {
            name: null
        };

        this.$scope.$on('$destroy', function() {
            self.$$destroy();
        });
    };

    NodeCreationFormController.prototype.hideNodeCreationForm = function() {
        this.$scope.tree.nodeCreationFormDisplayed = false;
        this.$scope.nodeCreationForm.name = null;
    }

    NodeCreationFormController.prototype.createNode = function() {
        var self = this;

        if (this.$scope.nodeCreationForm.name === undefined || this.$scope.nodeCreationForm.name.trim().length === 0) {
            return this.$error()
                .content('Name is empty')
                .timeout(3000)
                .save();
        }

        var unregisterListener = this.$tree.notified(function(tree) {
            tree
                .find('/root' + (self.$scope.tree.path !== '/' ? self.$scope.tree.path : '') )
                .then(function(parent) {
                    self.$scope.$emit('$treeCreate', {
                        parent: parent,
                        child: self.$treeFactory({
                            name: self.$scope.nodeCreationForm.name
                        }),
                        hide: function() {
                            return self.hideNodeCreationForm();
                        }
                    });
                });

            self.$scope.$evalAsync(function() {
                unregisterListener();
            });
        });
    };

    NodeCreationFormController.prototype.$$destroy = function() {
        // We do not delete $scope because it is shared with the tree
        this.$tree = undefined;
        this.$treeFactory = undefined;
        this.$error = undefined;
    };

    NodeCreationFormController.$inject = ['$scope', '$tree', '$treeFactory', '$error'];

    return NodeCreationFormController;
});
