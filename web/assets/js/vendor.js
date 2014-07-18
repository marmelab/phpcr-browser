require.config({
    paths: {
        'angular': '../bower_components/angular/angular.min',
        'jquery': '../bower_components/jquery/dist/jquery.min',
        'angular-bootstrap': '../bower_components/angular-bootstrap/ui-bootstrap.min',
        'angular-bootstrap-tpls': '../bower_components/angular-bootstrap/ui-bootstrap-tpls.min',
        'angular-cookies': '../bower_components/angular-cookies/angular-cookies.min',
        'angularRoute': '../bower_components/angular-route/angular-route.min',
        'angularAnimate': '../bower_components/angular-animate/angular-animate.min',
        'angular-js-toaster': '../bower_components/AngularJS-Toaster/toaster',
        'angular-ui-router': '../bower_components/angular-ui-router/release/angular-ui-router.min',
        'angular-ui-util-keypress': '../bower_components/angular-ui-utils/keypress.min',
        'lodash': '../bower_components/lodash/dist/lodash.min',
        'restangular': '../bower_components/restangular/dist/restangular.min',
        'talker': '../bower_components/talker/talker-0.1.0.min',
        'angularXEditable': '../bower_components/angular-xeditable/dist/js/xeditable.min',
        'jsonpatch': '../bower_components/jsonpatch/jsonpatch.min',
        'angular-translate': '../bower_components/angular-translate/angular-translate.min',
        'angular-translate-storage-cookie': '../bower_components/angular-translate-storage-cookie/angular-translate-storage-cookie.min',
        'ng-tree': '../bower_components/ng-tree/ng-tree.min',
        'tree': '../bower_components/tree.js/tree.min',
        'nprogress': '../bower_components/nprogress/nprogress',
    },
    shim: {
        'angular' : {'exports' : 'angular', 'deps': ['jquery']},
        'angular-cookies': ['angular'],
        'angularAnimate': ['angular'],
        'angularRoute': ['angular'],
        'angular-js-toaster': ['angular', 'angularAnimate'],
        'angular-ui-router': ['angular'],
        'angular-ui-util-keypress': ['angular'],
        'restangular': ['angular', 'lodash'],
        'talker': ['angular'],
        'angularXEditable': ['angular'],
        'angular-translate': ['angular'],
        'angular-translate-storage-cookie': ['angular', 'angular-translate', 'angular-cookies'],
        'angular-bootstrap': {
            deps: ['angular']
        },
        'angular-bootstrap-tpls': {
            deps: ['angular-bootstrap']
        },
        'ng-tree': ['angular', 'tree']
    },
    modules: [
        {
            name: 'vendor',
            include: [
                'angular',
                'jquery',
                'angular-bootstrap-tpls',
                'angular-cookies',
                'angularRoute',
                'angularAnimate',
                'angular-js-toaster',
                'angular-ui-router',
                'angular-ui-util-keypress',
                'lodash',
                'restangular',
                'talker',
                'angularXEditable',
                'jsonpatch',
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
