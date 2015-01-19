var GameObject = Class.extend({
    ctor: function(args)
    {
        this.name = args.name;
        this.type = args.type;
        
        this.createPhysicsBody(args);
    },
    //check parameters and create physics body
    createPhysicsBody: function(args)
    {
        var pos = mapObjToPhysicsPos(args);
        
        if(!args.mass)
        {
            args.mass = -1;
            cc.log(this.name + ': undefined or zero mass, defaulting to static');
        }
        if(!args.group)
        {
            args.group = PhysicsGroup.environment;
            cc.log(this.name + ': physics group not specified, defaulting to environment');
        }
        if(!args.layer)
        {
            args.layer = PhysicsLayer.ground;
            cc.log(this.name + ': physics layer not specified, defaulting to ground');
        }
        if(!isDefined(args.sensor))
        {
            args.sensor = false;
            cc.log(this.name + ': sensor not defined, defaulting to false');
        }
        
        //args represents a rectangle map object
        if(args.width && args.height)
        {
            //map dimensions must be converted from pixels
            var width = args.width*tilesPerPixel;
            var height =args.height*tilesPerPixel;
            
            this.physicsBody = physics.createRectBody
            (
                pos,
                width,
                height,
                args.mass,
                this,
                args.group,
                args.layer,
                args.sensor
            );
        }
    },
    getPos : function()
    {
        return Vector2.copy(this.physicsBody.getPos());
    },
    
    getPosPixels: function()
    {
        return this.getPos().mult(pixelsPerTile);
    },

    //create sprite, position it, and add it to the gameplay layer
    createSprite: function(res, layer)
    {
        if(!res)
        {
            cc.log('GameObject.createSprite with undefined resource.');
            return;
        }
        
        var sprite = cc.Sprite.create(res);
        
        var pix = this.getPosPixels();
        sprite.x = pix.x;
        sprite.y = pix.y;
        
        crntScene().gameplayLayer.addChild(sprite, layer);
        
        return sprite;
    },
    //Whether the physics body's physical presence will be considered in
    //collisions (i.e. whether it blocks movement of another object).
    setSensor: function(sensor)
    {
        this.physicsBody.shape.setSensor(sensor);
    }
});