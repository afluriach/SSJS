//GameObject that uses an entity animation
var Entity = GameObject.extend({
    radius: 0.45,
    stepSize: 0.3,
    ctor: function(args, animationRes, layer)
    {
        args.circle = true;
        args.sensor = false;
        
        this._super(args);
        
        this.sprite = new EntitySprite(animationRes);
        crntScene().gameplayLayer.addChild(this.sprite, layer);
        this.updateSpritePos();
        
        if(args.facing)
        {
            this.setDirectionAngle(standardAngleRad(Vector2[args.facing].getAngle()));
        }
        
        this.stepAccumulator = new Accumulator(0,this.stepSize, this.stepAnimation.bind(this));
        this.leftStep = false;
        
        this.fsm = null;
    },
    init: function()
    {
        if(this.fsm !== null)
            this.fsm.init();
    },
    onHit: function(obj)
    {
        if(this.fsm)
            this.fsm.onHit(obj);
    },
    update: function()
    {
        this.updateSpritePos();
        this.updateStep();
        
        if(this.fsm !== null)
            this.fsm.update();
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
    },
    obstacleFeeler: function(distance, angle)
    {
        return physics.obstacleFeeler(
            this.getPos(),
            distance + this.radius,
            angle,
            PhysicsLayer.ground,
            0,
            this
        );
    },
    setDirection: function(dir)
    {
        this.sprite.setDirection(dir);
        this.setAngle(dir*Math.PI/4);
    },
    setDirectionAngle: function(rad)
    {
        this.setAngle(rad);
        
        rad += Math.PI/8;
        rad = standardAngleRad(rad);
        var dir = Math.floor(rad / Math.PI*4);
        
        this.sprite.setDirection(dir);
    },
    //Apply motor force based on current and desired velocity.
    applyDesiredVelocity: function(desiredVelocity)
    {
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

var Player = Entity.extend({
    interactFeelerLength: 1,
    //displacement from the player's center where the item will be held
    holdDist: 0.2,
    placeDist: 1,
    ctor: function(args, animationRes, layer)
    {
        args.group = PhysicsGroup.player;

        this._super(args, animationRes,layer);
        
        this.interactible = null;
        this.holdingItem = null;
    },
    update: function()
    {
        this._super();
        this.updateDirection();
        this.applyMoveForce();

        if(this.holdingItem)
        {
            var canDrop = this.canDrop();
            crntScene().uiLayer.setInteractMessage(canDrop ? 'Drop' : '');
            this.holdingItem.setPos(this.grabPos());
            
            if(keyPressed.action && canDrop)
                this.drop();
        }
        else
        {
            //check interaction
            var interactObj = this.getInteractible();
            this.updateInteractMessage(interactObj);
            if(interactObj !== null && keyPressed.action)
                this.interact(interactObj);
        }
        this.spellInterval.tick(keyPressed.spell);
    },
    setSpell: function(spell){
        //If cooldown was in effect for an existing spell, carry it to this one
        //Thus cooldown cannot be avoided by switching spells.
        var cooldown = this.spellInterval ? Math.max(this.spellInterval.remaining, 0) : 0;
        
        this.spellInterval = new IntervalDelay(
            cooldown,
            spell.cooldown,
            spell.cast.bind(spell, this)
        );
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
        this.applyDesiredVelocity(getMoveVector().mult(this.speed));
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
    },
    grab: function(obj)
    {
        this.holdingItem = obj;
        
        obj.sprite.removeFromParent();
        crntScene().gameplayLayer.addChild(obj.sprite, gameLayers.air);
        
        obj.setPos(this.grabPos());
        obj.setSensor(true);
    },
    grabPos: function()
    {
        return this.getPos().add(Vector2.ray(this.holdDist, this.getAngle()));
    },
    dropPos: function()
    {
        return this.getPos().add(Vector2.ray(this.placeDist, this.getAngle()));
    },
    canDrop: function()
    {
        return !physics.isObjectPresentInArea(makeBB(this.dropPos(), 1, 1), PhysicsLayer.ground, 0, null);
    },
    drop: function()
    {
        this.holdingItem.sprite.removeFromParent();
        crntScene().gameplayLayer.addChild(this.holdingItem.sprite, gameLayers.ground);
        
        this.holdingItem.setPos(this.dropPos());
        this.holdingItem.setSensor(false);
        
        this.holdingItem = null;
    }
});

var NPC = Entity.extend({
    mass: Infinity,
    ctor: function(args, spriteRes)
    {
        this._super(args, spriteRes, gameLayers.ground);
    },
    onTalk: function()
    {
        crntScene().setDialog(this.dialog);
    }
});
