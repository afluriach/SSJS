//GameObject that uses an entity animation
var Entity = GameObject.extend({
    ctor: function(args, animationRes, layer)
    {
        this._super(args);
        
        this.sprite = new EntitySprite(animationRes);
        crntScene().gameplayLayer.addChild(this.sprite, layer);
        this.updateSpritePos();
    },
    update: function()
    {
        this.updateSpritePos();
    },
    updateSpritePos: function()
    {
        var pix = this.getPos().mult(pixelsPerTile);
        this.sprite.x = pix.x;
        this.sprite.y = pix.y;
    }
});
