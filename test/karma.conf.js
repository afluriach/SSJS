var files = [];

var cocos_modules = [
    'core',
    'tmx',
    'chipmunk'
];

var sources = [
    "class",
    "math",
    "util",

    "controls",
    "graphics",
    "physics",

    "layer",
    "menu",
    "ui",
    "dialog_layer",
    "inventory",

    "app",
    "gameplay_scene",
    "gameplay_layer",
    "res",

    "game_object",
    "game_object_system",

    "ai",
    "entity",
    "environment",
    "sensor",
    "interaction",
    "spell",

    "gallery",
    "underworld"
];

for(var i=0;i<cocos_modules.length; ++i){
    files.push('cocos2d-js-v3.2/'+cocos_modules[i]+'.js');
}

for(var i=0;i<sources.length; ++i){
    files.push('src/'+sources[i]+'.js');
}

files.push('../test/*.test.js');

module.exports = function (config) {
    config.set({
        basePath: '../public_html/',
        files: files,
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
