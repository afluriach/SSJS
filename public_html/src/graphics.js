var screenSize; //initialized in init()
var pixelsPerTile = 32;
var tilesPerPixel = 1.0/pixelsPerTile;

function screenCenter()
{
    return new Vector2(screenSize.width/2, screenSize.height/2);
}

var EntityAnimation = Class.extend({
    frameSize: 32,
    animationLength: 3,
    ctor: function(spriteRes)
    {
        this.animations = [];
        
        for(var i=0;i<4; ++i)
        {
            this.animations.push([]);
            
            for(var j=0;j<this.animationLength; ++j)
            {
                this.animations[i].push(new cc.SpriteFrame(spriteRes, cc.rect(j*this.frameSize,i*this.frameSize,this.frameSize,this.frameSize)));
            }
        }
        this.animations.push([]);
        for(var j=0;j<this.animationLength; ++j)
        {
            this.animations[4].push(new cc.SpriteFrame(spriteRes, cc.rect(3*this.frameSize,j*this.frameSize,this.frameSize,this.frameSize)));
        }
    }
});

var entityAnimationsLoaded = {
    
};

var EntitySprite = cc.Node.extend({
    ctor: function(animationSpriteRes)
    {
        this._super();
        
        if(entityAnimationsLoaded[animationSpriteRes])
        {
            this.entityAnimation = entityAnimationsLoaded[animationSpriteRes];
        }
        else
        {
            entityAnimationsLoaded[animationSpriteRes] = new EntityAnimation[animationSpriteRes];
            this.entityAnimation = entityAnimationsLoaded[animationSpriteRes];
        }
        
        this.sprite = cc.Sprite.create(animation.animations[0][0]);
        this.addChild(this.sprite, 1);
    },
    directionToAnimationIndex: function(dir)
    {
        if(dir < 0 || dir >= 8)
        {
            cc.log("invalid animation direction: " + dir);
            return;
        }
        
        if(dir <= 2)
        {
            return 2 - dir;
        }
        else if(dir <= 6)
        {
            return dir-2;
        }
        else return 3;
    },
    directionIsFlipped: function(dir)
    {
        return dir >= 3 && dir <= 5;
    },
    setFrame: function(direction, animationFrame)
    {
        var animationIdx = this.directionToAnimationIndex(direction);
        this.sprite.setFlippedX(this.directionIsFlipped(direction));
        
        this.sprite.setSpriteFrame(this.entityAnimation.animations[animationIdx][animationFrame]);
    }
});
