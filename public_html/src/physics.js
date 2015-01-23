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
    },
    setCollisionHandlers: function()
    {
        this.space.addCollisionHandler(PhysicsGroup.player, PhysicsGroup.playerSensor, agentSensorBegin, null, null, agentSensorEnd);
        this.space.addCollisionHandler(PhysicsGroup.player, PhysicsGroup.sensor, agentSensorBegin, null, null, agentSensorEnd);
        this.space.addCollisionHandler(PhysicsGroup.agent, PhysicsGroup.sensor, agentSensorBegin, null, null, agentSensorEnd);
        this.space.addCollisionHandler(PhysicsGroup.playerProjectile, PhysicsGroup.agent, projectileObjectBegin, null, null, null);
        this.space.addCollisionHandler(PhysicsGroup.playerProjectile, PhysicsGroup.wall, projectileWallBegin, null, null, null);
        this.space.addCollisionHandler(PhysicsGroup.playerProjectile, PhysicsGroup.environment, projectileObjectBegin, null, null, null);
    },
    rectangleQuery: function(bb, layer, group, func)
    {
        this.space.bbQuery(bb, layer, group, func);
    },
    isObjectPresentInArea: function(bb, layer, group, exclude)
    {
        var objectFound = false;
        
        this.rectangleQuery(bb, layer, group, function(shape){
            if(shape.gameobject !== exclude && shape.group !== PhysicsGroup.sensor)
                objectFound = true;
        });
        
        return objectFound;
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
    
    if(isDefined(obj.onHit))
        obj.onHit(proj);
    if(isDefined(proj.onHit))
        proj.onHit(obj);
}

function projectileWallBegin(arb)
{
    var proj = arb.getShapes()[0].gameobject;
    
    if(isDefined(proj.onHit))
        proj.onHitWall();
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
