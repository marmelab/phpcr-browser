define([
    'tree',
    'text!app/Tree/view/directive/tree.html',
    'text!app/Tree/view/directive/treeChild.html'
], function (tree, treeTemplate, treeChildTemplate) {
    'use strict';

    function loadTreeFactory($treeFactory, $treeTemplateFactory) {
        $treeFactory.factory(tree);

        $treeTemplateFactory.tree(treeTemplate);
        $treeTemplateFactory.treeChild(treeChildTemplate);
    }

    loadTreeFactory.$inject = ['$treeFactory', '$treeTemplateFactory'];

    return loadTreeFactory;
});

