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
    },
    update: function()
    {
        this._super();
        
        if(keyPressed.spell)
        {
            inventory.addPhoto(crntScene().getShot(8));
        }
    }
});

var GalleryReimu = Entity.extend({
    mass: Infinity,
    dialog: [['Reimu', 'Give me something powerful.']],
    ctor: function(args)
    {
        this._super(args, res.entity.reimu, gameLayers.ground);
    },
    onTalk: function()
    {
        crntScene().setDialog(this.dialog);
    }
});

var GalleryCirno = Entity.extend({
    mass: Infinity,
    dialog: [['Cirno', 'Give me something cold.']],
    ctor: function(args)
    {
        this._super(args, res.entity.cirno, gameLayers.ground);
    },
    onTalk: function()
    {
        crntScene().setDialog(this.dialog);
    }
});
var GallerySanae = Entity.extend({
    mass: Infinity,
    dialog: [['Sanae', 'Give me something holy.']],
    ctor: function(args)
    {
        this._super(args, res.entity.sanae, gameLayers.ground);
    },
    onTalk: function()
    {
        crntScene().setDialog(this.dialog);
    }
});

