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
    },
    moveForPhoto: function(sizeTiles, center)
    {
        var hs = sizeTiles*pixelsPerTile/2;
        var dx = screenSize.width/2 - hs;
        var dy = screenSize.height/2 - hs;
        
        this.oldPos = {x: this.x, y: this.y};
        
        this.setPosition(screenSize.width/2-pixelsPerTile*center.x-dx,
                         screenSize.height/2-pixelsPerTile*center.y-dy);
    },
    unmove: function()
    {
        this.setPosition(this.oldPos.x, this.oldPos.y);
    }
});
