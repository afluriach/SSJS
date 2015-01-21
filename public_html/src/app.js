//timing
var framesPerSecond = 30;
var secondsPerFrame = 1.0/framesPerSecond;

//global singleton classes
var physics;
var gameObjectSystem;

function init()
{
    screenSize = cc.director.getWinSize();
    activateMouseControls();
    activateKeyControls();
    
    cc.audioEngine.setMusicVolume(0.4);
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
