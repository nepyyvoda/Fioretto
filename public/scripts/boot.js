require.config({
    baseUrl: '/scripts',
    paths: {
        knockout: 'libs/knockout.min',
        jquery: 'libs/jquery.min',
        materialize: 'libs/materialize.min'
        //materialize: 'libs/materialize.min',
        //bootstrap: 'libs/bootstrap.min'
    },
    shim: {
        'libs/sha256': {
            deps: ['jquery'],
            exports: 'CryptoJS'
        },
        'libs/bootstrap.min': {
            deps: ['jquery']
        },
        'libs/page': {
            exports: 'page'
        }
    },
    deps: ['./main']
});