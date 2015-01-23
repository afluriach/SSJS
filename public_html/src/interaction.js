var Talk = {
    msg: 'Talk',
    interact: function(player, obj)
    {
        obj.onTalk();
    },
    canInteract: function(player, obj)
    {
        return isDefined(obj.onTalk);
    }
};

var Grab = {
    msg: 'Grab',
    interact: function(player, obj)
    {
        player.grab(obj);
    },
    canInteract: function(player, obj)
    {
        return obj.grabbable && obj.grabbable();
    }
}
