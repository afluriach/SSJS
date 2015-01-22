var createStaticBody = function()
{
	var body = new cp.Body(Infinity, Infinity);
	body.nodeIdleTime = Infinity;
	return body;
};

var Physics = Class.extend({
    ctor: function()
    {
        this.space = new cp.Space();
        this.space.gravity = cp.v(0,0);

        this.space.intraGroups = {};
        this.space.intraGroups[PhysicsGroup.agent] = true;
    },
    //if negative mass is given, treat as infinite (i.e. static body)
    createRectBody: function(center, width, height, mass, gameobject, type, layer, sensor)
    {
        if(mass < 0)
        {
            var body = createStaticBody();
            body.static = true;
        }
        else
        {
            var body = new cp.Body(mass, cp.momentForBox(mass,width,height));
            body.static = false;
            this.space.addBody(body);
        }
        
        body.p = center;
        var shape = new cp.BoxShape(body, width, height);
        body.shape = shape;
        
        this.space.addShape(shape);
        
        shape.layers = layer;
        shape.group = type;
        shape.setSensor(sensor);
        shape.setCollisionType(type);
        body.gameobject = gameobject;
        shape.gameobject = gameobject;
        
        return body;
    },
    createCircleBody: function(center, radius, mass, gameobject, type, layer, sensor)
    {
        if(mass < 0)
        {
            var body = createStaticBody();
            body.static = true;
        }
        else
        {
            var body = new cp.Body(mass, cp.momentForCircle(mass, 0, radius, cc.p(0,0)));
            body.static = false;
            this.space.addBody(body);
        }
        
        body.p = center;
        var shape = new cp.CircleShape(body, radius, cp.v(0,0));
        body.shape = shape;
        
        this.space.addShape(shape);
        
        shape.group = type;
        shape.layers = layer;
        shape.setSensor(sensor);
        shape.setCollisionType(type);
        body.gameobject = gameobject;
        shape.gameobject = gameobject;
        
        return body;
    },
    update: function()
    {
        this.space.step(secondsPerFrame);
    },
    createWallTile: function(x, y)
    {
        var body = createStaticBody();
        body.static = true;
        body.p =  new cp.Vect(x+0.5, y+0.5);
        var shape = new cp.BoxShape(body, 1, 1);
        body.shape = shape;
        this.space.addShape(shape);
        
        shape.setCollisionType(PhysicsGroup.wall);
        shape.group = PhysicsGroup.wall;
        shape.layers = PhysicsLayer.all;
    }
});


PhysicsLayer = {
    floor: 1,
    ground : 2,
    air : 4,
    
    all : 7
};

PhysicsGroup = {
    player: 1,
    agent: 2,
    environment: 3,
    sensor: 4,
    wall: 5
};
