require.config({
    paths: {
        'angular': '../bower_components/angular/angular.min',
        'angular-cookies': '../bower_components/angular-cookies/angular-cookies.min',
        'angular-translate': '../bower_components/angular-translate/angular-translate.min',
        'angular-translate-storage-cookie': '../bower_components/angular-translate-storage-cookie/angular-translate-storage-cookie.min',
        'jquery': '../bower_components/jquery/dist/jquery.min',
        'lodash': '../bower_components/lodash/dist/lodash.min',
        'ng-tree': '../bower_components/ng-tree/ng-tree.min',
        'nprogress': '../bower_components/nprogress/nprogress',
        'restangular': '../bower_components/restangular/dist/restangular.min',
        'tree': '../bower_components/tree.js/tree.min',
        'ui-bootstrap': '../bower_components/angular-bootstrap/ui-bootstrap.min',
        'ui-bootstrap-tpls': '../bower_components/angular-bootstrap/ui-bootstrap-tpls.min',
        'ui-router': '../bower_components/angular-ui-router/release/angular-ui-router.min',
        'ui-util-keypress': '../bower_components/angular-ui-utils/keypress.min'
    },
    shim: {
        'angular' : {'exports' : 'angular', 'deps': ['jquery']},
        'angular-cookies': ['angular'],
        'angular-translate': ['angular'],
        'angular-translate-storage-cookie': ['angular', 'angular-translate', 'angular-cookies'],
        'ng-tree': ['angular', 'tree'],
        'restangular': ['angular', 'lodash'],
        'ui-bootstrap': {
            deps: ['angular']
        },
        'ui-bootstrap-tpls': {
            deps: ['ui-bootstrap']
        },
        'ui-router': ['angular'],
        'ui-util-keypress': ['angular']
    },
    modules: [
        {
            name: 'common',
            include: [
                'angular',
                'angular-cookies',
                'angular-translate',
                'angular-translate-storage-cookie',
                'jquery',
                'lodash',
                'ng-tree',
                'nprogress',
                'restangular',
                'tree',
                'ui-bootstrap-tpls',
                'ui-router',
                'ui-util-keypress'
            ],
            override: {
                generateSourceMaps: false,
                optimize: 'none'
            }
        }
    ]
});
