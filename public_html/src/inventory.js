var Inventory = Class.extend({
    photoCapacity: 4,
    ctor: function()
    {
        this.photos = [];
    },
    addPhoto: function(photo)
    {
        if(this.photos.length >= this.photoCapacity)
            this.photos.pop();
        this.photos.unshift(photo);
    }
});
