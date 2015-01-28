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
    onHit: function()
    {
        var next = this.crntState.callIfExists('onHit', this.agent);
        
        if(next)
            this.setState(next);
    },
    update: function()
    {
        var next = this.crntState.callIfExists('update', this.agent);
        
        if(next)
            this.setState(next);
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

//The initial state, as well as the state in between movements, when the agent
//is paused.
Idle.make('RandomWalk',{
    ctor: function(distRange, pauseRange, speedRange)
    {
        require(distRange, pauseRange, speedRange);
        
        this.distRange = distRange;
        this.pauseRange = pauseRange;
        this.speedRange = speedRange;
        
        this.waitTime = pauseRange.random();
    },
    onEnter: function()
    {
        this.waitTime = this.pauseRange.random();
    },
    update: function(agent)
    {
        this._super(agent);
        
        if(this.waitTime <= 0)
        {
            var p = this.getPoint(agent);
            
            if(p !== null)
            {
                return new MoveToPoint(p, this.speedRange.random(), this);
            }
        }
        else
            this.waitTime -= secondsPerFrame;
    },
    //Get an unobsructed point.
    getPoint: function(agent)
    {
        var dists = [];
        for(var dir=0;dir<8; ++dir)
        {
            var obstacleDist = physics.obstacleFeeler(
                agent.getPos(),
                this.distRange.max + agent.radius,
                Math.PI/4*dir,
                PhysicsLayer.ground,
                0,
                this
            );
            dists.push(obstacleDist);
        }
        
        //select directions that allow for moving at least the minimum distance.
        var selected = [];
        
        for(var i=0;i<8; ++i)
        {
            if(dists[i] > this.distRange.min + agent.radius)
            {
                selected.push({dir: i, dist: dists[i]});
            }
        }
        
        //Select a random direction, if any are available
        if(selected.length === 0) return null;
        else
        {
            var d = selected[randomInt(0,selected.length)];
            return agent.getPos().add(Vector2.ray(d.dist, Math.PI/4*d.dir));
        }
    }
});

State.make('MoveToPoint', {
    arrivalMargin: 0.2,
    ctor: function(point, speed, nextState)
    {
        require(point, nextState);
        this.point = point;
        this.nextState = nextState;
    },
    //Given up on reaching current point and choose again.
    onHit: function()
    {
        return this.nextState;
    },
    update: function(agent)
    {
        var disp = this.point.sub(agent.getPos());
        agent.applyDesiredVelocity(disp.getUnit().mult(agent.speed));
        agent.setDirectionAngle(disp.getAngle());
        
        if(disp.len2() <= this.arrivalMargin*this.arrivalMargin)
        {
            return this.nextState;
        };
    }
});
