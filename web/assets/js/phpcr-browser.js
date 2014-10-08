require.config({
    paths: {
        'BrowserModule': 'app/Browser/BrowserModule',
        'GraphModule': 'app/Graph/GraphModule',
        'MainModule': 'app/Main/MainModule',
        'text' : '../bower_components/requirejs-text/text',
        'TreeModule': 'app/Tree/TreeModule'
    },
    shim: {
    },
    modules: [
        {
            name: 'phpcr-browser',
            include: [
                'BrowserModule',
                'GraphModule',
                'MainModule',
                'text',
                'TreeModule'
            ],
            exclude: [
                'common'
            ]
        }
    ]
});
