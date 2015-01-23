var buttonRadius = 40;

var Button = cc.Node.extend({
    segments: 40,
    outlineThickness: 5,
    buttonColor: {r: 72, g: 72, b: 72},
    ctor: function()
    {
        this._super();
        
        this.drawNode = cc.DrawNode.create();
        this.addChild(this.drawNode, 1);
        
        this.drawNode.drawDot(cc.p(0,0),buttonRadius,this.buttonColor);
    }
});

var ActionButton = Button.extend({
    ctor: function()
    {
        this._super();

        this.actionMessage = cc.LabelTTF.create('', 'Arial', 24);
        this.addChild(this.actionMessage, 2);
    }
});

var SpellButton = Button.extend({
    ctor: function()
    {
        this._super();

        this.sprite = cc.Sprite.create();
        this.addChild(this.sprite, 2);
    }
});

var UILayer = cc.Layer.extend({
    buttonSpacing: 10,
    ctor: function()
    {
        this._super();
        
        this.pauseMsg = cc.LabelTTF.create("-PAUSED-", 'Arial', 32);
        this.pauseMsg.x = screenSize.width/2;
        this.pauseMsg.y = screenSize.height/2;
        
        this.addChild(this.pauseMsg, 1);
        this.pauseMsg.setVisible(false);
        
        this.actionButton = new ActionButton();
        this.actionButton.x = screenSize.width - buttonRadius - this.buttonSpacing;
        this.actionButton.y = buttonRadius + this.buttonSpacing;
        this.addChild(this.actionButton, 1);

        this.spellButton = new SpellButton();
        this.spellButton.x = screenSize.width - 3*buttonRadius - 2*this.buttonSpacing;
        this.spellButton.y = buttonRadius + this.buttonSpacing;
        this.addChild(this.spellButton, 1);
        
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
    },
    setSpellIcon: function(spriteRes)
    {
        this.spellButton.sprite.setTexture(spriteRes);
    }
});
