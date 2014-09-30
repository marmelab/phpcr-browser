define([], function() {
    'use strict';

    function NodeCreationFormController($scope, $tree, $treeFactory, $$asyncCallback) {
        this.$scope = $scope;
        this.$tree = $tree;
        this.$treeFactory = $treeFactory;
        this.$$asyncCallback = $$asyncCallback;

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

        var unregisterListener = this.$tree.notified(function(tree) {
            self.$scope.$emit('$treeCreate', {
                parent: tree.find('/root' + (self.$scope.tree.path !== '/' ? self.$scope.tree.path : '') ),
                child: self.$treeFactory({
                    name: self.$scope.nodeCreationForm.name
                }),
                hide: function() {
                    return self.hideNodeCreationForm()
                }
            });

            self.$$asyncCallback(function() {
                unregisterListener();
            });
        });
    };

    NodeCreationFormController.prototype.$$destroy = function() {
        // We do not delete $scope because it is shared with the tree
        this.$tree = undefined;
        this.$treeFactory = undefined;
        this.$$asyncCallback = undefined;
    };

    NodeCreationFormController.$inject = ['$scope', '$tree', '$treeFactory', '$$asyncCallback'];

    return NodeCreationFormController;
});
