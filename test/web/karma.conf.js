module.exports = function (config) {
    "use strict";

    config.set({
        basePath: '../../',
        browsers: [process.env.CI ? 'PhantomJS' : 'Chrome'],
        singleRun: true,
        files: [
            // bower components
            {pattern: 'web/assets/bower_components/requirejs-text/text.js', included: false},
            {pattern: 'web/assets/bower_components/lodash/dist/lodash.min.js', included: false},
            {pattern: 'web/assets/bower_components/angular/angular.min.js', included: false},
            {pattern: 'web/assets/bower_components/jquery/dist/jquery.min.js', included: false},
            {pattern: 'web/assets/bower_components/angular-mocks/angular-mocks.js', included: false},

            // dionysos application files
            {pattern: 'web/assets/js/**/component/**/*.js', included: false},
            {pattern: 'web/assets/js/app/**/view/**/*.html', included: false},

            // test files
            {pattern: 'test/**/*Spec.js', included: false},
            {pattern: 'test/web/assets/js/mixin.js', included: false},
            {pattern: 'test/web/assets/js/mock/**/*.js', included: false},
            {pattern: 'test/web/assets/js/fixture/**/*.js', included: false},

            // require configuration files
            'web/assets/js/common.js',
            'web/assets/js/phpcr-browser.js',

            // test application file
            'test/web/assets/js/app-test.js'
        ],
        frameworks: ['requirejs', 'jasmine']
    });
};
