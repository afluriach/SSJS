var UILayer = cc.Layer.extend({
    showPauseMsg: function()
    {
        this.pauseMsg = cc.LabelTTF.create("-PAUSED-", 'Arial', 32);
        this.pauseMsg.x = screenSize.width/2;
        this.pauseMsg.y = screenSize.height/2;
        
        this.addChild(this.pauseMsg, 1);
    },
    removePauseMsg: function()
    {
        this.pauseMsg.removeFromParent();
        delete this.pauseMsg;
    }
});