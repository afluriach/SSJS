var MenuScene = cc.Scene.extend({
    onEnter: function()
    {
        this._super();
        
        this.textLayer = new TextLayer();
        this.addChild(this.textLayer, 1);
    },
    handlePress: function(pos)
    {
        this.textLayer.handlePress(pos);
    },
    onExit: function()
    {
        this.textLayer.removeFromParent();
    }
});

var TitleScreen = MenuScene.extend({
    onEnter: function()
    {
        this._super();
        
        this.titleLabel = this.textLayer.addLabel('Shrouded Sun', 'title', screenCenter());
    },
    handlePress: function(pos)
    {
        cc.director.pushScene(new MainMenu());
    }
});

var MainMenu = MenuScene.extend({
    onEnter: function()
    {
        this._super();
        
        this.textLayer.addLabel(
            'Shrouded Sun',
            'title',
            new Vector2(screenSize.width/2, screenSize.height - 100)
        );

        this.textLayer.addLabel(
            'Level Select',
            'level select',
            new Vector2(100, screenSize.height - 250),
            function(){
                cc.director.pushScene(new LevelSelectMenu());
            }
        );

        this.textLayer.addLabel(
            'Back',
            'back',
            new Vector2(screenSize.width/2, 100),
            function(){
                cc.director.popScene();
            }
        );
    }
});

var LevelSelectMenu = MenuScene.extend({
    onEnter: function()
    {
        this._super();
        
        this.textLayer.addLabel(
            'Level Select',
            'level select',
            new Vector2(screenSize.width/2, screenSize.height - 100)
        );

        this.textLayer.addLabel(
            'Winged Swarm',
            'winged swarm',
            new Vector2(screenSize.width/2, screenSize.height - 200),
            function(){
                cc.director.runScene(new WingedSwarm());
            }
        );

        this.textLayer.addLabel(
            'Gallery',
            'gallery',
            new Vector2(screenSize.width/2, screenSize.height - 250),
            function(){
                cc.director.runScene(new GalleryScene());
            }
        );

        this.textLayer.addLabel(
            'Back',
            'back',
            new Vector2(screenSize.width/2, 100),
            function(){
                cc.director.popScene();
            }
        );
    }
});