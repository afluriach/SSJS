//GameObject that uses an entity animation
var Entity = GameObject.extend({
    radius: 0.45,
    stepSize: 0.3,
    ctor: function(args, animationRes, layer)
    {
        args.circle = true;
        
        this._super(args);
        
        this.sprite = new EntitySprite(animationRes);
        crntScene().gameplayLayer.addChild(this.sprite, layer);
        this.updateSpritePos();
        
        this.stepAccumulator = new Accumulator(0,this.stepSize, this.stepAnimation.bind(this));
        this.leftStep = false;
    },
    update: function()
    {
        this.updateSpritePos();
        this.updateStep();
    },
    updateSpritePos: function()
    {
        var pix = this.getPos().mult(pixelsPerTile);
        this.sprite.x = pix.x;
        this.sprite.y = pix.y;
    },
    updateStep: function()
    {
        var speed = this.getVel().len();
        
        if(speed === 0)
        {
            this.sprite.setFrame(1);
            this.stepAccumulator.set(0);
        }
        else
        {
            //accumulate distance moved in the last frame
            this.stepAccumulator.add(speed*secondsPerFrame);
        }
    },
    stepAnimation: function()
    {
        switch(this.sprite.frame)
        {
            case 0:
                this.sprite.setFrame(1);
                this.leftStep = false;
                break;
            case 1:
                this.sprite.setFrame(this.leftStep ? 0 : 2);
                break;
            case 2:
                this.sprite.setFrame(1);
                this.leftStep = true;
        }
    }
});

var Player = Entity.extend({
    interactFeelerLength: 2.5,
    ctor: function(args, animationRes, layer)
    {
        this._super(args, animationRes,layer);
        
        this.interactible = null;
    },
    update: function()
    {
        this._super();
        this.updateDirection();
        this.applyMoveForce();
        
        //check interaction
        var interactObj = this.getInteractible();
        this.updateInteractMessage(interactObj);
        if(interactObj !== null && keyPressed.forwardslash)
            this.interact(interactObj);
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
    },
    getInteractible: function()
    {
        return physics.objectFeeler(
            this.getPos(),
            this.interactFeelerLength,
            this.getAngle(),
            PhysicsLayer.all,
            PhysicsGroup.player);
    },
    updateInteractMessage: function(obj)
    {
        var msg = '';
        
        if(obj !== null)
        {
            for(var i=0;i<this.actions.length; ++i)
            {
                var action = this.actions[i];

                if(action.canInteract(this, obj))
                {
                    msg = action.msg;
                    break;
                }
            }
        }
        crntScene().uiLayer.setInteractMessage(msg);
    },
    interact: function(obj)
    {
        if(!this.actions) return;
        
        for(var i=0;i<this.actions.length; ++i)
        {
            var action = this.actions[i];

            if(action.canInteract(this, obj))
                action.interact(this, obj);
        }
    }
});
