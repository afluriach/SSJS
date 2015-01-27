function isDefined(x)
{
    return typeof x !== 'undefined';
}

function isAllDefined()
{
    for(var i=0;i<arguments.length; ++i)
    {
        if(!isDefined(arguments[i]))
            return false;
    }
    return true;
}

//accumulate a value, and run an action for every interval accumulated
var Accumulator = Class.extend({
    //if auto is set, check after every add
    ctor: function(initial, interval, action)
    {
        if(!isAllDefined(initial, interval, action))
            throw new Error("Accumulator: parameter missing.");
        
        this.val = initial;
        this.interval = interval;
        this.action = action;
    },
    add: function(x)
    {
        this.val += x;
        
        if(this.val >= this.interval)
        {
            this.val -= this.interval;
            this.action();
        }
    },
    set: function(x)
    {
        this.val = x;
    }
});

//Require a minimum amount of time between performing an action
var IntervalDelay = Class.extend({
    ctor: function(initialDelay, interval, action)
    {
        this.remaining =  initialDelay;
        this.initialDelay = initialDelay;
        this.interval = interval;
        this.action = action;
    },
    tick: function(tryToPerformAction)
    {
        this.remaining -= secondsPerFrame;
        
        if(tryToPerformAction && this.remaining <= 0)
        {
            this.remaining = this.interval;
            this.action();
        }
    },
    reset: function()
    {
        this.remaining = this.initialDelay;
    },
    poll: function()
    {
        if(this.remaining <= 0)
        {
            this.action();
            this.remaining = this.interval;
        }
    }
});
