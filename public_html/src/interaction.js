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