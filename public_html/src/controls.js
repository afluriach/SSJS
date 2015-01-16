MouseListener = cc.EventListener.create({
    event: cc.EventListener.MOUSE,
    onMouseDown: function(event)
    {
        var loc = event.getLocation();
        
        crntScene().handlePress(loc);
    }
});

function activateMouseControls()
{
    cc.eventManager.addListener(MouseListener, 1);
}
