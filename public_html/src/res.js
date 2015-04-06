//resource names mapped to file path
var res = {
};

//list of all resource paths
var res_list = [];

var mapNames = [
    'gallery',
    'winged_swarm'
];

var spriteNames = [
    'slider_background',
    'slider_foreground',
    
    'blue_jar',
    'green_jar',
    'red_jar',
    
    'ice_blast',
    
    'cell_door',
    'gallery_barrier',
    'underworld_door_locked',
    'underworld_door_unlocked'
];

var musicTracks = [
    'see'
];

var entityNames = [
    'aya',
    'cirno',
    'flandre',
    'flandre_frozen',
    'flandre_frozen_ending',
    'komachi',
    'reimu',
    'sanae'
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
