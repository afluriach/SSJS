var StateMachine = Class.extend({
    ctor: function(agent, start)
    {
        require(agent, start);
        this.agent = agent;
        this.start = start;
        this.crntState = null;
    },
    init: function()
    {
        this.start.callIfExists('onEnter', this.agent);
        this.crntState = this.start;
        cc.log(this.agent.name + ' initialized in state ' + this.crntState.className);
    },
    update: function()
    {
        this.crntState.callIfExists('update', this.agent);
    },
    setState: function(newState)
    {
        this.crntState.callIfExists('onExit', this.agent);
        cc.log(this.agent.name + ' changed from state ' + this.crntState.className + ' to ' + newState.className);
        newState.callIfExists('onEnter', this.agent);
        this.crntState = newState;
    }
});

var State = Class.extend({
});

State.make('Idle', {
    update: function(agent)
    {
        agent.applyDesiredVelocity(Vector2.zero);
    }
});

State.make('Flee', {
    ctor: function(target)
    {
        require(target);
        require(target.speed);
        this.target = target;
    },
    update: function(agent)
    {
        var dir = agent.getPos().sub(this.target.getPos()).getUnit();
        agent.applyDesiredVelocity(dir.mult(agent.speed));
        agent.setDirectionAngle(dir.getAngle());
    }
});
