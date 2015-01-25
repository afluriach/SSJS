var GameObjectSystem = Class.extend({
    ctor: function(){
        this.objects = {};
        this.nameMap = {};
        
        this.toAdd = {};
        this.toRemove = {};
    },
    getByName: function(name){
        return this.nameMap[name];
    },
    update: function(){
        this.handleRemovals();
        this.updateAll();
        this.handleAdditions();        
    },
    handleRemovals: function(){
        for(var uid in this.toRemove)
        {
            this.objects[uid].onRemove();

            delete this.nameMap[this.objects[uid].name];
            delete this.objects[uid];
            delete this.toRemove[uid];
        }
    },
    handleAdditions: function(){
        for(var uid in this.toAdd)
        {
            this.objects[uid] = this.toAdd[uid];
            this.nameMap[this.objects[uid].name] = this.objects[uid];
            delete this.toAdd[uid];
        }
    },
    addObject: function(obj){
        this.toAdd[obj.uid] = obj;
    },
    removeObject: function(obj){
        this.toRemove[obj.uid] = true;
    },
    removeObjectByUid: function(uid){
        this.toRemove[uid] = true;
    },
    updateAll: function(){
        for(var uid in this.objects)
        {
            if(this.objects[uid].update)
                this.objects[uid].update();
        }
    },
    initAll: function(){
        for(var uid in this.objects)
        {
            if(this.objects[uid].init)
                this.objects[uid].init();
        }
    }
});
