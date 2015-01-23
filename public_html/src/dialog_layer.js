var DialogLayer = cc.Layer.extend({
    minFrameTime: 0.5,
    ctor: function()
    {
        this._super();
        
        this.dialog = null;
        
        this.messagePos = new Vector2(screenSize.width/2, 300);
        this.characterPos = new Vector2(screenSize.width/2, 500);
        
        this.characterSize = new Vector2(200,50);
        this.messageSize = new Vector2(420,350);
        
        this.drawNode = cc.DrawNode.create();
        this.addChild(this.drawNode, 1);
        this.drawNode.setVisible(false);
        
        //draw dialog outline
        this.drawDialogBox(this.characterPos.sub(new Vector2(110,0)), this.characterSize);
        this.drawDialogBox(this.messagePos, this.messageSize);        
        
        this.messageLabel = this.addLabel(this.messagePos);
        this.characterLabel = this.addLabel(this.characterPos);
    },
    dialogActive: function()
    {
        return this.dialog !== null;
    },
    setDialog: function(dialog)
    {
        this.dialog = dialog;
        this.dialogFrame = 0;
        this.frameTime = 0;
        this.frameNum = 0;
        
        this.loadFrame();

        this.drawNode.setVisible(true);
    },
    update: function()
    {
        this.checkControls();
        this.frameTime += secondsPerFrame;
    },
    //in both cases, advance dialog if the amount of time spent in the current
    //frame is less than the minimum
    handlePress: function(pos)
    {
        if(Math.abs(pos.x - this.messagePos.x) <= this.messageSize.x/2 &&
           Math.abs(pos.y - this.messagePos.y) <= this.messageSize.y)
        {
            //if press is within the dialog message box
            this.checkAdvanceFrame();
        }
    },
    checkControls: function()
    {
        if(keyPressed.action)
            this.checkAdvanceFrame();
    },
    checkAdvanceFrame: function()
    {
        if(this.frameTime >= this.minFrameTime)
        {
            this.nextFrame();
        }
    },
    nextFrame: function()
    {
        this.frameTime = 0;
        ++this.frameNum;
        
        if(this.frameNum === this.dialog.length)
        {
            this.exitDialog();
        }
        else
        {
            this.loadFrame();
        }
    },
    loadFrame: function()
    {
        if(typeof this.dialog[this.frameNum] === 'function')
        {
            this.dialog[this.frameNum]();
            this.nextFrame();
        }
        else
        {
            this.setFrameText();
        }
    },
    setFrameText: function()
    {
        this.characterLabel.string = this.dialog[this.frameNum][0];
        this.messageLabel.string = this.dialog[this.frameNum][1];
    },
    exitDialog: function()
    {
        this.dialog = null;
        this.characterLabel.string = '';
        this.messageLabel.string = '';
        
        this.drawNode.setVisible(false);
    },
    addLabel: function(pos)
    {
        var label = cc.LabelTTF.create('', 'Arial', 32);

        label.setHorizontalAlignment(cc.TEXT_ALIGNMENT_LEFT);
        label.setVerticalAlignment(cc.VERTICAL_TEXT_ALIGNMENT_TOP);
        label.x = pos.x;
        label.y = pos.y;

        this.addChild(label, 2);
        label.setDimensions(400, 0);
        
        return label;
    },
    drawDialogBox: function(center, size)
    {
       var halfSize = size.mult(0.5);
       var bl = center.sub(halfSize);
       var ur = center.add(halfSize);
       this.drawNode.drawRect(cc.p(bl.x, bl.y), cc.p(ur.x, ur.y), hsva(0,0,0.5,0.5), 4, hsva(240, 0.5, 1, 1));
    }
});
