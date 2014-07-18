define([
    'text!../locale/en_UK.json',
    'text!../locale/fr_FR.json',
], function (en_UK, fr_FR) {
    "use strict";

    function loadLocales($translateProvider) {
        $translateProvider
            // .useCookieStorage()
            .translations('en', JSON.parse(en_UK))
            .translations('fr', JSON.parse(fr_FR))
            .fallbackLanguage('en')
            .registerAvailableLanguageKeys(['en', 'fr'], {
                'en_US': 'en',
                'en_UK': 'en',
                'fr_FR': 'fr',
                'de_DE': 'en',
                'it_IT': 'en'
            })
            .determinePreferredLanguage();
    }

    loadLocales.$inject = ['$translateProvider'];

    return loadLocales;
});

