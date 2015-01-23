var AreaSensor = GameObject.extend({
    ctor: function(args)
    {
        args.layer = PhysicsLayer.all;
        args.group = PhysicsGroup.sensor;
        args.sensor = true;
        args.mass = -1;
        this._super(args);
    },
    onDetect: function(obj)
    {
        cc.log(this.name + " detected " + obj.name);
    },
    onEndDetect: function(obj)
    {
        cc.log(this.name + " lost " + obj.name);
    }
});

var Radar = GameObject.extend({
    nextID: 1,
    ctor: function(owner, radius, layer)
    {
        this.radius = radius;
        this.owner = owner;
        
        args = {};
        args.layer = layer;
        args.group = PhysicsGroup.sensor;
        args.sensor = true;
        args.mass = 1;
        args.circle = true;
        
        args.pos = owner.getPos();
        args.name = 'radar'+this.nextID++;
        
        this._super(args);
    },
    update: function()
    {
        this.setPos(this.owner.getPos());
    },
    onDetect: function(obj)
    {
        if(isDefined(this.owner.onDetect))
            this.owner.onDetect(obj);
    },
    onEndDetect: function(obj)
    {
        if(isDefined(this.owner.onEndDetect))
            this.owner.onEndDetect(obj);
    }
});
