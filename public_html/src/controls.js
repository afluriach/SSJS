var MouseListener = cc.EventListener.create({
    event: cc.EventListener.MOUSE,
    onMouseDown: function(event)
    {
        var loc = event.getLocation();
        
        crntScene().handlePress(loc);
    }
});

//should match the cocos name for the key
var keys = [
    'w','a','s','d',
    'i','j','k','l'
];

//map of keycode constants to key names
var keycodes = {};
//button state
var controls = {};

function addKey(keycode, name)
{
    controls[name] = false;
    keycodes[keycode] = name;
}

for(var i=0;i<keys.length; ++i)
{
    addKey(cc.KEY[keys[i]], keys[i]);
}

var KeyListener = cc.EventListener.create({
    event: cc.EventListener.KEYBOARD,
    onKeyPressed: function(key)
    {
        if(key in keycodes)
        {
            controls[keycodes[key]] = true;
        }
    },
    onKeyReleased: function(key)
    {
        if(key in keycodes)
        {
            controls[keycodes[key]] = false;
        }
    }
});

function activateMouseControls()
{
    cc.eventManager.addListener(MouseListener, 1);
}

function activateKeyControls()
{
    cc.eventManager.addListener(KeyListener, 1);
}

function getMoveVector()
{
    var v = new Vector2(0,0);
    
    if(controls.a && !controls.d) v.x = -1;
    else if(controls.d && !controls.a) v.x = 1;
    
    if(controls.s && !controls.w) v.y = -1;
    else if(controls.w && !controls.s) v.y = 1;

    if(v.len2() !== 0)
        return v.getUnit();
    else return Vector2.zero;
}
