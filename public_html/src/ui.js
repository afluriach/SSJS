var ActionButton = cc.Node.extend({
    radius: 40,
    segments: 40,
    outlineThickness: 5,
    buttonColor: {r: 72, g: 72, b: 72},
    ctor: function()
    {
        this._super();
        
        this.drawNode = cc.DrawNode.create();
        this.addChild(this.drawNode, 1);
        
        this.drawNode.drawDot(cc.p(0,0),this.radius,this.buttonColor);
        
        this.actionMessage = cc.LabelTTF.create('', 'Arial', 24);
        this.addChild(this.actionMessage, 2);
    }
});

var UILayer = cc.Layer.extend({
    ctor: function()
    {
        this._super();
        
        this.pauseMsg = cc.LabelTTF.create("-PAUSED-", 'Arial', 32);
        this.pauseMsg.x = screenSize.width/2;
        this.pauseMsg.y = screenSize.height/2;
        
        this.addChild(this.pauseMsg, 1);
        this.pauseMsg.setVisible(false);
        
        this.actionButton = new ActionButton();
        this.actionButton.x = screenSize.width - 50;
        this.actionButton.y = 50;
        this.addChild(this.actionButton, 1);
        
        this.dialogLayer = new DialogLayer();
        this.addChild(this.dialogLayer, 2);
    },
    showPauseMsg: function()
    {
        this.pauseMsg.setVisible(true);
    },
    removePauseMsg: function()
    {
        this.pauseMsg.setVisible(false);
    },
    setInteractMessage: function(msg)
    {
        this.actionButton.actionMessage.string = msg;
    }
});
