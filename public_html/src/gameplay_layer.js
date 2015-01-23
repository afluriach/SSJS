var gameLayers = {
    map: 1,
    floor: 2,
    ground: 3,
    air: 4
};

//Contains the map and game object sprites; scrolls for camera effect.
var GameplayLayer = cc.Layer.extend({
    ctor: function(map)
    {
        this._super();
        
        this.map = map;
        this.addChild(this.map, gameLayers.map);
    },
    move: function(dx, dy)
    {
        this.setPosition(this.getPositionX()-dx, this.getPositionY()-dy);
    },
    centerOnTilespacePos: function(pos)
    {
        this.setPosition(screenSize.width/2-pixelsPerTile*pos.x, screenSize.height/2-pixelsPerTile*pos.y);
    }
});
