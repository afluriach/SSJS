var Door = GameObject.extend({
    ctor: function(args, sprite_unlocked, sprite_locked, locked)
    {
        args.group = PhysicsGroup.environment;
        args.layer = PhysicsLayer.all;
        args.mass = -1;
        args.sensor = false;
        
        this._super(args);
        this.sprite_unlocked = sprite_unlocked;
        this.sprite_locked = sprite_locked;
        this.sprite = this.createSprite(this.sprite_locked, gameLayers.ground);
        
        this.setLocked(locked);
    },
    setLocked: function(bool)
    {
        this.locked = bool;
        this.sprite.setTexture(bool ? this.sprite_locked : this.sprite_unlocked);
    }
});

//A barrier does not have any visual presence when unlocked. Use sensor flag
//to avoid colliding when unlocked.
var Barrier = GameObject.extend({
    ctor: function(args, sprite, locked)
    {
        args.group = PhysicsGroup.environment;
        args.layer = PhysicsLayer.all;
        args.mass = -1;
        args.sensor = !locked;
        
        this._super(args);
        
        this.sprite = this.createSprite(sprite, gameLayers.ground);
        this.setLocked(locked);
    },
    setLocked: function(bool)
    {
        this.locked = bool;
        this.sprite.setVisible(bool);
        this.setSensor(!bool);
    },
    isBlocked: function()
    {
        //Check for objects in all groups.
        return physics.isObjectPresentInArea(this.getBB(), PhysicsLayer.all, 0, this);
    }
});
