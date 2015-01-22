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