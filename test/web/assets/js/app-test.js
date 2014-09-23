var tests = [];
for (var file in window.__karma__.files) {
    if (window.__karma__.files.hasOwnProperty(file)) {
        if (/Spec\.js$/.test(file)) {
            tests.push(file);
        }
    }
}

requirejs.config({
    // Karma serves files from '/base'
    baseUrl: '/base/web/assets/js',

    paths: {
        'angular-mocks': '/base/web/assets/bower_components/angular-mocks/angular-mocks',
        'mixin': '/base/test/web/assets/js/mixin',
        'mock': '/base/test/web/assets/js/mock'
    },
    shim: {
        'angular-mocks': ['angular']
    },

    // ask Require.js to load these files (all our tests)
    deps: tests,

    // start test run, once Require.js is done
    callback: window.__karma__.start
});
