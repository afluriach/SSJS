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
            'Options',
            'options',
            new Vector2(100, screenSize.height - 350),
            function(){
                cc.director.pushScene(new OptionMenu());
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

var IntegerSlider = cc.Node.extend({
    ctor: function(min, max, init)
    {
        this._super();
        
        this.slider = new cc.ControlSlider(
            res.sprite.slider_background,
            res.sprite.slider_foreground,
            1
        );

        this.textLayer = new TextLayer();
        var valueLabel = this.textLayer.addLabel(Math.floor(init).toString(), 'value', new Vector2(250,-0));

        this.slider.maxAllowedValue = max;
        this.slider.minAllowedValue = min;
        this.slider.value = init/max;
        
        this.addChild(this.slider,1);
        this.addChild(this.textLayer,1);
        
        var thisSlider = this;
        
        this.slider.onValueChanged = function(value)
        {
            var intVal = Math.floor(value*max);
            valueLabel.setString(intVal.toString());
            
            if(thisSlider.onValueChanged)
            {
                thisSlider.onValueChanged(intVal);
            }
        };
    }
});

var OptionMenu = MenuScene.extend({
    onEnter: function()
    {
        this._super();

        this.textLayer.addLabel(
            'Options',
            'title',
            new Vector2(screenSize.width/2, screenSize.height - 50)
        );
        
        this.bgm = new IntegerSlider(0,100, options.bgmVolume*100);
        this.bgm.x = 250;
        this.bgm.y = screenSize.height - 150;
        this.addChild(this.bgm, 1);
        
        this.bgm.onValueChanged = function(val)
        {
            options.bgmVolume = val/100;
        };
        
        this.textLayer.addLabel(
            'Back',
            'back',
            new Vector2(screenSize.width/2, screenSize.height - 250),
            function(){
                saveOptions();
                applyOptions();
                cc.director.popScene();
            }
        );

    }
});
