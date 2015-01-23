//resource names mapped to file path
var res = {
};

//list of all resource paths
var res_list = [];

var mapNames = [
    'winged_swarm'
];

var spriteNames = [
    'ice_blast',
    'cell_door',
    'underworld_door_locked',
    'underworld_door_unlocked'
];

var musicTracks = [
    'see'
];

var entityNames = [
    'cirno',
    'flandre',
    'flandre_frozen',
    'flandre_frozen_ending',
    'komachi'
];

function addResources(res_names, path, type, extension)
{
    res[type] = {};
    for(var i=0;i<res_names.length; ++i)
    {
        res[type][res_names[i]] = path+res_names[i]+extension;
        res_list.push(res[type][res_names[i]]);
    }
}

addResources(mapNames, 'res/map/', 'map', '.tmx');
addResources(spriteNames, 'res/sprite/', 'sprite', '.png');
addResources(entityNames, 'res/entity/', 'entity', '.png');
addResources(musicTracks, 'res/music/', 'track', '.ogg');
