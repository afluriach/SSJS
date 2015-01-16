var TextLayer = cc.Layer.extend({
    ctor: function()
    {
        this._super();

        this.drawNode = cc.DrawNode.create();
        this.addChild(this.drawNode, 0);
        
        this.labels = {};
        this.actions = {};
    },
    //if action is not null, the label is clickable and the given action will be run on click
    addLabel: function(msg, name, pos, action)
    {
        return this.addLabelWithOrientation(msg, name, pos, action, cc.TEXT_ALIGNMENT_CENTER, cc.VERTICAL_TEXT_ALIGNMENT_CENTER);
    },
    addLabelWithOrientation: function(msg, name, pos, action, hAlign, vAlign)
    {
         //var label = cc.LabelTTF.create(msg, 'Arial', 32, hAlign, vAlign);
         var label = cc.LabelTTF.create(msg, 'Arial', 32);
         this.labels[name] = label;

         label.setHorizontalAlignment(hAlign);
         label.setVerticalAlignment(vAlign);
         label.x = pos.x;
         label.y = pos.y;

         this.actions[name] = action;

         this.addChild(label, 1);

         return label;

    },

    handlePress: function(pos)
    {
        //check bounding rectangle of labels
        for(var labelName in this.labels)
        {
            var label = this.labels[labelName];
            var action = this.actions[labelName];

            //label position is center based
            if(typeof action !== 'undefined' &&
               pos.x >= label.x - label.width/2 &&
               pos.x <= label.x + label.width/2 &&
               pos.y >= label.y - label.height/2 &&
               pos.y <= label.y + label.height/2)
            {
                if(action)
                    action();
                return true;
            }
        }
        
        return false;
    }
});
