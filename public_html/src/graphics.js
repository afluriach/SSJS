var screenSize; //initialized in init()
var pixelsPerTile = 32;
var tilesPerPixel = 1.0/pixelsPerTile;

function screenCenter()
{
    return new Vector2(screenSize.width/2, screenSize.height/2);
}
