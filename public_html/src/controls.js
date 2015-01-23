var MouseListener = cc.EventListener.create({
    event: cc.EventListener.MOUSE,
    onMouseDown: function(event)
    {
        var loc = event.getLocation();
        
        crntScene().handlePress(loc);
    }
});

var keyAssignments = {
    up: 'w',
    left: 'a',
    down: 's',
    right: 'd',
    
    cameraUp: 'i',
    cameraLeft: 'j',
    cameraDown: 'k',
    cameraRight: 'l',
    cameraLock: 'm',
    
    pause: 'escape',
    
    action: 'forwardslash',
    spell: 'period'
};

//map of keycode constants to assignment names
var keycodes = {};
//button state
var controls = {};
//was the key down in the last frame?
var keyHeld = {};
//was the key pressed this frame?
var keyPressed = {};

function addKey(keycode, name)
{
    controls[name] = false;
    keycodes[keycode] = name;
}

for(var assignment in keyAssignments)
{
    addKey(cc.KEY[keyAssignments[assignment]], assignment);
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
    },
    update: function()
    {
        for(var key in controls)
        {
            keyPressed[key] = controls[key] && !keyHeld[key];
            keyHeld[key] = controls[key];
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
    
    if(controls.left && !controls.right) v.x = -1;
    else if(controls.right && !controls.left) v.x = 1;
    
    if(controls.down && !controls.up) v.y = -1;
    else if(controls.up && !controls.down) v.y = 1;

    if(v.len2() !== 0)
        return v.getUnit();
    else return Vector2.zero;
}
