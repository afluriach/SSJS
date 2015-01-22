var mapObjectGroups = [
    'agents',
    'doors',
    'logic',
    'environment'
];

var gameSceneLayers = {
    game: 1,
    ui: 2
};

var GameplayScene = cc.Scene.extend({
    scrollInterval: 0.1,
    scrollDistance: 1,
    onEnter: function(mapRes)
    {
        this._super();
        
        //instance fields
        this.lastScroll = 0;
        this.paused = false;
        
        //gameplay layer
        this.map = new cc.TMXTiledMap(mapRes);
        this.gameplayLayer = new GameplayLayer(this.map);
        this.addChild(this.gameplayLayer, gameSceneLayers.game);
        
        //ui layer
        this.uiLayer = new UILayer();
        this.addChild(this.uiLayer, gameSceneLayers.ui);
        
        //create new physics, create new game object system, and load objects
        physics = new Physics();
        gameObjectSystem = new GameObjectSystem();
        
        this.loadMapObjects();
        this.addWalls();
        gameObjectSystem.initAll();
        
        cc.director.getScheduler().scheduleUpdateForTarget(this, 0, false);
    },
    loadMapObjects: function()
    {
        for(var i=0;i<mapObjectGroups.length; ++i)
        {
            this.loadObjectGroup(mapObjectGroups[i]);
        }
        gameObjectSystem.handleAdditions();
    },
    loadObjectGroup: function(groupName)
    {
        var group = this.map.getObjectGroup(groupName);
        if(group === null)
        {
            cc.log('group ' + groupName + ' is not present');
            return;
        }
        
        var objects = group._objects;
        
        for(var i=0;i<objects.length; ++i)
        {
            this.loadObject(objects[i]);
        }
    },
    loadObject: function(mapObj)
    {
        //load object if type is a known class name
        if(window[mapObj.type])
        {
            var cls = window[mapObj.type];
            var gameObj = new cls(mapObj);

            var pos = mapObjToPhysicsPos(mapObj);
            cc.log("Loaded " + mapObj.name + ", " + mapObj.type + " at " + pos.x + "," + pos.y);

            gameObjectSystem.addObject(gameObj);
        }
        else
        {
            cc.log("Unknown object type: " + mapObj.type);
        }
    },
    handlePress: function(pos)
    {
        if(this.isDialogActive())
        {
            this.uiLayer.dialogLayer.handlePress(pos);
        }
    },
    onPause: function()
    {
        this.uiLayer.showPauseMsg();
        
        cc.audioEngine.pauseMusic();
        cc.audioEngine.pauseAllEffects();
    },
    onResume: function()
    {
        this.uiLayer.removePauseMsg();
        
        cc.audioEngine.resumeMusic();
        cc.audioEngine.resumeAllEffects();
    },
    update: function()
    {
        KeyListener.update();
        
        if(keyPressed.escape && !this.isDialogActive())
        {
            this.paused = !this.paused;
            
            if(this.paused)
                this.onPause();
            else
                this.onResume();
        }
        
        if(this.isDialogActive())
        {
            this.uiLayer.dialogLayer.update();
            return;
        }
        
        if(this.paused)
            return;
        
        this.lastScroll += secondsPerFrame;
        
        if(this.lastScroll >= this.scrollInterval)
        {
            if(this.checkCameraScroll())
                this.lastScroll = 0;
        }
        
        physics.update();
        gameObjectSystem.update();
    },
    checkCameraScroll: function()
    {
        var pixelDist = this.scrollDistance*pixelsPerTile;
        
        var dx = 0;
        var dy = 0;
        
        if(controls.j && !controls.l) dx = -pixelDist;
        else if(controls.l && !controls.j) dx = pixelDist;
        
        if(controls.k && !controls.i) dy = -pixelDist;
        else if(controls.i && !controls.k) dy = pixelDist;
        
        if(dx !== 0 || dy !== 0)
        {
            this.gameplayLayer.move(dx, dy);
            return true;
        }
        else
        {
            return false;
        }
    },
    addWalls: function()
    {
        var layer = this.map.getLayer('wall');
        if(!layer) return;

        //if getTileAt is null, there is no texture at that location
        for(var y =0; y < layer._layerSize.height; ++y)
        {
            for(var x = 0; x < layer._layerSize.width; ++x)
            {
                if(layer.getTileAt(x,y) !== null)
                {
                    physics.createWallTile(x,this.map._mapSize.height-y-1);
                }
            }
        }
    },
    setDialog: function(dialog)
    {
        this.uiLayer.dialogLayer.setDialog(dialog);
    },
    isDialogActive: function()
    {
        return this.uiLayer.dialogLayer.dialog !== null;
    }
});
