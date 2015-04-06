//timing
var framesPerSecond = 30;
var secondsPerFrame = 1.0/framesPerSecond;

//global singleton classes
var physics;
var gameObjectSystem;
var intenvory;

var options;

var defaultOptions = {
    bgmVolume: 0.4
};

function init()
{
    screenSize = cc.director.getWinSize();
    activateMouseControls();
    activateKeyControls();
    loadOptions();
    applyOptions();
}

function loadOptions()
{
    if(isDefined(localStorage.options))
    {
        options = JSON.parse(localStorage.options);
    }
    else
    {
        options = defaultOptions;
    }
}

function saveOptions()
{
    localStorage.options = JSON.stringify(options);
}

function applyOptions()
{
    cc.audioEngine.setMusicVolume(options.bgmVolume);
}

function startGame()
{
    init();
    cc.director.runScene(new TitleScreen());
}

function crntScene()
{
    return cc.director.getRunningScene();
}
