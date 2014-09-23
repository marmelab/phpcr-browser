require.config({
    paths: {
        'text' : '../bower_components/requirejs-text/text',
        'MainModule': 'app/Main/MainModule',
        'BrowserModule': 'app/Browser/BrowserModule',
        'GraphModule': 'app/Graph/GraphModule',
        'TreeModule': 'app/Tree/TreeModule'
    },
    shim: {
    },
    modules: [
        {
            name: 'phpcr-browser',
            include: [
                'text',
                'MainModule',
                'BrowserModule',
                'GraphModule',
                'TreeModule'
            ],
            exclude: [
                'common'
            ]
        }
    ]
});
