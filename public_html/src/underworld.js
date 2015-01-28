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

var WingedSwarmGatekeeper = NPC.extend({
    ctor: function(args)
    {
        this._super(args, res.entity.komachi);
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
    
    walkDist: new Range(1,3),
    walkDelay: new Range(0.5, 1,5),
    walkSpeed: new Range(1,3),
    
    ctor: function(args)
    {
        args.layer = PhysicsLayer.ground;
        args.group = PhysicsGroup.agent;
        this._super(args, res.entity.flandre, gameLayers.ground);
        
        this.radar = new Radar(this, this.radarRadius, PhysicsLayer.ground, PhysicsGroup.playerSensor);
        this.fsm = new StateMachine(this, new RandomWalk(this.walkDist, this.walkDelay, this.walkSpeed));
    },
    onHit: function(obj)
    {
        this._super(obj);
        if(obj instanceof IceBlastBullet)
        {
            this.freezeTime = 4.5;
            this.sprite.setAnimation(res.entity.flandre_frozen);
            this.fsm.paused = true;
        }
    },
    onDetect: function(obj)
    {
        this.fsm.setState(new Flee(obj));
    },
    onEndDetect: function(obj)
    {
        this.fsm.setState(new RandomWalk(this.walkDist, this.walkDelay, this.walkSpeed));
    },
    update: function()
    {
        this._super();
        
        if(isDefined(this.freezeTime))
        {
            this.freezeTime -= secondsPerFrame;
            this.stepAccumulator.set(0);
            this.applyDesiredVelocity(Vector2.zero);
            
            if(this.freezeTime < 0)
            {
                this.sprite.setAnimation(res.entity.flandre);
                delete this.freezeTime;
                this.fsm.paused = false;
            }
            else if(this.freezeTime < 2)
                this.sprite.setAnimation(res.entity.flandre_frozen_ending);
        }
    },
    grabbable: function()
    {
        return isDefined(this.freezeTime);
    }
});

var UnderworldCirno = Player.extend({
    actions: [Talk, Grab],
    mass: 3,
    speed: 3,
    acceleration: 4.5,
    ctor: function(args)
    {
        args.layer = PhysicsLayer.ground;
        
        this._super(args, res.entity.cirno, gameLayers.ground);
        this.setSpell(IceBlast);
    },
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
