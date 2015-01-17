var gameLayers = {
    mapLayer: 1,
    floorLevel: 2,
    groundLevel: 3,
    airLevel: 4,
    uiLayer: 5
};

var GameplayScene = cc.Scene.extend({
    onEnter: function(mapRes)
    {
        this._super();
        
        //map layer
        this.map = new cc.TMXTiledMap(mapRes);
        this.addChild(this.map, gameLayers.mapLayer);
    }
});