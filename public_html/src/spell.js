var IceBlastBullet = GameObject.extend({
    mass: 0.3,
    speed: 6,
    radius: 0.4,
    fadeTime: 0.5,
    ctor: function(pos, angle)
    {
        var args = {};
        args.layer = PhysicsLayer.ground;
        args.group = PhysicsGroup.playerProjectile;
        args.name = 'ice_blast';
        args.type = 'IceBlastBullet';
        args.pos = pos;
        args.circle = true;
        args.sensor = false;
        
        this._super(args);
        
        this.sprite = this.createSprite(res.sprite.ice_blast, gameLayers.ground);
        this.setVel(Vector2.ray(this.speed,angle));
    },
    onHit: function()
    {
        gameObjectSystem.removeObject(this);
        var fadeAndRemove = cc.sequence(
            cc.fadeOut(this.fadeTime),
            cc.removeSelf()
        );
        cc.director.getActionManager().addAction(fadeAndRemove, this.sprite, false);
    },
    onHitWall: function()
    {
        this.onHit();
    },
    update: function()
    {
        this.updateSpritePos();
    }
});

var IceBlast = {
    cooldown: 1.5,
    spawnBlastDistance: 0.75,
    cast: function(player){
        var pos = player.getFacingPoint(this.spawnBlastDistance, player.getAngle());
        var blast = new IceBlastBullet(pos, player.getAngle());
        
        gameObjectSystem.addObject(blast);
    }
};

var SpiritCamera = {
    photoSize: 8,
    photoDistance: 1.5,
    cooldown: 0,
    cast: function(player){
        var photoPos = player.getFacingPoint(this.photoDistance + this.photoSize/2);
        inventory.addPhoto(new Photo(this.photoSize, photoPos, player));
    }
};

var Photo = Class.extend({
    //Store these properties if the photographed object has them.
    objectProperties: ['color'],
    ctor: function(photoSize, photoPos, player)
    {
        var photoBB = makeBB(photoPos, photoSize, photoSize);
        this.photoPos = photoPos;
        
        this.texture = crntScene().getShot(photoSize, photoPos);
        var objects = physics.getObjectsEnclosedInArea(photoBB, PhysicsLayer.all, 0, player);
        this.savePhotographedObjects(objects);
    },
    savePhotographedObjects: function(objects)
    {
        this.objects = [];
        
        for(var i=0;i<objects.length; ++i)
        {
            this.objects.push(this.makePhotoObject(objects[i]));
        }
    },
    makePhotoObject: function(obj)
    {
        var photoObj = {
            name: obj.name,
            type: obj.type,
            //Store the relative position in the photo.
            pos: obj.getPos().sub(this.photoPos)
        };
        
        for(var i=0;i<this.objectProperties.length; ++i)
        {
            var prop = this.objectProperties[i];
            if(isDefined(obj[prop]))
                photoObj[prop] = obj[prop];
        }
        
        return photoObj;
    }
});
