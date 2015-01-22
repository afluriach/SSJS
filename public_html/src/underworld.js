//scenes
var WingedSwarm = GameplayScene.extend({
    onEnter: function()
    {
        this._super(res.winged_swarm_map);
        cc.audioEngine.playMusic(res.see_track, true);
    }
});

//objects
var UnderworldDoor = Door.extend({
    ctor: function(args)
    {
        this._super(
            args,
            res.underworld_door_unlocked_sprite,
            res.underworld_door_locked_sprite,
            true);
    }
});

var CellDoor = Barrier.extend({
    ctor: function(args)
    {
        this._super(args, res.cell_door_sprite, false);
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
        }
    }
});

var WingedSwarmGatekeeper = Entity.extend({
    mass: Infinity,
    ctor: function(args)
    {
        this._super(args, res.komachi_entity, gameLayers.ground);
        this.sprite.setDirection(4);
    },
    onTalk: function()
    {
        crntScene().setDialog(WingedSwarmBefore);
    }
});

var WingedSwarmSpirit = Entity.extend({
    mass: 3,
    ctor: function(args)
    {
        args.layer = PhysicsLayer.ground;
        args.group = PhysicsGroup.agent;
        this._super(args, res.flandre_entity, gameLayers.ground);
    }
});

var UnderworldCirno = Player.extend({
    actions: [Talk],
    mass: 3,
    speed: 3,
    acceleration: 4.5,
    ctor: function(args)
    {
        args.layer = PhysicsLayer.ground;
        args.group = PhysicsGroup.player;

        this._super(args, res.cirno_entity, gameLayers.ground);
    }
});

//dialogs
var WingedSwarmBefore = [
    ['Komachi', 'I cannot open the barrier with this swarm of winged monsters flying about.'],
    ['Cirno', 'They are annoying, but they seem harmless.'],
    ['Komachi', 'They may seem, but do not let looks deceive. These vampires would wreak havoc if they were to escape to the next level of the underworld.'],
    ['Cirno', 'The underworld? Is that what this place is?'],
    ['Komachi', 'Contain this dangerous swarm, and open the barrier to the next level.']
];
