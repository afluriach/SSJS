//scenes
var WingedSwarm = GameplayScene.extend({
    onEnter: function()
    {
        this._super(res.map.winged_swarm);
        cc.audioEngine.playMusic(res.track.see, true);
        this.uiLayer.setSpellIcon(res.sprite.ice_blast);
        
        this.spiritsContained = 0;
    }
});

//objects
var UnderworldDoor = Door.extend({
    ctor: function(args)
    {
        this._super(
            args,
            res.sprite.underworld_door_unlocked,
            res.sprite.underworld_door_locked,
            true);
    }
});

var CellDoor = Barrier.extend({
    ctor: function(args)
    {
        this._super(args, res.sprite.cell_door, false);
    }
});

var CellSensor = AreaSensor.extend({
    ctor: function(args)
    {
        this._super(args);
        
        this.occupancy = 0;
        this.playerPresent = false;
        this.closed = false;
    },
    init: function()
    {
        //Get the barrier with the same number as this sensor.
        this.barrier = gameObjectSystem.getByName('bar' + this.name.split('sensor')[1]);
    },
    onDetect: function(obj)
    {
        if(obj.name === 'player')
        {
            this.playerPresent = true;
        }
        else
        {
            ++this.occupancy;
        }
    },
    onEndDetect: function(obj)
    {
        if(obj.name === 'player')
        {
            this.playerPresent = false;
        }
        else
        {
            --this.occupancy;
        }
    },
    update: function()
    {
        if(this.occupancy > 0 &&
           !this.closed &&
           !this.playerPresent &&
           !this.barrier.isBlocked())
        {
            this.barrier.setLocked(true);
            this.closed = true;
            crntScene().spiritsContained += this.occupancy;
        }
    }
});

var WingedSwarmGatekeeper = Entity.extend({
    mass: Infinity,
    ctor: function(args)
    {
        this._super(args, res.entity.komachi, gameLayers.ground);
        this.setDirection(4);
    },
    onTalk: function()
    {
        crntScene().setDialog(crntScene().spiritsContained < 10 ? WingedSwarmBefore : WingedSwarmAfter);
    }
});

var WingedSwarmSpirit = Entity.extend({
    mass: 3,
    radarRadius: 3,
    acceleration: 5,
    speed: 5,
    ctor: function(args)
    {
        args.layer = PhysicsLayer.ground;
        args.group = PhysicsGroup.agent;
        this._super(args, res.entity.flandre, gameLayers.ground);
        
        this.radar = new Radar(this, this.radarRadius, PhysicsLayer.ground);
    },
    onHit: function(obj)
    {
        if(obj instanceof IceBlast)
        {
            this.freezeTime = 4.5;
            this.sprite.setAnimation(res.entity.flandre_frozen);
        }
    },
    onDetect: function(obj)
    {
        if(obj.name === 'player')
        {
            this.player = obj;
        }
    },
    onEndDetect: function(obj)
    {
        if(obj.name === 'player')
        {
            delete this.player;
        }
    },
    update: function()
    {
        this._super();
        
        if(this.freezeTime)
        {
            this.freezeTime -= secondsPerFrame;
            this.stepAccumulator.set(0);
            
            if(this.freezeTime < 0)
            {
                this.sprite.setAnimation(res.entity.flandre);
                delete this.freezeTime;
            }
            else if(this.freezeTime < 2)
                this.sprite.setAnimation(res.entity.flandre_frozen_ending);
        }
        
        else if(isDefined(this.player))
        {
            //flee
            var dir = this.getPos().sub(this.player.getPos()).getUnit();
            this.applyDesiredVelocity(dir.mult(this.speed));
            this.setDirectionAngle(dir.getAngle());
        }
    },
    grabbable: function()
    {
        return isDefined(this.freezeTime);
    }
});

var IceBlast = GameObject.extend({
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
        args.type = 'IceBlast';
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

var UnderworldCirno = Player.extend({
    actions: [Talk, Grab],
    mass: 3,
    speed: 3,
    acceleration: 4.5,
    spellInterval: 1.5,
    spawnBlastDistance: 0.75,
    ctor: function(args)
    {
        args.layer = PhysicsLayer.ground;
        args.group = PhysicsGroup.player;

        this._super(args, res.entity.cirno, gameLayers.ground);
        
        this.spellDelayInterval = new IntervalDelay(
            0,
            this.spellInterval,
            this.iceBlast.bind(this)
        );

        this.setDirection(2);
    },
    update: function()
    {
        this._super();
        this.spellDelayInterval.tick(keyPressed.spell);
    },
    iceBlast: function()
    {
        var pos = this.getPos().add(Vector2.ray(this.spawnBlastDistance, this.getAngle()));
        var blast = new IceBlast(pos, this.getAngle());
        
        gameObjectSystem.addObject(blast);
    }
});

//dialogs
var WingedSwarmBefore = [
    ['Komachi', 'I cannot open the barrier with this swarm of winged monsters flying about.'],
    ['Cirno', 'They are annoying, but they seem harmless.'],
    ['Komachi', 'They may seem, but do not let looks deceive. These vampires would wreak havoc if they were to escape to the next level of the underworld.'],
    ['Cirno', 'The underworld? Is that what this place is?'],
    ['Komachi', 'I just want to pick these spirits up and throw them.']
];

var WingedSwarmAfter = [
    ['Komachi', 'Sometimes I wish I had ice powers.'],
    ['Cirno', 'Yeah, aren\'t they the greatest?'],
    ['Komachi', 'In any case, the troublesome spirits have been contained'],
    ['Komachi', '...'],
    ['Komachi', 'Some things can\'t be tamed with ice.']
];
