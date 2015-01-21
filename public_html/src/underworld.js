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
