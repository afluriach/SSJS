var GameObjectSystem = Class.extend({
    ctor: function(){
        this.objects = {};
        this.toAdd = {};
        this.toRemove = {};
    },
    getByName: function(name){
        return this.objects[name];
    },
    update: function(){
        this.handleRemovals();
        this.updateAll();
        this.handleAdditions();        
    },
    handleRemovals: function(){
        for(var name in this.toRemove)
        {
            this.objects[name].onRemove();

            delete this.objects[name];
            delete this.toRemove[name];
        }
    },
    handleAdditions: function(){
        for(var name in this.toAdd)
        {
            this.objects[name] = this.toAdd[name];
            delete this.toAdd[name];
        }
    },
    addObject: function(obj){
        this.toAdd[obj.name] = obj;
    },
    removeObject: function(objName){
        this.toRemove[objName] = true;
        
        var obj = this.objects[objName];
    },
    updateAll: function(){
        for(var objName in this.objects)
        {
            if(this.objects[objName].update)
                this.objects[objName].update();
        }
    },
    initAll: function(){
        for(var objName in this.objects)
        {
            if(this.objects[objName].init)
                this.objects[objName].init();
        }
    }
});
