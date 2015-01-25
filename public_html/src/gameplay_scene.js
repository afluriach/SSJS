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
        this.cameraLockedToPlayer = true;
        this.cameraScrollIntervalDelay = new IntervalDelay(
            0,
            this.scrollInterval,
            this.checkCameraScroll.bind(this)
        );
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
        
        inventory = new Inventory();
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
        
        if(keyPressed.pause && !this.isDialogActive() && !this.uiLayer.isInventoryOpen())
        {
            this.paused = !this.paused;
            
            if(this.paused)
                this.onPause();
            else
                this.onResume();
        }
        
        if(!this.paused && keyPressed.inventory)
        {
            this.uiLayer.toggleInventory();
        }
        
        if(this.isDialogActive())
        {
            this.uiLayer.dialogLayer.update();
            return;
        }
        
        if(this.paused || this.uiLayer.isInventoryOpen())
            return;
        
        if(keyPressed.cameraLock)
            this.cameraLockedToPlayer = !this.cameraLockedToPlayer;

        if(!this.cameraLockedToPlayer)
        {
            this.cameraScrollIntervalDelay.tick(true);
        }
        else
        {
            this.scrollCameraToTarget('player');
        }
        
        physics.update();
        gameObjectSystem.update();
    },
    scrollCameraToTarget: function(name)
    {
        var obj = gameObjectSystem.getByName(name);
        
        if(obj)
        {
            this.gameplayLayer.centerOnTilespacePos(obj.getPos());
        }
    },
    checkCameraScroll: function()
    {
        var pixelDist = this.scrollDistance*pixelsPerTile;
        
        var dx = 0;
        var dy = 0;
        
        if(controls.cameraLeft && !controls.cameraRight) dx = -pixelDist;
        else if(controls.cameraRight && !controls.cameraLeft) dx = pixelDist;
        
        if(controls.cameraDown && !controls.cameraUp) dy = -pixelDist;
        else if(controls.cameraUp && !controls.cameraDown) dy = pixelDist;
        
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
    moveGameplayLayerForShot: function(tileSize)
    {
        var hs = tileSize*pixelsPerTile/2;
        
        var dx = screenSize.width/2 - hs;
        var dy = screenSize.height/2 - hs;
        
        this.gameplayLayer.move(dx, dy);
    },
    unmoveGameplayLayerForShot: function(tileSize)
    {
        var hs = tileSize*pixelsPerTile/2;
        
        var dx = screenSize.width/2 - hs;
        var dy = screenSize.height/2 - hs;
        
        this.gameplayLayer.move(-dx, -dy);
    },
    getShot: function(sizeTiles)
    {
        this.moveGameplayLayerForShot(sizeTiles);
        var rtx = this.getScreenshot(sizeTiles*pixelsPerTile, sizeTiles*pixelsPerTile);
        this.unmoveGameplayLayerForShot(sizeTiles);

        return rtx;
    },
    getScreenshot: function(width, height)
    {
        var rtx = new cc.RenderTexture();
        rtx.initWithWidthAndHeight(width, height);
        rtx.begin();
        this.gameplayLayer.visit();
        rtx.end();
        
        return rtx;
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
