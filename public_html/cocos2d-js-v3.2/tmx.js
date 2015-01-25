cc.TMX_ORIENTATION_ORTHO = 0;
cc.TMX_ORIENTATION_HEX = 1;
cc.TMX_ORIENTATION_ISO = 2;
cc.TMXTiledMap = cc.Node.extend({
	properties: null,
	mapOrientation: null,
	objectGroups: null,
    _mapSize: null,
    _tileSize: null,
    _tileProperties: null,
    _className: "TMXTiledMap",
    ctor:function(tmxFile,resourcePath){
        cc.Node.prototype.ctor.call(this);
        this._mapSize = cc.size(0, 0);
        this._tileSize = cc.size(0, 0);
        if(resourcePath !== undefined){
            this.initWithXML(tmxFile,resourcePath);
        }else if(tmxFile !== undefined){
            this.initWithTMXFile(tmxFile);
        }
    },
    getMapSize:function () {
        return cc.size(this._mapSize.width, this._mapSize.height);
    },
    setMapSize:function (Var) {
        this._mapSize.width = Var.width;
        this._mapSize.height = Var.height;
    },
	_getMapWidth: function () {
		return this._mapSize.width;
	},
	_setMapWidth: function (width) {
		this._mapSize.width = width;
	},
	_getMapHeight: function () {
		return this._mapSize.height;
	},
	_setMapHeight: function (height) {
		this._mapSize.height = height;
	},
    getTileSize:function () {
        return cc.size(this._tileSize.width, this._tileSize.height);
    },
    setTileSize:function (Var) {
        this._tileSize.width = Var.width;
        this._tileSize.height = Var.height;
    },
	_getTileWidth: function () {
		return this._tileSize.width;
	},
	_setTileWidth: function (width) {
		this._tileSize.width = width;
	},
	_getTileHeight: function () {
		return this._tileSize.height;
	},
	_setTileHeight: function (height) {
		this._tileSize.height = height;
	},
    getMapOrientation:function () {
        return this.mapOrientation;
    },
    setMapOrientation:function (Var) {
        this.mapOrientation = Var;
    },
    getObjectGroups:function () {
        return this.objectGroups;
    },
    setObjectGroups:function (Var) {
        this.objectGroups = Var;
    },
    getProperties:function () {
        return this.properties;
    },
    setProperties:function (Var) {
        this.properties = Var;
    },
    initWithTMXFile:function (tmxFile) {
        if(!tmxFile || tmxFile.length == 0)
            throw "cc.TMXTiledMap.initWithTMXFile(): tmxFile should be non-null or non-empty string.";
	    this.width = 0;
	    this.height = 0;
        var mapInfo = new cc.TMXMapInfo(tmxFile);
        if (!mapInfo)
            return false;
        var locTilesets = mapInfo.getTilesets();
        if(!locTilesets || locTilesets.length === 0)
            cc.log("cc.TMXTiledMap.initWithTMXFile(): Map not found. Please check the filename.");
        this._buildWithMapInfo(mapInfo);
        return true;
    },
    initWithXML:function(tmxString, resourcePath){
        this.width = 0;
	    this.height = 0;
        var mapInfo = new cc.TMXMapInfo(tmxString, resourcePath);
        var locTilesets = mapInfo.getTilesets();
        if(!locTilesets || locTilesets.length === 0)
            cc.log("cc.TMXTiledMap.initWithXML(): Map not found. Please check the filename.");
        this._buildWithMapInfo(mapInfo);
        return true;
    },
    _buildWithMapInfo:function (mapInfo) {
        this._mapSize = mapInfo.getMapSize();
        this._tileSize = mapInfo.getTileSize();
        this.mapOrientation = mapInfo.orientation;
        this.objectGroups = mapInfo.getObjectGroups();
        this.properties = mapInfo.properties;
        this._tileProperties = mapInfo.getTileProperties();
        var idx = 0;
        var layers = mapInfo.getLayers();
        if (layers) {
            var layerInfo = null;
            for (var i = 0, len = layers.length; i < len; i++) {
                layerInfo = layers[i];
                if (layerInfo && layerInfo.visible) {
                    var child = this._parseLayer(layerInfo, mapInfo);
                    this.addChild(child, idx, idx);
	                this.width = Math.max(this.width, child.width);
	                this.height = Math.max(this.height, child.height);
                    idx++;
                }
            }
        }
    },
    allLayers: function () {
        var retArr = [], locChildren = this._children;
        for(var i = 0, len = locChildren.length;i< len;i++){
            var layer = locChildren[i];
            if(layer && layer instanceof cc.TMXLayer)
                retArr.push(layer);
        }
        return retArr;
    },
    getLayer:function (layerName) {
        if(!layerName || layerName.length === 0)
            throw "cc.TMXTiledMap.getLayer(): layerName should be non-null or non-empty string.";
        var locChildren = this._children;
        for (var i = 0; i < locChildren.length; i++) {
            var layer = locChildren[i];
            if (layer && layer.layerName == layerName)
                return layer;
        }
        return null;
    },
    getObjectGroup:function (groupName) {
        if(!groupName || groupName.length === 0)
            throw "cc.TMXTiledMap.getObjectGroup(): groupName should be non-null or non-empty string.";
        if (this.objectGroups) {
            for (var i = 0; i < this.objectGroups.length; i++) {
                var objectGroup = this.objectGroups[i];
                if (objectGroup && objectGroup.groupName == groupName) {
                    return objectGroup;
                }
            }
        }
        return null;
    },
    getProperty:function (propertyName) {
        return this.properties[propertyName.toString()];
    },
    propertiesForGID:function (GID) {
        cc.log("propertiesForGID is deprecated. Please use getPropertiesForGID instead.");
        return this.getPropertiesForGID[GID];
    },
    getPropertiesForGID: function(GID) {
        return this._tileProperties[GID];
    },
    _parseLayer:function (layerInfo, mapInfo) {
        var tileset = this._tilesetForLayer(layerInfo, mapInfo);
        var layer = new cc.TMXLayer(tileset, layerInfo, mapInfo);
        layerInfo.ownTiles = false;
        layer.setupTiles();
        return layer;
    },
    _tilesetForLayer:function (layerInfo, mapInfo) {
        var size = layerInfo._layerSize;
        var tilesets = mapInfo.getTilesets();
        if (tilesets) {
            for (var i = tilesets.length - 1; i >= 0; i--) {
                var tileset = tilesets[i];
                if (tileset) {
                    for (var y = 0; y < size.height; y++) {
                        for (var x = 0; x < size.width; x++) {
                            var pos = x + size.width * y;
                            var gid = layerInfo._tiles[pos];
                            if (gid != 0) {
                                if (((gid & cc.TMX_TILE_FLIPPED_MASK)>>>0) >= tileset.firstGid) {
                                    return tileset;
                                }
                            }
                        }
                    }
                }
            }
        }
        cc.log("cocos2d: Warning: TMX Layer " + layerInfo.name + " has no tiles");
        return null;
    }
});
var _p = cc.TMXTiledMap.prototype;
_p.mapWidth;
cc.defineGetterSetter(_p, "mapWidth", _p._getMapWidth, _p._setMapWidth);
_p.mapHeight;
cc.defineGetterSetter(_p, "mapHeight", _p._getMapHeight, _p._setMapHeight);
_p.tileWidth;
cc.defineGetterSetter(_p, "tileWidth", _p._getTileWidth, _p._setTileWidth);
_p.tileHeight;
cc.defineGetterSetter(_p, "tileHeight", _p._getTileHeight, _p._setTileHeight);
cc.TMXTiledMap.create = function (tmxFile,resourcePath) {
    return new cc.TMXTiledMap(tmxFile,resourcePath);
};
cc.TMX_PROPERTY_NONE = 0;
cc.TMX_PROPERTY_MAP = 1;
cc.TMX_PROPERTY_LAYER = 2;
cc.TMX_PROPERTY_OBJECTGROUP = 3;
cc.TMX_PROPERTY_OBJECT = 4;
cc.TMX_PROPERTY_TILE = 5;
cc.TMX_TILE_HORIZONTAL_FLAG = 0x80000000;
cc.TMX_TILE_VERTICAL_FLAG = 0x40000000;
cc.TMX_TILE_DIAGONAL_FLAG = 0x20000000;
cc.TMX_TILE_FLIPPED_ALL = (cc.TMX_TILE_HORIZONTAL_FLAG | cc.TMX_TILE_VERTICAL_FLAG | cc.TMX_TILE_DIAGONAL_FLAG) >>> 0;
cc.TMX_TILE_FLIPPED_MASK = (~(cc.TMX_TILE_FLIPPED_ALL)) >>> 0;
cc.TMXLayerInfo = cc.Class.extend({
    properties:null,
	name:"",
    _layerSize:null,
    _tiles:null,
    visible:null,
    _opacity:null,
    ownTiles:true,
    _minGID:100000,
    _maxGID:0,
    offset:null,
    ctor:function () {
        this.properties = [];
        this.name = "";
        this._layerSize = null;
        this._tiles = [];
        this.visible = true;
        this._opacity = 0;
        this.ownTiles = true;
        this._minGID = 100000;
        this._maxGID = 0;
        this.offset = cc.p(0,0);
    },
    getProperties:function () {
        return this.properties;
    },
    setProperties:function (value) {
        this.properties = value;
    }
});
cc.TMXTilesetInfo = cc.Class.extend({
    name:"",
    firstGid:0,
    _tileSize:null,
    spacing:0,
    margin:0,
    sourceImage:"",
    imageSize:null,
    ctor:function () {
        this._tileSize = cc.size(0, 0);
        this.imageSize = cc.size(0, 0);
    },
    rectForGID:function (gid) {
        var rect = cc.rect(0, 0, 0, 0);
        rect.width = this._tileSize.width;
        rect.height = this._tileSize.height;
        gid &= cc.TMX_TILE_FLIPPED_MASK;
        gid = gid - parseInt(this.firstGid, 10);
        var max_x = parseInt((this.imageSize.width - this.margin * 2 + this.spacing) / (this._tileSize.width + this.spacing), 10);
        rect.x = parseInt((gid % max_x) * (this._tileSize.width + this.spacing) + this.margin, 10);
        rect.y = parseInt(parseInt(gid / max_x, 10) * (this._tileSize.height + this.spacing) + this.margin, 10);
        return rect;
    }
});
cc.TMXMapInfo = cc.SAXParser.extend({
	properties:null,
    orientation:null,
	parentElement:null,
	parentGID:null,
	layerAttrs:0,
	storingCharacters:false,
	tmxFileName:null,
	currentString:null,
	_objectGroups:null,
    _mapSize:null,
    _tileSize:null,
    _layers:null,
    _tilesets:null,
    _tileProperties:null,
    _resources:"",
    _currentFirstGID:0,
    ctor:function (tmxFile, resourcePath) {
        cc.SAXParser.prototype.ctor.apply(this);
        this._mapSize = cc.size(0, 0);
        this._tileSize = cc.size(0, 0);
        this._layers = [];
        this._tilesets = [];
        this._objectGroups = [];
        this.properties = [];
        this._tileProperties = {};
        this._currentFirstGID = 0;
        if (resourcePath !== undefined) {
            this.initWithXML(tmxFile,resourcePath);
        } else if(tmxFile !== undefined){
            this.initWithTMXFile(tmxFile);
        }
    },
    getOrientation:function () {
        return this.orientation;
    },
    setOrientation:function (value) {
        this.orientation = value;
    },
    getMapSize:function () {
        return cc.size(this._mapSize.width,this._mapSize.height);
    },
    setMapSize:function (value) {
        this._mapSize.width = value.width;
        this._mapSize.height = value.height;
    },
	_getMapWidth: function () {
		return this._mapSize.width;
	},
	_setMapWidth: function (width) {
		this._mapSize.width = width;
	},
	_getMapHeight: function () {
		return this._mapSize.height;
	},
	_setMapHeight: function (height) {
		this._mapSize.height = height;
	},
    getTileSize:function () {
        return cc.size(this._tileSize.width, this._tileSize.height);
    },
    setTileSize:function (value) {
        this._tileSize.width = value.width;
        this._tileSize.height = value.height;
    },
	_getTileWidth: function () {
		return this._tileSize.width;
	},
	_setTileWidth: function (width) {
		this._tileSize.width = width;
	},
	_getTileHeight: function () {
		return this._tileSize.height;
	},
	_setTileHeight: function (height) {
		this._tileSize.height = height;
	},
    getLayers:function () {
        return this._layers;
    },
    setLayers:function (value) {
        this._layers.push(value);
    },
    getTilesets:function () {
        return this._tilesets;
    },
    setTilesets:function (value) {
        this._tilesets.push(value);
    },
    getObjectGroups:function () {
        return this._objectGroups;
    },
    setObjectGroups:function (value) {
        this._objectGroups.push(value);
    },
    getParentElement:function () {
        return this.parentElement;
    },
    setParentElement:function (value) {
        this.parentElement = value;
    },
    getParentGID:function () {
        return this.parentGID;
    },
    setParentGID:function (value) {
        this.parentGID = value;
    },
    getLayerAttribs:function () {
        return this.layerAttrs;
    },
    setLayerAttribs:function (value) {
        this.layerAttrs = value;
    },
    getStoringCharacters:function () {
        return this.storingCharacters;
    },
    setStoringCharacters:function (value) {
        this.storingCharacters = value;
    },
    getProperties:function () {
        return this.properties;
    },
    setProperties:function (value) {
        this.properties = value;
    },
    initWithTMXFile:function (tmxFile) {
        this._internalInit(tmxFile, null);
        return this.parseXMLFile(tmxFile);
    },
    initWithXML:function (tmxString, resourcePath) {
        this._internalInit(null, resourcePath);
        return this.parseXMLString(tmxString);
    },
    parseXMLFile:function (tmxFile, isXmlString) {
        isXmlString = isXmlString || false;
	    var xmlStr = isXmlString ? tmxFile : cc.loader.getRes(tmxFile);
        if(!xmlStr) throw "Please load the resource first : " + tmxFile;
        var mapXML = this._parseXML(xmlStr);
        var i, j;
        var map = mapXML.documentElement;
        var version = map.getAttribute('version');
        var orientationStr = map.getAttribute('orientation');
        if (map.nodeName == "map") {
            if (version != "1.0" && version !== null)
                cc.log("cocos2d: TMXFormat: Unsupported TMX version:" + version);
            if (orientationStr == "orthogonal")
                this.orientation = cc.TMX_ORIENTATION_ORTHO;
            else if (orientationStr == "isometric")
                this.orientation = cc.TMX_ORIENTATION_ISO;
            else if (orientationStr == "hexagonal")
                this.orientation = cc.TMX_ORIENTATION_HEX;
            else if (orientationStr !== null)
                cc.log("cocos2d: TMXFomat: Unsupported orientation:" + orientationStr);
            var mapSize = cc.size(0, 0);
            mapSize.width = parseFloat(map.getAttribute('width'));
            mapSize.height = parseFloat(map.getAttribute('height'));
            this.setMapSize(mapSize);
            mapSize = cc.size(0, 0);
            mapSize.width = parseFloat(map.getAttribute('tilewidth'));
            mapSize.height = parseFloat(map.getAttribute('tileheight'));
            this.setTileSize(mapSize);
            var propertyArr = map.querySelectorAll("map > properties >  property");
            if (propertyArr) {
                var aPropertyDict = {};
                for (i = 0; i < propertyArr.length; i++) {
                    aPropertyDict[propertyArr[i].getAttribute('name')] = propertyArr[i].getAttribute('value');
                }
                this.properties = aPropertyDict;
            }
        }
        var tilesets = map.getElementsByTagName('tileset');
        if (map.nodeName !== "map") {
            tilesets = [];
            tilesets.push(map);
        }
        for (i = 0; i < tilesets.length; i++) {
            var selTileset = tilesets[i];
            var tsxName = selTileset.getAttribute('source');
            if (tsxName) {
                var tsxPath = isXmlString ? cc.path.join(this._resources, tsxName) : cc.path.changeBasename(tmxFile, tsxName);
                this.parseXMLFile(tsxPath);
            } else {
                var tileset = new cc.TMXTilesetInfo();
                tileset.name = selTileset.getAttribute('name') || "";
                tileset.firstGid = parseInt(selTileset.getAttribute('firstgid')) || 0;
                tileset.spacing = parseInt(selTileset.getAttribute('spacing')) || 0;
                tileset.margin = parseInt(selTileset.getAttribute('margin')) || 0;
                var tilesetSize = cc.size(0, 0);
                tilesetSize.width = parseFloat(selTileset.getAttribute('tilewidth'));
                tilesetSize.height = parseFloat(selTileset.getAttribute('tileheight'));
                tileset._tileSize = tilesetSize;
                var image = selTileset.getElementsByTagName('image')[0];
                var imagename = image.getAttribute('source');
                var num = -1;
                
                tileset.imageSize = cc.size(parseInt(image.getAttribute('width')),
                                            parseInt(image.getAttribute('height')));
                
                if(this.tmxFileName)
                    num  = this.tmxFileName.lastIndexOf("/");
                if (num !== -1) {
                    var dir = this.tmxFileName.substr(0, num + 1);
                    tileset.sourceImage = dir + imagename;
                } else {
                    tileset.sourceImage = this._resources + (this._resources ? "/" : "") + imagename;
                }
                this.setTilesets(tileset);
                var tiles = selTileset.getElementsByTagName('tile');
                if (tiles) {
                    for (var tIdx = 0; tIdx < tiles.length; tIdx++) {
                        var t = tiles[tIdx];
                        this.parentGID = parseInt(tileset.firstGid) + parseInt(t.getAttribute('id') || 0);
                        var tp = t.querySelectorAll("properties > property");
                        if (tp) {
                            var dict = {};
                            for (j = 0; j < tp.length; j++) {
                                var name = tp[j].getAttribute('name');
                                dict[name] = tp[j].getAttribute('value');
                            }
                            this._tileProperties[this.parentGID] = dict;
                        }
                    }
                }
            }
        }
        var layers = map.getElementsByTagName('layer');
        if (layers) {
            for (i = 0; i < layers.length; i++) {
                var selLayer = layers[i];
                var data = selLayer.getElementsByTagName('data')[0];
                var layer = new cc.TMXLayerInfo();
                layer.name = selLayer.getAttribute('name');
                var layerSize = cc.size(0, 0);
                layerSize.width = parseFloat(selLayer.getAttribute('width'));
                layerSize.height = parseFloat(selLayer.getAttribute('height'));
                layer._layerSize = layerSize;
                var visible = selLayer.getAttribute('visible');
                layer.visible = !(visible == "0");
                var opacity = selLayer.getAttribute('opacity') || 1;
                if (opacity)
                    layer._opacity = parseInt(255 * parseFloat(opacity));
                else
                    layer._opacity = 255;
                layer.offset = cc.p(parseFloat(selLayer.getAttribute('x')) || 0, parseFloat(selLayer.getAttribute('y')) || 0);
                var nodeValue = '';
                for (j = 0; j < data.childNodes.length; j++) {
                    nodeValue += data.childNodes[j].nodeValue
                }
                nodeValue = nodeValue.trim();
                var compression = data.getAttribute('compression');
                var encoding = data.getAttribute('encoding');
                if(compression && compression !== "gzip" && compression !== "zlib"){
                    cc.log("cc.TMXMapInfo.parseXMLFile(): unsupported compression method");
                    return null;
                }
                switch (compression) {
                    case 'gzip':
                        layer._tiles = cc.unzipBase64AsArray(nodeValue, 4);
                        break;
                    case 'zlib':
                        var inflator = new Zlib.Inflate(cc.Codec.Base64.decodeAsArray(nodeValue, 1));
                        layer._tiles = cc.uint8ArrayToUint32Array(inflator.decompress());
                        break;
                    case null:
                    case '':
                        if (encoding == "base64")
                            layer._tiles = cc.Codec.Base64.decodeAsArray(nodeValue, 4);
                        else if (encoding === "csv") {
                            layer._tiles = [];
                            var csvTiles = nodeValue.split(',');
                            for (var csvIdx = 0; csvIdx < csvTiles.length; csvIdx++)
                                layer._tiles.push(parseInt(csvTiles[csvIdx]));
                        } else {
                            var selDataTiles = data.getElementsByTagName("tile");
                            layer._tiles = [];
                            for (var xmlIdx = 0; xmlIdx < selDataTiles.length; xmlIdx++)
                                layer._tiles.push(parseInt(selDataTiles[xmlIdx].getAttribute("gid")));
                        }
                        break;
                    default:
                        if(this.layerAttrs == cc.TMXLayerInfo.ATTRIB_NONE)
                            cc.log("cc.TMXMapInfo.parseXMLFile(): Only base64 and/or gzip/zlib maps are supported");
                        break;
                }
                var layerProps = selLayer.querySelectorAll("properties > property");
                if (layerProps) {
                    var layerProp = {};
                    for (j = 0; j < layerProps.length; j++) {
                        layerProp[layerProps[j].getAttribute('name')] = layerProps[j].getAttribute('value');
                    }
                    layer.properties = layerProp;
                }
                this.setLayers(layer);
            }
        }
        var objectGroups = map.getElementsByTagName('objectgroup');
        if (objectGroups) {
            for (i = 0; i < objectGroups.length; i++) {
                var selGroup = objectGroups[i];
                var objectGroup = new cc.TMXObjectGroup();
                objectGroup.groupName = selGroup.getAttribute('name');
                objectGroup.setPositionOffset(cc.p(parseFloat(selGroup.getAttribute('x')) * this.getTileSize().width || 0,
                    parseFloat(selGroup.getAttribute('y')) * this.getTileSize().height || 0));
                var groupProps = selGroup.querySelectorAll("objectgroup > properties > property");
                if (groupProps) {
                    for (j = 0; j < groupProps.length; j++) {
                        var groupProp = {};
                        groupProp[groupProps[j].getAttribute('name')] = groupProps[j].getAttribute('value');
                        objectGroup.properties = groupProp;
                    }
                }
                var objects = selGroup.querySelectorAll('object');
                if (objects) {
                    for (j = 0; j < objects.length; j++) {
                        var selObj = objects[j];
                        var objectProp = {};
                        objectProp["name"] = selObj.getAttribute('name') || "";
                        objectProp["type"] = selObj.getAttribute('type') || "";
                        objectProp["x"] = parseInt(selObj.getAttribute('x') || 0) + objectGroup.getPositionOffset().x;
                        var y = parseInt(selObj.getAttribute('y') || 0) + objectGroup.getPositionOffset().y;
                        objectProp["width"] = parseInt(selObj.getAttribute('width')) || 0;
                        objectProp["height"] = parseInt(selObj.getAttribute('height')) || 0;
                        objectProp["y"] = parseInt(this.getMapSize().height * this.getTileSize().height) - y - objectProp["height"];
                        objectProp["rotation"] = parseInt(selObj.getAttribute('rotation')) || 0;
                        var docObjProps = selObj.querySelectorAll("properties > property");
                        if (docObjProps) {
                            for (var k = 0; k < docObjProps.length; k++)
                                objectProp[docObjProps[k].getAttribute('name')] = docObjProps[k].getAttribute('value');
                        }
                        var polygonProps = selObj.querySelectorAll("polygon");
                        if(polygonProps && polygonProps.length > 0) {
                            var selPgPointStr = polygonProps[0].getAttribute('points');
                            if(selPgPointStr)
                                objectProp["polygonPoints"] = this._parsePointsString(selPgPointStr);
                        }
                        var polylineProps = selObj.querySelectorAll("polyline");
                        if(polylineProps && polylineProps.length > 0) {
                            var selPlPointStr = polylineProps[0].getAttribute('points');
                            if(selPlPointStr)
                                objectProp["polylinePoints"] = this._parsePointsString(selPlPointStr);
                        }
                        objectGroup.setObjects(objectProp);
                    }
                }
                this.setObjectGroups(objectGroup);
            }
        }
        return map;
    },
    _parsePointsString:function(pointsString){
         if(!pointsString)
            return null;
        var points = [];
        var pointsStr = pointsString.split(' ');
        for(var i = 0; i < pointsStr.length; i++){
            var selPointStr = pointsStr[i].split(',');
            points.push({'x':selPointStr[0], 'y':selPointStr[1]});
        }
        return points;
    },
    parseXMLString:function (xmlString) {
        return this.parseXMLFile(xmlString, true);
    },
    getTileProperties:function () {
        return this._tileProperties;
    },
    setTileProperties:function (tileProperties) {
        this._tileProperties.push(tileProperties);
    },
    getCurrentString:function () {
        return this.currentString;
    },
    setCurrentString:function (currentString) {
        this.currentString = currentString;
    },
    getTMXFileName:function () {
        return this.tmxFileName;
    },
    setTMXFileName:function (fileName) {
        this.tmxFileName = fileName;
    },
    _internalInit:function (tmxFileName, resourcePath) {
        this._tilesets.length = 0;
        this._layers.length = 0;
        this.tmxFileName = tmxFileName;
        if (resourcePath)
            this._resources = resourcePath;
        this._objectGroups.length = 0;
        this.properties.length = 0;
        this._tileProperties.length = 0;
        this.currentString = "";
        this.storingCharacters = false;
        this.layerAttrs = cc.TMXLayerInfo.ATTRIB_NONE;
        this.parentElement = cc.TMX_PROPERTY_NONE;
        this._currentFirstGID = 0;
    }
});
var _p = cc.TMXMapInfo.prototype;
_p.mapWidth;
cc.defineGetterSetter(_p, "mapWidth", _p._getMapWidth, _p._setMapWidth);
_p.mapHeight;
cc.defineGetterSetter(_p, "mapHeight", _p._getMapHeight, _p._setMapHeight);
_p.tileWidth;
cc.defineGetterSetter(_p, "tileWidth", _p._getTileWidth, _p._setTileWidth);
_p.tileHeight;
cc.defineGetterSetter(_p, "tileHeight", _p._getTileHeight, _p._setTileHeight);
cc.TMXMapInfo.create = function (tmxFile, resourcePath) {
    return new cc.TMXMapInfo(tmxFile, resourcePath);
};
cc.loader.register(["tmx", "tsx"], cc._txtLoader);
cc.TMXLayerInfo.ATTRIB_NONE = 1 << 0;
cc.TMXLayerInfo.ATTRIB_BASE64 = 1 << 1;
cc.TMXLayerInfo.ATTRIB_GZIP = 1 << 2;
cc.TMXLayerInfo.ATTRIB_ZLIB = 1 << 3;
cc.TMXObjectGroup = cc.Class.extend({
	properties: null,
    groupName: "",
    _positionOffset: null,
    _objects: null,
    ctor:function () {
        this.groupName = "";
        this._positionOffset = cc.p(0,0);
        this.properties = [];
        this._objects = [];
    },
    getPositionOffset:function () {
        return cc.p(this._positionOffset);
    },
    setPositionOffset:function (offset) {
        this._positionOffset.x = offset.x;
        this._positionOffset.y = offset.y;
    },
    getProperties:function () {
        return this.properties;
    },
    setProperties:function (Var) {
        this.properties.push(Var);
    },
    getGroupName:function () {
        return this.groupName.toString();
    },
    setGroupName:function (groupName) {
        this.groupName = groupName;
    },
    propertyNamed:function (propertyName) {
        return this.properties[propertyName];
    },
    objectNamed:function (objectName) {
        if (this._objects && this._objects.length > 0) {
            var locObjects = this._objects;
            for (var i = 0, len = locObjects.length; i < len; i++) {
                var name = locObjects[i]["name"];
                if (name && name == objectName)
                    return locObjects[i];
            }
        }
        return null;
    },
    getObjects:function () {
        return this._objects;
    },
    setObjects:function (objects) {
        this._objects.push(objects);
    }
});
cc.TMXLayer = cc.SpriteBatchNode.extend({
	tiles: null,
	tileset: null,
	layerOrientation: null,
	properties: null,
	layerName: "",
    _layerSize: null,
    _mapTileSize: null,
    _opacity: 255,
    _minGID: null,
    _maxGID: null,
    _vertexZvalue: null,
    _useAutomaticVertexZ: null,
    _reusedTile: null,
    _atlasIndexArray: null,
    _contentScaleFactor: null,
    _className:"TMXLayer",
    ctor:function (tilesetInfo, layerInfo, mapInfo) {
        cc.SpriteBatchNode.prototype.ctor.call(this);
        this._descendants = [];
        this._layerSize = cc.size(0, 0);
        this._mapTileSize = cc.size(0, 0);
        if(mapInfo !== undefined)
            this.initWithTilesetInfo(tilesetInfo, layerInfo, mapInfo);
    },
    _createRenderCmd: function(){
        if(cc._renderType === cc._RENDER_TYPE_CANVAS)
            return new cc.TMXLayer.CanvasRenderCmd(this);
        else
            return new cc.TMXLayer.WebGLRenderCmd(this);
    },
    setContentSize:function (size, height) {
	    cc.Node.prototype.setContentSize.call(this, size, height);
        this._renderCmd._updateCacheContext(size, height);
    },
	getTexture: function(){
        return this._renderCmd.getTexture();
    },
    getLayerSize:function () {
        return cc.size(this._layerSize.width, this._layerSize.height);
    },
    setLayerSize:function (Var) {
        this._layerSize.width = Var.width;
        this._layerSize.height = Var.height;
    },
	_getLayerWidth: function () {
		return this._layerSize.width;
	},
	_setLayerWidth: function (width) {
		this._layerSize.width = width;
	},
	_getLayerHeight: function () {
		return this._layerSize.height;
	},
	_setLayerHeight: function (height) {
		this._layerSize.height = height;
	},
    getMapTileSize:function () {
        return cc.size(this._mapTileSize.width,this._mapTileSize.height);
    },
    setMapTileSize:function (Var) {
        this._mapTileSize.width = Var.width;
        this._mapTileSize.height = Var.height;
    },
	_getTileWidth: function () {
		return this._mapTileSize.width;
	},
	_setTileWidth: function (width) {
		this._mapTileSize.width = width;
	},
	_getTileHeight: function () {
		return this._mapTileSize.height;
	},
	_setTileHeight: function (height) {
		this._mapTileSize.height = height;
	},
    getTiles:function () {
        return this.tiles;
    },
    setTiles:function (Var) {
        this.tiles = Var;
    },
    getTileset:function () {
        return this.tileset;
    },
    setTileset:function (Var) {
        this.tileset = Var;
    },
    getLayerOrientation:function () {
        return this.layerOrientation;
    },
    setLayerOrientation:function (Var) {
        this.layerOrientation = Var;
    },
    getProperties:function () {
        return this.properties;
    },
    setProperties:function (Var) {
        this.properties = Var;
    },
    initWithTilesetInfo:function (tilesetInfo, layerInfo, mapInfo) {
        var size = layerInfo._layerSize;
        var totalNumberOfTiles = parseInt(size.width * size.height);
        var capacity = totalNumberOfTiles * 0.35 + 1;
        var texture;
        if (tilesetInfo)
            texture = cc.textureCache.addImage(tilesetInfo.sourceImage);
        if (this.initWithTexture(texture, capacity)) {
            this.layerName = layerInfo.name;
            this._layerSize = size;
            this.tiles = layerInfo._tiles;
            this._minGID = layerInfo._minGID;
            this._maxGID = layerInfo._maxGID;
            this._opacity = layerInfo._opacity;
            this.properties = layerInfo.properties;
            this._contentScaleFactor = cc.director.getContentScaleFactor();
            this.tileset = tilesetInfo;
            this._mapTileSize = mapInfo.getTileSize();
            this.layerOrientation = mapInfo.orientation;
            var offset = this._calculateLayerOffset(layerInfo.offset);
            this.setPosition(cc.pointPixelsToPoints(offset));
            this._atlasIndexArray = [];
            this.setContentSize(cc.sizePixelsToPoints(cc.size(this._layerSize.width * this._mapTileSize.width,
                this._layerSize.height * this._mapTileSize.height)));
            this._useAutomaticVertexZ = false;
            this._vertexZvalue = 0;
            return true;
        }
        return false;
    },
    releaseMap:function () {
        if (this.tiles)
            this.tiles = null;
        if (this._atlasIndexArray)
            this._atlasIndexArray = null;
    },
    getTileAt: function (pos, y) {
        if(!isDefined(pos) || pos == null)
            throw "cc.TMXLayer.getTileAt(): pos should be non-null";
        if(y !== undefined)
            pos = cc.p(pos, y);
        if(pos.x >= this._layerSize.width || pos.y >= this._layerSize.height || pos.x < 0 || pos.y < 0)
            throw "cc.TMXLayer.getTileAt(): invalid position";
        if(!this.tiles || !this._atlasIndexArray){
            cc.log("cc.TMXLayer.getTileAt(): TMXLayer: the tiles map has been released");
            return null;
        }
        var tile = null, gid = this.getTileGIDAt(pos);
        if (gid === 0)
            return tile;
        var z = 0 | (pos.x + pos.y * this._layerSize.width);
        tile = this.getChildByTag(z);
        if (!tile) {
            var rect = this.tileset.rectForGID(gid);
            rect = cc.rectPixelsToPoints(rect);
            tile = new cc.Sprite();
            tile.initWithTexture(this.texture, rect);
            tile.batchNode = this;
            tile.setPosition(this.getPositionAt(pos));
            tile.vertexZ = this._vertexZForPos(pos);
            tile.anchorX = 0;
	        tile.anchorY = 0;
            tile.opacity = this._opacity;
            var indexForZ = this._atlasIndexForExistantZ(z);
            this.addSpriteWithoutQuad(tile, indexForZ, z);
        }
        return tile;
    },
    getTileGIDAt:function (pos, y) {
        if(!pos)
            throw "cc.TMXLayer.getTileGIDAt(): pos should be non-null";
        if(y !== undefined)
            pos = cc.p(pos, y);
        if(pos.x >= this._layerSize.width || pos.y >= this._layerSize.height || pos.x < 0 || pos.y < 0)
            throw "cc.TMXLayer.getTileGIDAt(): invalid position";
        if(!this.tiles || !this._atlasIndexArray){
            cc.log("cc.TMXLayer.getTileGIDAt(): TMXLayer: the tiles map has been released");
            return null;
        }
        var idx = 0 | (pos.x + pos.y * this._layerSize.width);
        var tile = this.tiles[idx];
        return (tile & cc.TMX_TILE_FLIPPED_MASK) >>> 0;
    },
    getTileFlagsAt:function (pos, y) {
        if(!pos)
            throw "cc.TMXLayer.getTileFlagsAt(): pos should be non-null";
        if(y !== undefined)
            pos = cc.p(pos, y);
        if(pos.x >= this._layerSize.width || pos.y >= this._layerSize.height || pos.x < 0 || pos.y < 0)
            throw "cc.TMXLayer.getTileFlagsAt(): invalid position";
        if(!this.tiles || !this._atlasIndexArray){
            cc.log("cc.TMXLayer.getTileFlagsAt(): TMXLayer: the tiles map has been released");
            return null;
        }
        var idx = 0 | (pos.x + pos.y * this._layerSize.width);
        var tile = this.tiles[idx];
        return (tile & cc.TMX_TILE_FLIPPED_ALL) >>> 0;
    },
    setTileGID: function(gid, posOrX, flagsOrY, flags) {
        if(!posOrX)
            throw "cc.TMXLayer.setTileGID(): pos should be non-null";
        var pos;
        if (flags !== undefined) {
            pos = cc.p(posOrX, flagsOrY);
        } else {
            pos = posOrX;
            flags = flagsOrY;
        }
        if(pos.x >= this._layerSize.width || pos.y >= this._layerSize.height || pos.x < 0 || pos.y < 0)
            throw "cc.TMXLayer.setTileGID(): invalid position";
        if(!this.tiles || !this._atlasIndexArray){
            cc.log("cc.TMXLayer.setTileGID(): TMXLayer: the tiles map has been released");
            return;
        }
        if(gid !== 0 && gid < this.tileset.firstGid){
            cc.log( "cc.TMXLayer.setTileGID(): invalid gid:" + gid);
            return;
        }
        flags = flags || 0;
        this._setNodeDirtyForCache();
        var currentFlags = this.getTileFlagsAt(pos);
        var currentGID = this.getTileGIDAt(pos);
        if (currentGID != gid || currentFlags != flags) {
            var gidAndFlags = (gid | flags) >>> 0;
            if (gid === 0)
                this.removeTileAt(pos);
            else if (currentGID === 0)
                this._insertTileForGID(gidAndFlags, pos);
            else {
                var z = pos.x + pos.y * this._layerSize.width;
                var sprite = this.getChildByTag(z);
                if (sprite) {
                    var rect = this.tileset.rectForGID(gid);
                    rect = cc.rectPixelsToPoints(rect);
                    sprite.setTextureRect(rect, false);
                    if (flags != null)
                        this._setupTileSprite(sprite, pos, gidAndFlags);
                    this.tiles[z] = gidAndFlags;
                } else
                    this._updateTileForGID(gidAndFlags, pos);
            }
        }
    },
    removeTileAt:function (pos, y) {
        if(!pos)
            throw "cc.TMXLayer.removeTileAt(): pos should be non-null";
        if(y !== undefined)
            pos = cc.p(pos, y);
        if(pos.x >= this._layerSize.width || pos.y >= this._layerSize.height || pos.x < 0 || pos.y < 0)
            throw "cc.TMXLayer.removeTileAt(): invalid position";
        if(!this.tiles || !this._atlasIndexArray){
            cc.log("cc.TMXLayer.removeTileAt(): TMXLayer: the tiles map has been released");
            return;
        }
        var gid = this.getTileGIDAt(pos);
        if (gid !== 0) {
            if (cc._renderType === cc._RENDER_TYPE_CANVAS)
                this._setNodeDirtyForCache();
            var z = 0 | (pos.x + pos.y * this._layerSize.width);
            var atlasIndex = this._atlasIndexForExistantZ(z);
            this.tiles[z] = 0;
            this._atlasIndexArray.splice(atlasIndex, 1);
            var sprite = this.getChildByTag(z);
            if (sprite)
                cc.SpriteBatchNode.prototype.removeChild.call(this, sprite, true);
            else {
                if(cc._renderType === cc._RENDER_TYPE_WEBGL)
                    this.textureAtlas.removeQuadAtIndex(atlasIndex);
                if (this._children) {
                    var locChildren = this._children;
                    for (var i = 0, len = locChildren.length; i < len; i++) {
                        var child = locChildren[i];
                        if (child) {
                            var ai = child.atlasIndex;
                            if (ai >= atlasIndex)
                                child.atlasIndex = ai - 1;
                        }
                    }
                }
            }
        }
    },
    getPositionAt:function (pos, y) {
        if (y !== undefined)
            pos = cc.p(pos, y);
        var ret = cc.p(0,0);
        switch (this.layerOrientation) {
            case cc.TMX_ORIENTATION_ORTHO:
                ret = this._positionForOrthoAt(pos);
                break;
            case cc.TMX_ORIENTATION_ISO:
                ret = this._positionForIsoAt(pos);
                break;
            case cc.TMX_ORIENTATION_HEX:
                ret = this._positionForHexAt(pos);
                break;
        }
        return cc.pointPixelsToPoints(ret);
    },
    getProperty:function (propertyName) {
        return this.properties[propertyName];
    },
    setupTiles:function () {
//        this._renderCmd.initImageSize();
        this._parseInternalProperties();
        if (cc._renderType === cc._RENDER_TYPE_CANVAS)
            this._setNodeDirtyForCache();
        var locLayerHeight = this._layerSize.height, locLayerWidth = this._layerSize.width;
        for (var y = 0; y < locLayerHeight; y++) {
            for (var x = 0; x < locLayerWidth; x++) {
                var pos = x + locLayerWidth * y;
                var gid = this.tiles[pos];
                if (gid !== 0) {
                    this._appendTileForGID(gid, cc.p(x, y));
                    this._minGID = Math.min(gid, this._minGID);
                    this._maxGID = Math.max(gid, this._maxGID);
                }
            }
        }
        if (!((this._maxGID >= this.tileset.firstGid) && (this._minGID >= this.tileset.firstGid))) {
            cc.log("cocos2d:TMX: Only 1 tileset per layer is supported");
        }
    },
    addChild:function (child, zOrder, tag) {
        cc.log("addChild: is not supported on cc.TMXLayer. Instead use setTileGID or tileAt.");
    },
    removeChild:function (sprite, cleanup) {
        if (!sprite)
            return;
        if(this._children.indexOf(sprite) === -1){
            cc.log("cc.TMXLayer.removeChild(): Tile does not belong to TMXLayer");
            return;
        }
        if (cc._renderType === cc._RENDER_TYPE_CANVAS)
            this._setNodeDirtyForCache();
        var atlasIndex = sprite.atlasIndex;
        var zz = this._atlasIndexArray[atlasIndex];
        this.tiles[zz] = 0;
        this._atlasIndexArray.splice(atlasIndex, 1);
        cc.SpriteBatchNode.prototype.removeChild.call(this, sprite, cleanup);
        cc.renderer.childrenOrderDirty = true;
    },
    getLayerName:function () {
        return this.layerName;
    },
    setLayerName:function (layerName) {
        this.layerName = layerName;
    },
    _positionForIsoAt:function (pos) {
        return cc.p(this._mapTileSize.width / 2 * ( this._layerSize.width + pos.x - pos.y - 1),
            this._mapTileSize.height / 2 * (( this._layerSize.height * 2 - pos.x - pos.y) - 2));
    },
    _positionForOrthoAt:function (pos) {
        return cc.p(pos.x * this._mapTileSize.width,
            (this._layerSize.height - pos.y - 1) * this._mapTileSize.height);
    },
    _positionForHexAt:function (pos) {
        var diffY = (pos.x % 2 == 1) ? (-this._mapTileSize.height / 2) : 0;
        return cc.p(pos.x * this._mapTileSize.width * 3 / 4,
            (this._layerSize.height - pos.y - 1) * this._mapTileSize.height + diffY);
    },
    _calculateLayerOffset:function (pos) {
        var ret = cc.p(0,0);
        switch (this.layerOrientation) {
            case cc.TMX_ORIENTATION_ORTHO:
                ret = cc.p(pos.x * this._mapTileSize.width, -pos.y * this._mapTileSize.height);
                break;
            case cc.TMX_ORIENTATION_ISO:
                ret = cc.p((this._mapTileSize.width / 2) * (pos.x - pos.y),
                    (this._mapTileSize.height / 2 ) * (-pos.x - pos.y));
                break;
            case cc.TMX_ORIENTATION_HEX:
                if(pos.x !== 0 || pos.y !== 0)
                    cc.log("offset for hexagonal map not implemented yet");
                break;
        }
        return ret;
    },
    _appendTileForGID:function (gid, pos) {
        var rect = this.tileset.rectForGID(gid);
        rect = cc.rectPixelsToPoints(rect);
        var z = 0 | (pos.x + pos.y * this._layerSize.width);
        var tile = this._renderCmd._reusedTileWithRect(rect);
        this._setupTileSprite(tile, pos, gid);
        var indexForZ = this._atlasIndexArray.length;
        this.insertQuadFromSprite(tile, indexForZ);
        this._atlasIndexArray.splice(indexForZ, 0, z);
        return tile;
    },
    _insertTileForGID:function (gid, pos) {
        var rect = this.tileset.rectForGID(gid);
        rect = cc.rectPixelsToPoints(rect);
        var z = 0 | (pos.x + pos.y * this._layerSize.width);
        var tile = this._renderCmd._reusedTileWithRect(rect);
        this._setupTileSprite(tile, pos, gid);
        var indexForZ = this._atlasIndexForNewZ(z);
        this.insertQuadFromSprite(tile, indexForZ);
        this._atlasIndexArray.splice(indexForZ, 0, z);
        if (this._children) {
            var locChildren = this._children;
            for (var i = 0, len = locChildren.length; i < len; i++) {
                var child = locChildren[i];
                if (child) {
                    var ai = child.atlasIndex;
                    if (ai >= indexForZ)
                        child.atlasIndex = ai + 1;
                }
            }
        }
        this.tiles[z] = gid;
        return tile;
    },
    _updateTileForGID:function (gid, pos) {
        var rect = this.tileset.rectForGID(gid);
        var locScaleFactor = this._contentScaleFactor;
        rect = cc.rect(rect.x / locScaleFactor, rect.y / locScaleFactor,
            rect.width / locScaleFactor, rect.height / locScaleFactor);
        var z = pos.x + pos.y * this._layerSize.width;
        var tile = this._renderCmd._reusedTileWithRect(rect);
        this._setupTileSprite(tile, pos, gid);
        tile.atlasIndex = this._atlasIndexForExistantZ(z);
        tile.dirty = true;
        tile.updateTransform();
        this.tiles[z] = gid;
        return tile;
    },
    _parseInternalProperties:function () {
        var vertexz = this.getProperty("cc_vertexz");
        if (vertexz) {
            if (vertexz == "automatic") {
                this._useAutomaticVertexZ = true;
                var alphaFuncVal = this.getProperty("cc_alpha_func");
                var alphaFuncValue = 0;
                if (alphaFuncVal)
                    alphaFuncValue = parseFloat(alphaFuncVal);
                if (cc._renderType === cc._RENDER_TYPE_WEBGL) {
                    this.shaderProgram = cc.shaderCache.programForKey(cc.SHADER_POSITION_TEXTURECOLORALPHATEST);
                    var alphaValueLocation = cc._renderContext.getUniformLocation(this.shaderProgram.getProgram(), cc.UNIFORM_ALPHA_TEST_VALUE_S);
                    this.shaderProgram.use();
                    this.shaderProgram.setUniformLocationWith1f(alphaValueLocation, alphaFuncValue);
                }
            } else
                this._vertexZvalue = parseInt(vertexz, 10);
        }
    },
    _setupTileSprite:function (sprite, pos, gid) {
        var z = pos.x + pos.y * this._layerSize.width;
        sprite.setPosition(this.getPositionAt(pos));
        if (cc._renderType === cc._RENDER_TYPE_WEBGL)
            sprite.vertexZ = this._vertexZForPos(pos);
        else
            sprite.tag = z;
        sprite.anchorX = 0;
	    sprite.anchorY = 0;
        sprite.opacity = this._opacity;
        if (cc._renderType === cc._RENDER_TYPE_WEBGL) {
            sprite.rotation = 0.0;
        }
        sprite.setFlippedX(false);
        sprite.setFlippedY(false);
        if ((gid & cc.TMX_TILE_DIAGONAL_FLAG) >>> 0) {
            sprite.anchorX = 0.5;
	        sprite.anchorY = 0.5;
            sprite.x = this.getPositionAt(pos).x + sprite.width / 2;
	        sprite.y = this.getPositionAt(pos).y + sprite.height / 2;
            var flag = (gid & (cc.TMX_TILE_HORIZONTAL_FLAG | cc.TMX_TILE_VERTICAL_FLAG) >>> 0) >>> 0;
            if (flag == cc.TMX_TILE_HORIZONTAL_FLAG)
                sprite.rotation = 90;
            else if (flag == cc.TMX_TILE_VERTICAL_FLAG)
                sprite.rotation = 270;
            else if (flag == (cc.TMX_TILE_VERTICAL_FLAG | cc.TMX_TILE_HORIZONTAL_FLAG) >>> 0) {
                sprite.rotation = 90;
	            sprite.setFlippedX(true);
            } else {
                sprite.rotation = 270;
	            sprite.setFlippedX(true);
            }
        } else {
            if ((gid & cc.TMX_TILE_HORIZONTAL_FLAG) >>> 0) {
                sprite.setFlippedX(true);
            }
            if ((gid & cc.TMX_TILE_VERTICAL_FLAG) >>> 0) {
                sprite.setFlippedY(true);
            }
        }
    },
    _vertexZForPos:function (pos) {
        var ret = 0;
        var maxVal = 0;
        if (this._useAutomaticVertexZ) {
            switch (this.layerOrientation) {
                case cc.TMX_ORIENTATION_ISO:
                    maxVal = this._layerSize.width + this._layerSize.height;
                    ret = -(maxVal - (pos.x + pos.y));
                    break;
                case cc.TMX_ORIENTATION_ORTHO:
                    ret = -(this._layerSize.height - pos.y);
                    break;
                case cc.TMX_ORIENTATION_HEX:
                    cc.log("TMX Hexa zOrder not supported");
                    break;
                default:
                    cc.log("TMX invalid value");
                    break;
            }
        } else
            ret = this._vertexZvalue;
        return ret;
    },
    _atlasIndexForExistantZ:function (z) {
        var item;
        if (this._atlasIndexArray) {
            var locAtlasIndexArray = this._atlasIndexArray;
            for (var i = 0, len = locAtlasIndexArray.length; i < len; i++) {
                item = locAtlasIndexArray[i];
                if (item == z)
                    break;
            }
        }
        if(!cc.isNumber(item))
            cc.log("cc.TMXLayer._atlasIndexForExistantZ(): TMX atlas index not found. Shall not happen");
        return i;
    },
    _atlasIndexForNewZ:function (z) {
        var locAtlasIndexArray = this._atlasIndexArray;
        for (var i = 0, len = locAtlasIndexArray.length; i < len; i++) {
            var val = locAtlasIndexArray[i];
            if (z < val)
                break;
        }
        return i;
    }
});
var _p = cc.TMXLayer.prototype;
cc.defineGetterSetter(_p, "texture", _p.getTexture, _p.setTexture);
_p.layerWidth;
cc.defineGetterSetter(_p, "layerWidth", _p._getLayerWidth, _p._setLayerWidth);
_p.layerHeight;
cc.defineGetterSetter(_p, "layerHeight", _p._getLayerHeight, _p._setLayerHeight);
_p.tileWidth;
cc.defineGetterSetter(_p, "tileWidth", _p._getTileWidth, _p._setTileWidth);
_p.tileHeight;
cc.defineGetterSetter(_p, "tileHeight", _p._getTileHeight, _p._setTileHeight);
cc.TMXLayer.create = function (tilesetInfo, layerInfo, mapInfo) {
    return new cc.TMXLayer(tilesetInfo, layerInfo, mapInfo);
};
(function(){
    cc.TMXLayer.CanvasRenderCmd = function(renderable){
        cc.SpriteBatchNode.CanvasRenderCmd.call(this, renderable);
        this._needDraw = true;
        this._realWorldTransform = {a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0};
        this._childrenRenderCmds = [];
        var locCanvas = cc._canvas;
        var tmpCanvas = cc.newElement('canvas');
        tmpCanvas.width = locCanvas.width;
        tmpCanvas.height = locCanvas.height;
        this._cacheCanvas = tmpCanvas;
        this._cacheContext = new cc.CanvasContextWrapper(this._cacheCanvas.getContext('2d'));
        var tempTexture = new cc.Texture2D();
        tempTexture.initWithElement(tmpCanvas);
        tempTexture.handleLoadedTexture();
        this._cacheTexture = tempTexture;
        this._cacheDirty = false;
    };
    var proto = cc.TMXLayer.CanvasRenderCmd.prototype = Object.create(cc.SpriteBatchNode.CanvasRenderCmd.prototype);
    proto.constructor = cc.TMXLayer.CanvasRenderCmd;
    proto._copyRendererCmds = function (rendererCmds) {
        if (!rendererCmds)
            return;
        var locCacheCmds = this._childrenRenderCmds;
        locCacheCmds.length = 0;
        for (var i = 0, len = rendererCmds.length; i < len; i++) {
            locCacheCmds[i] = rendererCmds[i];
        }
    };
    proto._setNodeDirtyForCache = function () {
        this._cacheDirty  = true;
    };
    proto._renderingChildToCache = function (scaleX, scaleY) {
        if (this._cacheDirty) {
            var locCacheCmds = this._childrenRenderCmds, wrapper = this._cacheContext,
                context = wrapper.getContext(), locCanvas = this._cacheCanvas;
            context.setTransform(1, 0, 0, 1, 0, 0);
            context.clearRect(0, 0, locCanvas.width, locCanvas.height);
            for (var i = 0, len = locCacheCmds.length; i < len; i++) {
                locCacheCmds[i].rendering(wrapper, scaleX, scaleY);
                locCacheCmds[i]._cacheDirty = false;
            }
            this._cacheDirty = false;
        }
    };
    proto.rendering = function (ctx, scaleX, scaleY) {
        var alpha = this._displayedOpacity / 255;
        if (alpha <= 0)
            return;
        var node = this._node;
        this._renderingChildToCache(scaleX, scaleY);
        var wrapper = ctx || cc._renderContext, context = wrapper.getContext();
        wrapper.setGlobalAlpha(alpha);
        var posX = 0 | ( -this._anchorPointInPoints.x), posY = 0 | ( -this._anchorPointInPoints.y);
        var locCacheCanvas = this._cacheCanvas;
        if (locCacheCanvas && locCacheCanvas.width !== 0 && locCacheCanvas.height !== 0) {
            wrapper.setTransform(this._realWorldTransform, scaleX, scaleY);
            var locCanvasHeight = locCacheCanvas.height * scaleY;
            if (node.layerOrientation === cc.TMX_ORIENTATION_HEX) {
                var halfTileSize = node._mapTileSize.height * 0.5 * scaleY;
                context.drawImage(locCacheCanvas, 0, 0, locCacheCanvas.width, locCacheCanvas.height,
                    posX, -(posY + locCanvasHeight) + halfTileSize, locCacheCanvas.width * scaleX, locCanvasHeight);
            } else {
                context.drawImage(locCacheCanvas, 0, 0, locCacheCanvas.width, locCacheCanvas.height,
                    posX, -(posY + locCanvasHeight), locCacheCanvas.width * scaleX, locCanvasHeight);
            }
        }
        cc.g_NumberOfDraws++;
    };
    proto._updateCacheContext = function(size, height){
        var node = this._node,
            locContentSize = node._contentSize,
            locCanvas = this._cacheCanvas,
            scaleFactor = cc.contentScaleFactor();
        locCanvas.width = 0 | (locContentSize.width * 1.5 * scaleFactor);
        locCanvas.height = 0 | (locContentSize.height * 1.5 * scaleFactor);
        if(node.layerOrientation === cc.TMX_ORIENTATION_HEX)
            this._cacheContext.setOffset(0, -node._mapTileSize.height * 0.5);
        else
            this._cacheContext.setOffset(0, 0);
        var locTexContentSize = this._cacheTexture._contentSize;
        locTexContentSize.width = locCanvas.width;
        locTexContentSize.height = locCanvas.height;
    };
    proto.getTexture = function(){
        return this._cacheTexture;
    };
    proto.visit = function(parentCmd){
        var node = this._node;
        var i, len, locChildren = node._children;
        if (!node._visible || !locChildren || locChildren.length === 0)
            return;
        parentCmd = parentCmd || this.getParentRenderCmd();
        if (parentCmd)
            this._curLevel = parentCmd._curLevel + 1;
        this._syncStatus(parentCmd);
        if (this._cacheDirty) {
            var wrapper = this._cacheContext, locCanvas = this._cacheCanvas, context = wrapper.getContext(),
                instanceID = node.__instanceId, renderer = cc.renderer;
            renderer._turnToCacheMode(instanceID);
           node.sortAllChildren();
            for (i = 0, len =  locChildren.length; i < len; i++) {
               if (locChildren[i]){
                  var selCmd = locChildren[i]._renderCmd;
                    if(selCmd){
                        selCmd.visit(this);
                        selCmd._cacheDirty = false;
                    }
                }
           }
            this._copyRendererCmds(renderer._cacheToCanvasCmds[instanceID]);
            context.setTransform(1, 0, 0, 1, 0, 0);
            context.clearRect(0, 0, locCanvas.width, locCanvas.height);
            renderer._renderingToCacheCanvas(wrapper, instanceID);
            this._cacheDirty = false
        }
        cc.renderer.pushRenderCommand(this);
        this._dirtyFlag = 0;
    };
    proto.transform = function (parentCmd, recursive) {
        var t = this.getNodeToParentTransform(),
            worldT = this._realWorldTransform;
        if (parentCmd) {
            var pt = parentCmd._worldTransform;
            worldT.a = t.a * pt.a + t.b * pt.c;
            worldT.b = t.a * pt.b + t.b * pt.d;
            worldT.c = t.c * pt.a + t.d * pt.c;
            worldT.d = t.c * pt.b + t.d * pt.d;
            var plt = parentCmd._transform;
            var xOffset = -(plt.b + plt.c) * t.ty;
            var yOffset = -(plt.b + plt.c) * t.tx;
            worldT.tx = (t.tx * pt.a + t.ty * pt.c + pt.tx + xOffset);
            worldT.ty = (t.tx * pt.b + t.ty * pt.d + pt.ty + yOffset);
        } else {
            worldT.a = t.a;
            worldT.b = t.b;
            worldT.c = t.c;
            worldT.d = t.d;
            worldT.tx = t.tx;
            worldT.ty = t.ty;
        }
        if (recursive) {
            var locChildren = this._node._children;
            if (!locChildren || locChildren.length === 0)
                return;
            var i, len;
            for (i = 0, len = locChildren.length; i < len; i++) {
                locChildren[i]._renderCmd.transform(this, recursive);
            }
        }
    };
//Texture is not yet loaded, so this does not actually set image size.
//Instead image size will be loaded directly from TMX tileset element.
//    proto.initImageSize = function(){
//        var node = this._node;
//        node.tileset.imageSize = this._originalTexture.getContentSizeInPixels();
//    };
    proto._reusedTileWithRect = function(rect){
        var node = this._node;
        node._reusedTile = new cc.Sprite();
        node._reusedTile.initWithTexture(node._renderCmd._texture, rect, false);
        node._reusedTile.batchNode = node;
        node._reusedTile.parent = node;
        node._reusedTile._renderCmd._cachedParent = node._renderCmd;
        return node._reusedTile;
    };
})();
(function(){
    cc.TMXLayer.WebGLRenderCmd = function(renderableObject){
        cc.SpriteBatchNode.WebGLRenderCmd.call(this, renderableObject);
        this._needDraw = true;
    };
    var proto = cc.TMXLayer.WebGLRenderCmd.prototype = Object.create(cc.SpriteBatchNode.WebGLRenderCmd.prototype);
    proto.constructor = cc.TMXLayer.WebGLRenderCmd;
    proto._updateCacheContext = function(){};
    proto.initImageSize = function(){
        var node = this._node;
        node.tileset.imageSize = this._textureAtlas.texture.getContentSizeInPixels();
        this._textureAtlas.texture.setAliasTexParameters();
    };
    proto._reusedTileWithRect = function(rect){
        var node = this._node;
        if (!node._reusedTile) {
            node._reusedTile = new cc.Sprite();
            node._reusedTile.initWithTexture(node.texture, rect, false);
            node._reusedTile.batchNode = node;
        } else {
            node._reusedTile.batchNode = null;
            node._reusedTile.setTextureRect(rect, false);
            node._reusedTile.batchNode = node;
        }
        return node._reusedTile;
    };
})();
cc.PointObject = cc.Class.extend({
    _ratio:null,
    _offset:null,
    _child:null,
    ctor: function(ratio, offset){
        this.initWithCCPoint(ratio, offset);
    },
    getRatio:function () {
        return this._ratio;
    },
    setRatio:function (value) {
        this._ratio = value;
    },
    getOffset:function () {
        return this._offset;
    },
    setOffset:function (value) {
        this._offset = value;
    },
    getChild:function () {
        return this._child;
    },
    setChild:function (value) {
        this._child = value;
    },
    initWithCCPoint:function (ratio, offset) {
        this._ratio = ratio;
        this._offset = offset;
        this._child = null;
        return true;
    }
});
cc.PointObject.create = function (ratio, offset) {
    return new cc.PointObject(ratio, offset);
};
cc.ParallaxNode = cc.Node.extend({
	parallaxArray:null,
    _lastPosition:null,
    _className:"ParallaxNode",
    getParallaxArray:function () {
        return this.parallaxArray;
    },
    setParallaxArray:function (value) {
        this.parallaxArray = value;
    },
    ctor:function () {
        cc.Node.prototype.ctor.call(this);
        this.parallaxArray = [];
        this._lastPosition = cc.p(-100, -100);
    },
    addChild:function (child, z, ratio, offset) {
        if (arguments.length === 3) {
            cc.log("ParallaxNode: use addChild(child, z, ratio, offset) instead");
            return;
        }
        if(!child)
            throw "cc.ParallaxNode.addChild(): child should be non-null";
        var obj = new cc.PointObject(ratio, offset);
        obj.setChild(child);
        this.parallaxArray.push(obj);
	    child.setPosition(this._position.x * ratio.x + offset.x, this._position.y * ratio.y + offset.y);
        cc.Node.prototype.addChild.call(this, child, z, child.tag);
    },
    removeChild:function (child, cleanup) {
        var locParallaxArray = this.parallaxArray;
        for (var i = 0; i < locParallaxArray.length; i++) {
            var point = locParallaxArray[i];
            if (point.getChild() == child) {
                locParallaxArray.splice(i, 1);
                break;
            }
        }
        cc.Node.prototype.removeChild.call(this, child, cleanup);
    },
    removeAllChildren:function (cleanup) {
        this.parallaxArray.length = 0;
        cc.Node.prototype.removeAllChildren.call(this, cleanup);
    },
    _updateParallaxPosition: function(){
        var pos = this._absolutePosition();
        if (!cc.pointEqualToPoint(pos, this._lastPosition)) {
            var locParallaxArray = this.parallaxArray;
            for (var i = 0, len = locParallaxArray.length; i < len; i++) {
                var point = locParallaxArray[i];
                var child = point.getChild();
                child.setPosition(-pos.x + pos.x * point.getRatio().x + point.getOffset().x,
                        -pos.y + pos.y * point.getRatio().y + point.getOffset().y);
            }
            this._lastPosition = pos;
        }
    },
    _absolutePosition:function () {
        var ret = this._position;
        var cn = this;
        while (cn.parent != null) {
            cn = cn.parent;
            ret = cc.pAdd(ret, cn.getPosition());
        }
        return ret;
    },
    _createRenderCmd: function(){
        if(cc._renderType === cc._RENDER_TYPE_CANVAS)
            return new cc.ParallaxNode.CanvasRenderCmd(this);
        else
            return new cc.ParallaxNode.WebGLRenderCmd(this);
    }
});
cc.ParallaxNode.create = function () {
    return new cc.ParallaxNode();
};
(function(){
    cc.ParallaxNode.CanvasRenderCmd = function(renderable){
        cc.Node.CanvasRenderCmd.call(this, renderable);
        this._needDraw = false;
    };
    var proto = cc.ParallaxNode.CanvasRenderCmd.prototype = Object.create(cc.Node.CanvasRenderCmd.prototype);
    proto.constructor = cc.ParallaxNode.CanvasRenderCmd;
    proto.updateStatus = function(){
        this._node._updateParallaxPosition();
        cc.Node.CanvasRenderCmd.prototype.updateStatus.call(this);
    };
    proto._syncStatus = function(parentCmd){
        this._node._updateParallaxPosition();
        cc.Node.CanvasRenderCmd.prototype._syncStatus.call(this, parentCmd);
    }
})();
(function(){
    if(cc._renderType !== cc._RENDER_TYPE_WEBGL)
        return;
    cc.ParallaxNode.WebGLRenderCmd = function(renderable){
        cc.Node.WebGLRenderCmd.call(this, renderable);
        this._needDraw = false;
    };
    var proto = cc.ParallaxNode.WebGLRenderCmd.prototype = Object.create(cc.Node.WebGLRenderCmd.prototype);
    proto.constructor = cc.ParallaxNode.WebGLRenderCmd;
    proto.updateStatus = function(){
        this._node._updateParallaxPosition();
        cc.Node.WebGLRenderCmd.prototype.updateStatus.call(this);
    };
    proto._syncStatus = function(parentCmd){
        this._node._updateParallaxPosition();
        cc.Node.WebGLRenderCmd.prototype._syncStatus.call(this, parentCmd);
    }
})();
