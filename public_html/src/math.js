var Vector2 = Class.extend({
    ctor: function(x,y)
    {
        this.x = x;
        this.y = y;
    },
    add: function(v)
    {
        return new Vector2(this.x+v.x,this.y+v.y);
    },
    
    sub : function(v)
    {
        return new Vector2(this.x-v.x, this.y - v.y);
    },
    
    mult : function(a)
    {
        return new Vector2(this.x*a, this.y*a);
    },
    
    dot : function(v)
    {
        return this.x*v.x + this.y*v.y;
    },
    
    chipmunk : function()
    {
        return cp.v(this.x, this.y);
    },
    
    len : function()
    {
        return Math.sqrt(this.x*this.x + this.y*this.y);
    },
    
    len2 : function()
    {
        return this.x*this.x + this.y*this.y;
    },
    
    getUnit : function()
    {
        var len = this.len();
        return new Vector2(this.x/len, this.y/len);
    },
    
    //add this displacement vector to all elements in array of vectors
    //if !copy, the values in the array are mutated instead of copied
    dispAll : function(arr, copy)
    {
        if(copy)
        {
            var dest = [];
            
            for(var i=0;i<arr.legnth; ++i)
            {
                dest[i] = arr[i].add(this);
            }
            
            return dest;
        }
        else
        {
            for(var i=0;i<arr.length; ++i)
            {
                arr[i].x += this.x;
                arr[i].y += this.y;
            }
            
            return arr;
        }
    },
    
    getAngle : function()
    {
        if(this.x === 0 && this.y === 0) return 0;
        
        return Math.atan2(this.y, this.x);
    },
    
    getAngleDeg : function()
    {
        return this.getAngle()*180/Math.PI;
    },
    
    getAngleCocos : function()
    {
        return canonicalAngleToCocos(this.getAngleDeg());
    },
    
    rotate : function(angle)
    {
        //return Vector2.ray(this.len(), this.getAngle()+angle);
        return new Vector2(this.x*Math.cos(angle)-this.y*Math.sin(angle),
                           this.x*Math.sin(angle)+this.y*Math.cos(angle));
    }
});

Vector2.copy = function (v)
{
    return new Vector2(v.x,v.y);
};

Vector2.ray = function(len, angle)
{
    return new Vector2(Math.cos(angle)*len, Math.sin(angle)*len);
};

Vector2.zero = new Vector2(0,0);

function pixelCoordToPhysics(x,y)
{
    //return new Box2D.Common.Math.b2Vec2(tilesPerPixel*x, tilesPerPixel*y);
    return new Vector2(tilesPerPixel*x, tilesPerPixel*y);
};

function mapObjToPhysicsPos(obj)
{
   return pixelCoordToPhysics(parseInt(obj.x)+obj.width/2, parseInt(obj.y)+obj.height/2);
};

function makeBB(center, width, height)
{
    return {l: center.x - width/2, r: center.x + width/2,
            b: center.y - height/2, t: center.y + height/2};
}
