module.exports = function (config) {
    config.set({
        basePath: '../',
        files: [
            'public_html/src/class.js',
            'public_html/src/util.js',
            'test/*.test.js'
        ],
        exclude: [
        ],
        autoWatch: true,
        frameworks: [
            'jasmine'
        ],
        browsers: [
            'Chrome'
        ],
        plugins: [
            'karma-jasmine',
            'karma-chrome-launcher'
        ]
    });
};
