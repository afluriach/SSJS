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
        this.space.intraGroups[PhysicsGroup.environment] = true;
        
        this.setCollisionHandlers();
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
    removeBody: function(body)
    {
        if(!body.static)
            this.space.removeBody(body);
        
        this.space.removeShape(body.shape);
    },
    update: function()
    {
        this.space.step(secondsPerFrame);
    },
    createVerticalWallTile: function(x, y, height)
    {
        this.createWallTile(x,y,1,height);
    },
    createHorizontalWallTile: function(x, y, width)
    {
        this.createWallTile(x,y,width,1);
    },
    createWallTile: function(x, y, width, height)
    {
        var body = createStaticBody();
        body.static = true;
        body.p =  new cp.Vect(x+width/2, y+height/2);
        var shape = new cp.BoxShape(body, width, height);
        body.shape = shape;
        this.space.addShape(shape);
        
        shape.setCollisionType(PhysicsGroup.wall);
        shape.group = PhysicsGroup.wall;
        shape.layers = PhysicsLayer.all;
    },
    setCollisionHandlers: function()
    {
        this.space.addCollisionHandler(PhysicsGroup.player, PhysicsGroup.playerSensor, agentSensorBegin, null, null, agentSensorEnd);
        this.space.addCollisionHandler(PhysicsGroup.player, PhysicsGroup.sensor, agentSensorBegin, null, null, agentSensorEnd);
        this.space.addCollisionHandler(PhysicsGroup.agent, PhysicsGroup.agent, agentAgentBegin, null, null);
        this.space.addCollisionHandler(PhysicsGroup.agent, PhysicsGroup.sensor, agentSensorBegin, null, null, agentSensorEnd);
        this.space.addCollisionHandler(PhysicsGroup.agent, PhysicsGroup.wall, agentWallBegin, null, null, null);
        this.space.addCollisionHandler(PhysicsGroup.playerProjectile, PhysicsGroup.agent, projectileObjectBegin, null, null, null);
        this.space.addCollisionHandler(PhysicsGroup.playerProjectile, PhysicsGroup.wall, projectileWallBegin, null, null, null);
        this.space.addCollisionHandler(PhysicsGroup.playerProjectile, PhysicsGroup.environment, projectileObjectBegin, null, null, null);
    },
    rectangleQuery: function(bb, layer, group, func)
    {
        this.space.bbQuery(bb, layer, group, func);
    },
    //If exclude is undefined it will ignore shapes without a gameobject
    //(i.e. walls).
    isObjectPresentInArea: function(bb, layer, group, exclude)
    {
        var objectFound = false;
        
        this.rectangleQuery(bb, layer, group, function(shape){
            if(shape.gameobject !== exclude && !shape.sensor)
                objectFound = true;
        });
        
        return objectFound;
    },
    getObjectsEnclosedInArea: function(bb, layer, group, exclude)
    {
        var objects = [];
        
        this.space.bbEnclosureQuery(bb, layer, group, function(shape){
            if(shape.gameobject && shape.gameobject !== exclude && shape.group !== PhysicsGroup.sensor)
                objects.push(shape.gameobject);
        });
        
        return objects;
    },
    //Returns the distance to the detected obstacle, or the original distance
    //provided if no obstacle detected. Senses walls, but ignores objects equal
    //to exclude if provided.
    obstacleFeeler: function(start, distance, angle, layers, group, exclude)
    {
        var end = start.add(Vector2.ray(distance, angle));
        
        //Space.prototype.segmentQuery = function(start, end, layers, group, func)
        var query_info = this.space.segmentQueryFirst(start.chipmunk(),end.chipmunk(),layers,group, exclude);
        
        if(!query_info) return distance;
        else return query_info.hitDist(start, end);
    },
    objectFeeler: function(start, distance, angle, layers, group)
    {
        var end = start.add(Vector2.ray(distance, angle));
        
        //Space.prototype.segmentQuery = function(start, end, layers, group, func)
        var query_info = this.space.segmentQueryFirst(start.chipmunk(),end.chipmunk(),layers,group);
        
        if(query_info === null || typeof query_info === 'undefined') return null;
        if(typeof query_info.shape.gameobject === 'undefined') return null;
        return query_info.shape.gameobject;
    }
});

function agentSensorBegin(arb)
{
    var agent = arb.getShapes()[0].gameobject;
    var sensor = arb.getShapes()[1].gameobject;
    
    sensor.onDetect(agent);
}

function agentSensorEnd(arb)
{
    var agent = arb.getShapes()[0].gameobject;
    var sensor = arb.getShapes()[1].gameobject;
    
    sensor.onEndDetect(agent);
}
function projectileObjectBegin(arb)
{
    var proj = arb.getShapes()[0].gameobject;
    var obj = arb.getShapes()[1].gameobject;
    
    obj.callIfExists('onHit', proj);
    proj.callIfExists('onHit', obj);
}

function projectileWallBegin(arb)
{
    var proj = arb.getShapes()[0].gameobject;
    
    proj.callIfExists('onHitWall');
}

function agentWallBegin(arb)
{
    var agent = arb.getShapes()[0].gameobject;
    
    agent.callIfExists('onHit');
    
    return true;
}

function agentAgentBegin(arb)
{
    var agent1 = arb.getShapes()[0].gameobject;
    var agent2 = arb.getShapes()[1].gameobject;
    
    agent1.callIfExists('onHit', agent2);
    agent2.callIfExists('onHit', agent1);
    
    return true;
}

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
    wall: 5,
    playerProjectile: 6,
    playerSensor: 7,
};
