require.config({
    paths: {
        'angular': '../bower_components/angular/angular.min',
        'jquery': '../bower_components/jquery/dist/jquery.min',
        'ui-bootstrap': '../bower_components/angular-bootstrap/ui-bootstrap.min',
        'ui-bootstrap-tpls': '../bower_components/angular-bootstrap/ui-bootstrap-tpls.min',
        'angular-cookies': '../bower_components/angular-cookies/angular-cookies.min',
        'ui-router': '../bower_components/angular-ui-router/release/angular-ui-router.min',
        'ui-util-keypress': '../bower_components/angular-ui-utils/keypress.min',
        'lodash': '../bower_components/lodash/dist/lodash.min',
        'restangular': '../bower_components/restangular/dist/restangular.min',
        'angular-translate': '../bower_components/angular-translate/angular-translate.min',
        'angular-translate-storage-cookie': '../bower_components/angular-translate-storage-cookie/angular-translate-storage-cookie.min',
        'ng-tree': '../bower_components/ng-tree/ng-tree.min',
        'tree': '../bower_components/tree.js/tree.min',
        'nprogress': '../bower_components/nprogress/nprogress'
    },
    shim: {
        'angular' : {'exports' : 'angular', 'deps': ['jquery']},
        'angular-cookies': ['angular'],
        'ui-router': ['angular'],
        'ui-util-keypress': ['angular'],
        'restangular': ['angular', 'lodash'],
        'angular-translate': ['angular'],
        'angular-translate-storage-cookie': ['angular', 'angular-translate', 'angular-cookies'],
        'ui-bootstrap': {
            deps: ['angular']
        },
        'ui-bootstrap-tpls': {
            deps: ['ui-bootstrap']
        },
        'ng-tree': ['angular', 'tree']
    },
    modules: [
        {
            name: 'common',
            include: [
                'angular',
                'jquery',
                'ui-bootstrap-tpls',
                'angular-cookies',
                'ui-router',
                'ui-util-keypress',
                'lodash',
                'restangular',
                'angular-translate',
                'angular-translate-storage-cookie',
                'tree',
                'ng-tree',
                'nprogress'
            ],
            override: {
                generateSourceMaps: false,
                optimize: 'none'
            }
        }
    ]
});
