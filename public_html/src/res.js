//resource names mapped to file path
var res = {
};

var mapNames = [
    'winged_swarm'
];

var spriteNames = [
    'cell_door',
    'underworld_door_locked',
    'underworld_door_unlocked'
];

var musicTracks = [
    'see'
];

function addResources(res_names, path, suffix, extension)
{
    for(var i=0;i<res_names.length; ++i)
    {
        res[res_names[i]+suffix] = path+res_names[i]+extension;
    }
}

addResources(mapNames, 'res/map/', '_map', '.tmx');
addResources(spriteNames, 'res/sprite/', '_sprite', '.png');
addResources(musicTracks, 'res/music/', '_track', '.ogg');

//list of all resource paths
var res_list = [];

for(var name in res)
{
    res_list.push(res[name]);
}