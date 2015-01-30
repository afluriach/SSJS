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
    debugPhysics: false,
    debugEntities: false,
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
        
        if(this.debugPhysics)
        {
            this.physicsNode = new cc.PhysicsDebugNode(physics.space);
            this.physicsNode.setScale(pixelsPerTile);
            this.gameplayLayer.addChild(this.physicsNode, gameLayers.physics);
        }
        
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

        var horizontalTiles = {};
        var mapWidth = layer._layerSize.width;
        var mapHeight = layer._layerSize.height;

        //Start by considering consecutive horizontal pieces.
        for(var y =0; y < mapHeight; ++y)
        {
            for(var x = 0; x < mapWidth;)
            {
                if(layer.getTileAt(x,y) === null){
                    ++x;
                    continue;
                }
                
                var width = 1;
                while(x+width < mapWidth && layer.getTileAt(x+width,y) !== null){
                    ++width;
                }
                
                if(width > 1){
                    for(var i=0;i<width; ++i){
                        horizontalTiles[mapWidth*y+x+i] = true;
                    }
                    physics.createHorizontalWallTile(x,this.map._mapSize.height-y-1, width);
                }
                x += width;
            }
        }

        //Add vertical tiles, including single height tiles but skipping those
        //that were part of a horizontal.
        for(var x=0; x < mapWidth; ++x)
        {
            for(var y=0; y< mapHeight;)
            {
                if(layer.getTileAt(x,y) === null || horizontalTiles[mapWidth*y+x]){
                    ++y;
                    continue;
                }

                var height = 0;

                while(y+height < mapHeight &&
                      layer.getTileAt(x,y+height) !== null &&
                      !horizontalTiles[mapWidth*(y+height)+x]){
                        ++height;
                }

                physics.createVerticalWallTile(x, mapHeight-y-height, height);
                y += height;
            }
        }
    },
    getShot: function(sizeTiles, center)
    {
        this.gameplayLayer.moveForPhoto(sizeTiles, center);
        var rtx = this.getScreenshot(sizeTiles*pixelsPerTile, sizeTiles*pixelsPerTile);
        this.gameplayLayer.unmove(sizeTiles, center);

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
