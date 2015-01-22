function GameObjectSystem()
{
    this.objects = {};
    this.toAdd = {};
    this.toRemove = {};
    
    this.getByName = function(name)
    {
        return this.objects[name];
    };
    
    this.getByType = function(type)
    {
        var results = [];
        
        for(var name in this.objects)
        {
            var obj = this.objects[name];
            if(obj.type === type)
                results[results.length] = obj;
        }
        
        return results;
    };
    
    this.update = function()
    {
        this.handleRemovals();
        this.updateAll();
        this.handleAdditions();
    };
    
    this.handleRemovals = function()
    {
        for(var name in this.toRemove)
        {
            this.objects[name].onRemove();

            delete this.objects[name];
            delete this.toRemove[name];
        }
    };
    
    this.handleAdditions = function()
    {
        for(var name in this.toAdd)
        {
            this.objects[name] = this.toAdd[name];
            delete this.toAdd[name];
        }
    };
    
    this.addObject = function(obj)
    {
        this.toAdd[obj.name] = obj;
    };
    
    this.removeObject = function(objName)
    {
        this.toRemove[objName] = true;
        
        var obj = this.objects[objName];
    };
    
    this.updateAll = function()
    {
        for(var objName in this.objects)
        {
            if(this.objects[objName].update)
                this.objects[objName].update();
        }
    };
    
    this.initAll = function()
    {
        for(var objName in this.objects)
        {
            if(this.objects[objName].init)
                this.objects[objName].init();
        }
    }
}
