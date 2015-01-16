function init()
{
    screenSize = cc.director.getWinSize();
}

function startGame()
{
    init();
    activateMouseControls();
    cc.director.runScene(new TitleScreen());
}

function crntScene()
{
    return cc.director.getRunningScene();
}
