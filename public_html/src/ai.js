var StateMachine = Class.extend({
    ctor: function(start)
    {
        require(start);
        this.start = start;
        this.crntState = null;
    },
    init: function()
    {
        this.start.callIfExists('onEnter');
        this.crntState = this.start;
    },
    update: function()
    {
        this.crntState.callIfExists('update');
    },
    setState: function(newState)
    {
        this.crntState.callIfExists('onExit');
        newState.callIfExists('onEnter');
        this.crntState = newState;
    }
});

var State = Class.extend({
    ctor: function(agent)
    {
        require(agent);
        this.agent = agent;
    }
});

var Idle = State.extend({
    update: function()
    {
        this.agent.applyDesiredVelocity(Vector2.zero);
    }
});

var Flee = State.extend({
    ctor: function(agent, target)
    {
        this._super(agent);
        
        require(target);
        require(target.speed);
        this.target = target;
    },
    update: function()
    {
        var dir = this.agent.getPos().sub(this.target.getPos()).getUnit();
        this.agent.applyDesiredVelocity(dir.mult(this.agent.speed));
        this.agent.setDirectionAngle(dir.getAngle());
    }
});
