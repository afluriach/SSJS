var GalleryScene = GameplayScene.extend({
    onEnter: function()
    {
        this._super(res.map.gallery);
    }
});

var GalleryBarrier = Barrier.extend({
    ctor: function(args)
    {
        this._super(args, res.sprite.gallery_barrier, true);
    }
});

var GalleryAya = Player.extend({
    actions: [Talk, Grab],
    speed: 5,
    acceleration: 6,
    mass: 2,
    ctor: function(args)
    {
        this._super(args, res.entity.aya, gameLayers.ground);
        this.setSpell(SpiritCamera);
    },
});

//NPC that looks for a photo with a specific property
var GalleryNPC = NPC.extend({
    ctor: function(args, entity)
    {
        this._super(args, entity);
    },
    hasColorObject: function(photo, color)
    {
        return photo.doesPhotoContainObjectWithProperty('color', color);
    },
    onTalk: function()
    {
        for(var i=0;i<inventory.photos.length; ++i)
        {
            if(this.doesPhotoSatisfy(inventory.photos[i]))
            {
                //Show satisfied dialog and unlock the corresponding barrier.
                crntScene().setDialog(this.satisfiedDialog);
                gameObjectSystem.getByName(this.name+'_barrier').setLocked(false);
                return;
            }
        }
        crntScene().setDialog(this.dialog);
    }
});

var GalleryReimu = GalleryNPC.extend({
    dialog: [['Reimu', 'Give me something powerful.']],
    satisfiedDialog: [['Reimu', 'Just what I was looking for.']],
    ctor: function(args)
    {
        this._super(args, res.entity.reimu);
    },
    doesPhotoSatisfy: function(photo)
    {
        return this.hasColorObject(photo, 'red');
    }
});

var GalleryCirno = GalleryNPC.extend({
    dialog: [['Cirno', 'Give me something cold.']],
    satisfiedDialog: [['Cirno', 'This photo is the greatest.']],
    ctor: function(args)
    {
        this._super(args, res.entity.cirno);
    },
    doesPhotoSatisfy: function(photo)
    {
        return this.hasColorObject(photo, 'blue');
    }

});
var GallerySanae = GalleryNPC.extend({
    dialog: [['Sanae', 'Give me something holy.']],
    satisfiedDialog: [['Sanae', 'I love this photo.']],
    ctor: function(args)
    {
        this._super(args, res.entity.sanae);
    },
    doesPhotoSatisfy: function(photo)
    {
        return this.hasColorObject(photo, 'green');
    }

});

