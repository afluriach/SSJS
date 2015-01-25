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
        
        this.inventory = new InventoryMenu();
        this.addChild(this.inventory, 3);
        this.inventory.setVisible(false);
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
    },
    toggleInventory: function()
    {
        if(!this.isInventoryOpen())
            this.openInventory();
        else
            this.closeInventory();
    },
    isInventoryOpen: function()
    {
        return this.inventory.isVisible();
    },
    openInventory: function()
    {
        this.inventory.setVisible(true);
        this.inventory.onOpen();
    },
    closeInventory: function()
    {
        this.inventory.setVisible(false);
        this.inventory.onClose();
    }
});

var InventoryMenu = cc.Layer.extend({
    border: 2,
    ctor: function()
    {
        this._super();
        
        this.backgroundNode = cc.DrawNode.create();
        this.addChild(this.backgroundNode, 1);

        this.backgroundNode.drawRect(
            cc.p(this.border,this.border),
            cc.p(screenSize.width-this.border, screenSize.height-this.border),
            Color(0,0,0,190),
            5,
            Color(170,170,170,200)
        );

        this.photoBook = new PhotoBook();
        this.addChild(this.photoBook, 2);
    },
    update: function()
    {
        
    },
    onOpen: function()
    {
        this.photoBook.update();
    },
    onClose: function()
    {
        
    }
});

var PhotoBook = cc.Layer.extend({
    ctor: function()
    {
        this._super();
        
        this.photoLayer = cc.Layer.create();
        this.addChild(this.photoLayer, 1);
    },
    update: function()
    {
        this.photoLayer.removeAllChildren(false);
        
        for(var i=0;i<inventory.photos.length; ++i)
        {
            var p = inventory.photos[i];
            p.setScale(0.5);
            p.x = screenSize.width/2;
            p.y = screenSize.height - 75 - 150*i;
            this.photoLayer.addChild(p);
        }
    }
});
