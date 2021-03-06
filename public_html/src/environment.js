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

var DynamicEnvironmentGroundObject = GameObject.extend({
    ctor: function(args, spriteRes)
    {
        args.group = PhysicsGroup.environment;
        args.layer = PhysicsLayer.ground;
        args.sensor = false;
        this._super(args);
        
        this.sprite = this.createSprite(spriteRes, gameLayers.ground);
    },
    update: function()
    {
        this.updateSpritePos();
        this.applyKineticFriction();
    }
});

var Jar = DynamicEnvironmentGroundObject.extend({
    mass: 0.5,
    kineticFriction: 0.8,
    radius: 0.35,
    ctor: function(args)
    {
        this.color = args.color;
        args.circle = true;
        this._super(args, res.sprite[this.color+'_jar']);
    },
    grabbable: function()
    {
        return true;
    }
});
