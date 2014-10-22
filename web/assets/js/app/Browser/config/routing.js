define([
    'text!../view/repositories.html',
    'text!../view/repository.html',
    'text!../view/workspace.html',
    'text!../view/node.html'
], function (repositoriesTemplate, repositoryTemplate, workspaceTemplate, nodeTemplate) {
    "use strict";

    function routing($stateProvider) {

        $stateProvider
            .state('repositories', {
                'parent': 'main',
                'url': '/',
                'controller': 'RepositoriesController',
                'controllerAs': 'repositoriesController',
                'template': repositoriesTemplate
            })
            .state('repository', {
                'parent': 'main',
                'url': '/:repository',
                'template': repositoryTemplate,
                'controller' : 'RepositoryController',
                'controllerAs' : 'repositoryController',
                'resolve': {
                    'repository': function($graph, $stateParams) {
                        return $graph.find($stateParams, { cache: false });
                    }
                }
            })
            .state('workspace', {
                'parent': 'main',
                'abstract': true,
                'url': '/:repository/:workspace',
                'template': workspaceTemplate,
                'controller': 'WorkspaceController',
                'controllerAs': 'workspaceController',
                'resolve': {
                    'workspace': function($graph, $stateParams) {
                        return $graph.find($stateParams, { cache: false });
                    }
                }
            })
            .state('node', {
                'parent': 'workspace',
                'url': '{path:(?:/.*)?}',
                'template': nodeTemplate,
                'controller': 'NodeController',
                'controllerAs': 'nodeController',
                'resolve': {
                    'node': function($graph, $stateParams) {
                        return $graph.find($stateParams);
                    }
                }
            });
    }

    routing.$inject = ['$stateProvider'];

    return routing;
});
