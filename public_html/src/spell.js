var IceBlastBullet = GameObject.extend({
    mass: 0.3,
    speed: 6,
    radius: 0.4,
    nextID: 1,
    fadeTime: 0.5,
    ctor: function(pos, angle)
    {
        var args = {};
        args.layer = PhysicsLayer.ground;
        args.group = PhysicsGroup.playerProjectile;
        args.name = 'ice_blast'+this.nextID++;
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
        gameObjectSystem.removeObject(this.name);
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
        var pos = player.getPos().add(Vector2.ray(this.spawnBlastDistance, player.getAngle()));
        var blast = new IceBlastBullet(pos, player.getAngle());
        
        gameObjectSystem.addObject(blast);
    }
};

var SpiritCamera = {
    cameraSize: 8,
    cooldown: 0,
    cast: function(player){
        inventory.addPhoto(crntScene().getShot(8));
    }
};
