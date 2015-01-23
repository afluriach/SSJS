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
        
        this.setAnimation(animationSpriteRes);
        
        this.animationIndex = 0;
        this.frame = 1;
        
        this.sprite = cc.Sprite.create(this.entityAnimation.animations[this.animationIndex][this.frame]);
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
    setDirectionFromAngle: function(rad)
    {
        this.setDirection(Math.floor(rad/(Math.PI/4)));
    },
    setDirection: function(direction)
    {
        if(direction < 0 || direction >= 8){
            cc.log('Invalid direction: ' + direction);
            return;
        }
        
        this.animationIndex = this.directionToAnimationIndex(direction);
        this.sprite.setFlippedX(this.directionIsFlipped(direction));
        this.updateSpriteFrame();
    },
    updateSpriteFrame: function()
    {
        this.sprite.setSpriteFrame(this.entityAnimation.animations[this.animationIndex][this.frame]);
    },
    setFrame: function(frame)
    {
        this.frame = frame;
        this.updateSpriteFrame();
    },
    setAnimation: function(res)
    {
        if(entityAnimationsLoaded[res])
        {
            this.entityAnimation = entityAnimationsLoaded[res];
        }
        else
        {
            entityAnimationsLoaded[res] = new EntityAnimation(res);
            this.entityAnimation = entityAnimationsLoaded[res];
        }
    }
});

function Color(r, g, b, a)
{
    return  {r: r, g: g, b: b, a: a || 255 };
};

function hsva(h, s, v, a)
{
    var r1, g1, b1;
    var C = v*s;
    var hPrime = h / 60;
    var x = C*(1-Math.abs(hPrime % 2.0 - 1));
    var m = v-C;
    
    if(s === 0)
    {
        //saturation is 0 so hue is undefined and no color will be added
        r1 = g1 = b1 = 0;
    }
    else if(0 <= hPrime && hPrime < 1)
    {
        r1 = C;
        g1 = x;
        b1 = 0;
    }
    else if(1 <= hPrime && hPrime < 2)
    {
        r1 = x;
        g1 = C;
        b1 = 0;
    }
    else if(2 <= hPrime && hPrime < 3)
    {
        r1 = 0;
        g1 = C;
        b1 = x;
    }
    else if(3 <= hPrime && hPrime < 4)
    {
        r1 = 0;
        g1 = x;
        b1 = C;
    }
    else if(4 <= hPrime && hPrime < 5)
    {
        r1 = x;
        g1 = 0;
        b1 = C;
    }
    else if(5 <= hPrime && hPrime < 6)
    {
        r1 = C;
        g1 = 0;
        b1 = x;
    }
    else
    {
        throw new Error("Invalid hue given: " + h);
    }
    
    return Color((r1+m)*255, (g1+m)*255, (b1+m)*255, a*255);
}
