function isDefined(x)
{
    return typeof(x !== 'undefined');
}

//accumulate a value, and run an action for every interval accumulated
var Accumulator = Class.extend({
    //if auto is set, check after every add
    ctor: function(initial, interval, action)
    {
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
