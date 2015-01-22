//GameObject that uses an entity animation
var Entity = GameObject.extend({
    radius: 0.45,
    ctor: function(args, animationRes, layer)
    {
        args.circle = true;
        
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

var Player = Entity.extend({
    ctor: function(args, animationRes, layer)
    {
        this._super(args, animationRes,layer);
    },
    update: function()
    {
        this._super();
        this.updateDirection();
        this.applyMoveForce();
    },
    updateDirection: function()
    {
        var dir = getMoveVector();
        if(dir.len2() !== 0)
        {
            this.setAngle(dir.getAngle());
            this.sprite.setDirectionFromAngle(this.getAngle());
        }
    },
    //Find acceleration required to change current velocity to desired.
    applyMoveForce: function()
    {
        var desiredVelocity = getMoveVector().mult(this.speed);
        var accel = desiredVelocity.sub(this.getVel());
        var desiredForce = accel.getUnit().mult(this.acceleration*this.mass);

        //the amount that the velocity will change in one frame if full
        //acceleration is applied
        var dv = this.acceleration*secondsPerFrame;
        
        if(dv*dv > accel.len2())
        {
            //the motor force would overshoot the desired velocity
            this.setVel(desiredVelocity);
        }
        else
        {
            this.applyForceAsImpulse(desiredForce);
        }
    }
});
