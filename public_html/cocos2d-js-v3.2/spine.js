var sp = sp || {};
sp.VERTEX_INDEX = {
    X1: 0,
    Y1: 1,
    X2: 2,
    Y2: 3,
    X3: 4,
    Y3: 5,
    X4: 6,
    Y4: 7
};
sp.ATTACHMENT_TYPE = {
    REGION: 0,
    BOUNDING_BOX: 1,
    REGION_SEQUENCE: 2
};
sp.Skeleton = cc.Node.extend({
    _skeleton: null,
    _rootBone: null,
    _timeScale: 1,
    _debugSlots: false,
    _debugBones: false,
    _premultipliedAlpha: false,
    _ownsSkeletonData: null,
    _atlas: null,
    _blendFunc: null,
    ctor:function(skeletonDataFile, atlasFile, scale){
        cc.Node.prototype.ctor.call(this);
        this._blendFunc = {src: cc.BLEND_SRC, dst: cc.BLEND_DST};
        if(arguments.length === 0)
            this.init();
        else
            this.initWithArgs(skeletonDataFile, atlasFile, scale);
    },
    _createRenderCmd:function () {
        if(cc._renderType === cc._RENDER_TYPE_CANVAS)
            return new sp.Skeleton.CanvasRenderCmd(this);
        else
            return new sp.Skeleton.WebGLRenderCmd(this);
    },
    init: function () {
        cc.Node.prototype.init.call(this);
        this.setOpacityModifyRGB(true);
        this._blendFunc.src = cc.ONE;
        this._blendFunc.dst = cc.ONE_MINUS_SRC_ALPHA;
        this.scheduleUpdate();
    },
    setDebugSolots:function(enable){
        this._debugSlots = enable;
    },
    setDebugBones:function(enable){
        this._debugBones = enable;
    },
    setTimeScale:function(v){
        this._timeScale = v;
    },
    initWithArgs: function (skeletonDataFile, atlasFile, scale) {
        var argSkeletonFile = skeletonDataFile, argAtlasFile = atlasFile,
            skeletonData, atlas, ownsSkeletonData;
        if (cc.isString(argSkeletonFile)) {
            if (cc.isString(argAtlasFile)) {
                var data = cc.loader.getRes(argAtlasFile);
                sp._atlasLoader.setAtlasFile(argAtlasFile);
                atlas = new spine.Atlas(data, sp._atlasLoader);
            } else {
                atlas = atlasFile;
            }
            scale = scale || 1 / cc.director.getContentScaleFactor();
            var attachmentLoader = new spine.AtlasAttachmentLoader(atlas);
            var skeletonJsonReader = new spine.SkeletonJson(attachmentLoader);
            skeletonJsonReader.scale = scale;
            var skeletonJson = cc.loader.getRes(argSkeletonFile);
            skeletonData = skeletonJsonReader.readSkeletonData(skeletonJson);
            atlas.dispose(skeletonJsonReader);
            ownsSkeletonData = true;
        } else {
            skeletonData = skeletonDataFile;
            ownsSkeletonData = atlasFile;
        }
        this.setSkeletonData(skeletonData, ownsSkeletonData);
        this.init();
    },
    getBoundingBox: function () {
        var minX = cc.FLT_MAX, minY = cc.FLT_MAX, maxX = cc.FLT_MIN, maxY = cc.FLT_MIN;
        var scaleX = this.getScaleX(), scaleY = this.getScaleY(), vertices = [],
            slots = this._skeleton.slots, VERTEX = sp.VERTEX_INDEX;
        for (var i = 0, slotCount = slots.length; i < slotCount; ++i) {
            var slot = slots[i];
            if (!slot.attachment || slot.attachment.type != sp.ATTACHMENT_TYPE.REGION)
                continue;
            var attachment = slot.attachment;
            sp._regionAttachment_computeWorldVertices(attachment, slot.skeleton.x, slot.skeleton.y, slot.bone, vertices);
            minX = Math.min(minX, vertices[VERTEX.X1] * scaleX, vertices[VERTEX.X4] * scaleX, vertices[VERTEX.X2] * scaleX, vertices[VERTEX.X3] * scaleX);
            minY = Math.min(minY, vertices[VERTEX.Y1] * scaleY, vertices[VERTEX.Y4] * scaleY, vertices[VERTEX.Y2] * scaleY, vertices[VERTEX.Y3] * scaleY);
            maxX = Math.max(maxX, vertices[VERTEX.X1] * scaleX, vertices[VERTEX.X4] * scaleX, vertices[VERTEX.X2] * scaleX, vertices[VERTEX.X3] * scaleX);
            maxY = Math.max(maxY, vertices[VERTEX.Y1] * scaleY, vertices[VERTEX.Y4] * scaleY, vertices[VERTEX.Y2] * scaleY, vertices[VERTEX.Y3] * scaleY);
        }
        var position = this.getPosition();
        return cc.rect(position.x + minX, position.y + minY, maxX - minX, maxY - minY);
    },
    updateWorldTransform: function () {
        this._skeleton.updateWorldTransform();
    },
    setToSetupPose: function () {
        this._skeleton.setToSetupPose();
    },
    setBonesToSetupPose: function () {
        this._skeleton.setBonesToSetupPose();
    },
    setSlotsToSetupPose: function () {
        this._skeleton.setSlotsToSetupPose();
    },
    findBone: function (boneName) {
        return this._skeleton.findBone(boneName);
    },
    findSlot: function (slotName) {
        return this._skeleton.findSlot(slotName);
    },
    setSkin: function (skinName) {
        return this._skeleton.setSkinByName(skinName);
    },
    getAttachment: function (slotName, attachmentName) {
        return this._skeleton.getAttachmentBySlotName(slotName, attachmentName);
    },
    setAttachment: function (slotName, attachmentName) {
        this._skeleton.setAttachment(slotName, attachmentName);
    },
    setOpacityModifyRGB: function (alpha) {
        this._premultipliedAlpha = alpha;
    },
    isOpacityModifyRGB: function () {
        return this._premultipliedAlpha;
    },
    setSkeletonData: function (skeletonData, ownsSkeletonData) {
        this._skeleton = new spine.Skeleton(skeletonData);
        this._rootBone = this._skeleton.getRootBone();
        this._ownsSkeletonData = ownsSkeletonData;
        this._renderCmd._createChildFormSkeletonData();
    },
    getTextureAtlas: function (regionAttachment) {
        return regionAttachment.rendererObject.page.rendererObject;
    },
    getBlendFunc: function () {
        return this._blendFunc;
    },
    setBlendFunc: function (src, dst) {
        var locBlendFunc = this._blendFunc;
        if (dst === undefined) {
            locBlendFunc.src = src.src;
            locBlendFunc.dst = src.dst;
        } else {
            locBlendFunc.src = src;
            locBlendFunc.dst = dst;
        }
    },
    update: function (dt) {
        this._skeleton.update(dt);
        this._renderCmd._updateChild();
    }
});
sp.Skeleton.create = function (skeletonDataFile, atlasFile, scale) {
    return new sp.Skeleton(skeletonDataFile, atlasFile, scale);
};
var spine = spine || {};
spine.BoneData = function (name, parent) {
    this.name = name;
    this.parent = parent;
};
spine.BoneData.prototype = {
    length: 0,
    x: 0, y: 0,
    rotation: 0,
    scaleX: 1, scaleY: 1,
    inheritScale: true,
    inheritRotation: true
};
spine.SlotData = function (name, boneData) {
    this.name = name;
    this.boneData = boneData;
    this.r = this.g = this.b = this.a = 1;
};
spine.SlotData.prototype = {
    r: 1, g: 1, b: 1, a: 1,
    attachmentName: null,
    additiveBlending: false
};
spine.Bone = function (boneData, parent) {
    this.data = boneData;
    this.parent = parent;
    this.setToSetupPose();
};
spine.Bone.yDown = false;
spine.Bone.prototype = {
    x: 0, y: 0,
    rotation: 0,
    scaleX: 1, scaleY: 1,
    m00: 0, m01: 0, worldX: 0,
    m10: 0, m11: 0, worldY: 0,
    worldRotation: 0,
    worldScaleX: 1, worldScaleY: 1,
    updateWorldTransform: function (flipX, flipY) {
        var parent = this.parent;
        if (parent != null) {
            this.worldX = this.x * parent.m00 + this.y * parent.m01 + parent.worldX;
            this.worldY = this.x * parent.m10 + this.y * parent.m11 + parent.worldY;
            if (this.data.inheritScale) {
                this.worldScaleX = parent.worldScaleX * this.scaleX;
                this.worldScaleY = parent.worldScaleY * this.scaleY;
            } else {
                this.worldScaleX = this.scaleX;
                this.worldScaleY = this.scaleY;
            }
            this.worldRotation = this.data.inheritRotation ? parent.worldRotation + this.rotation : this.rotation;
        } else {
            this.worldX = flipX ? -this.x : this.x;
            this.worldY = flipY != spine.Bone.yDown ? -this.y : this.y;
            this.worldScaleX = this.scaleX;
            this.worldScaleY = this.scaleY;
            this.worldRotation = this.rotation;
        }
        var radians = this.worldRotation * Math.PI / 180;
        var cos = Math.cos(radians);
        var sin = Math.sin(radians);
        this.m00 = cos * this.worldScaleX;
        this.m10 = sin * this.worldScaleX;
        this.m01 = -sin * this.worldScaleY;
        this.m11 = cos * this.worldScaleY;
        if (flipX) {
            this.m00 = -this.m00;
            this.m01 = -this.m01;
        }
        if (flipY != spine.Bone.yDown) {
            this.m10 = -this.m10;
            this.m11 = -this.m11;
        }
    },
    setToSetupPose: function () {
        var data = this.data;
        this.x = data.x;
        this.y = data.y;
        this.rotation = data.rotation;
        this.scaleX = data.scaleX;
        this.scaleY = data.scaleY;
    }
};
spine.Slot = function (slotData, skeleton, bone) {
    this.data = slotData;
    this.skeleton = skeleton;
    this.bone = bone;
    this.setToSetupPose();
};
spine.Slot.prototype = {
    r: 1, g: 1, b: 1, a: 1,
    _attachmentTime: 0,
    attachment: null,
    setAttachment: function (attachment) {
        this.attachment = attachment;
        this._attachmentTime = this.skeleton.time;
    },
    setAttachmentTime: function (time) {
        this._attachmentTime = this.skeleton.time - time;
    },
    getAttachmentTime: function () {
        return this.skeleton.time - this._attachmentTime;
    },
    setToSetupPose: function () {
        var data = this.data;
        this.r = data.r;
        this.g = data.g;
        this.b = data.b;
        this.a = data.a;
        var slotDatas = this.skeleton.data.slots;
        for (var i = 0, n = slotDatas.length; i < n; i++) {
            if (slotDatas[i] == data) {
                this.setAttachment(!data.attachmentName ? null : this.skeleton.getAttachmentBySlotIndex(i, data.attachmentName));
                break;
            }
        }
    }
};
spine.Skin = function (name) {
    this.name = name;
    this.attachments = {};
};
spine.Skin.prototype = {
    addAttachment: function (slotIndex, name, attachment) {
        this.attachments[slotIndex + ":" + name] = attachment;
    },
    getAttachment: function (slotIndex, name) {
        return this.attachments[slotIndex + ":" + name];
    },
    _attachAll: function (skeleton, oldSkin) {
        console.log(oldSkin.attachments);
        for (var key in oldSkin.attachments) {
            var colon = key.indexOf(":");
            var slotIndex = parseInt(key.substring(0, colon));
            var name = key.substring(colon + 1);
            var slot = skeleton.slots[slotIndex];
            if (slot.attachment && slot.attachment.name == name) {
                var attachment = this.getAttachment(slotIndex, name);
                if (attachment) slot.setAttachment(attachment);
            }
        }
    }
};
spine.Animation = function (name, timelines, duration) {
    this.name = name;
    this.timelines = timelines;
    this.duration = duration;
};
spine.Animation.prototype = {
    apply: function (skeleton, lastTime, time, loop, events) {
        if (loop && this.duration != 0) {
            time %= this.duration;
            lastTime %= this.duration;
        }
        var timelines = this.timelines;
        for (var i = 0, n = timelines.length; i < n; i++)
            timelines[i].apply(skeleton, lastTime, time, events, 1);
    },
    mix: function (skeleton, lastTime, time, loop, events, alpha) {
        if (loop && this.duration != 0) {
            time %= this.duration;
            lastTime %= this.duration;
        }
        var timelines = this.timelines;
        for (var i = 0, n = timelines.length; i < n; i++)
            timelines[i].apply(skeleton, lastTime, time, events, alpha);
    }
};
spine.binarySearch = function (values, target, step) {
    var low = 0;
    var high = Math.floor(values.length / step) - 2;
    if (high == 0) return step;
    var current = high >>> 1;
    while (true) {
        if (values[(current + 1) * step] <= target)
            low = current + 1;
        else
            high = current;
        if (low == high) return (low + 1) * step;
        current = (low + high) >>> 1;
    }
};
spine.linearSearch = function (values, target, step) {
    for (var i = 0, last = values.length - step; i <= last; i += step)
        if (values[i] > target) return i;
    return -1;
};
spine.Curves = function (frameCount) {
    this.curves = [];
    this.curves.length = (frameCount - 1) * 6;
};
spine.Curves.prototype = {
    setLinear: function (frameIndex) {
        this.curves[frameIndex * 6] = 0;
    },
    setStepped: function (frameIndex) {
        this.curves[frameIndex * 6] = -1;
    },
    setCurve: function (frameIndex, cx1, cy1, cx2, cy2) {
        var subdiv_step = 1 / 10;
        var subdiv_step2 = subdiv_step * subdiv_step;
        var subdiv_step3 = subdiv_step2 * subdiv_step;
        var pre1 = 3 * subdiv_step;
        var pre2 = 3 * subdiv_step2;
        var pre4 = 6 * subdiv_step2;
        var pre5 = 6 * subdiv_step3;
        var tmp1x = -cx1 * 2 + cx2;
        var tmp1y = -cy1 * 2 + cy2;
        var tmp2x = (cx1 - cx2) * 3 + 1;
        var tmp2y = (cy1 - cy2) * 3 + 1;
        var i = frameIndex * 6;
        var curves = this.curves;
        curves[i] = cx1 * pre1 + tmp1x * pre2 + tmp2x * subdiv_step3;
        curves[i + 1] = cy1 * pre1 + tmp1y * pre2 + tmp2y * subdiv_step3;
        curves[i + 2] = tmp1x * pre4 + tmp2x * pre5;
        curves[i + 3] = tmp1y * pre4 + tmp2y * pre5;
        curves[i + 4] = tmp2x * pre5;
        curves[i + 5] = tmp2y * pre5;
    },
    getCurvePercent: function (frameIndex, percent) {
        percent = percent < 0 ? 0 : (percent > 1 ? 1 : percent);
        var curveIndex = frameIndex * 6;
        var curves = this.curves;
        var dfx = curves[curveIndex];
        if (!dfx) return percent;
        if (dfx == -1) return 0;
        var dfy = curves[curveIndex + 1];
        var ddfx = curves[curveIndex + 2];
        var ddfy = curves[curveIndex + 3];
        var dddfx = curves[curveIndex + 4];
        var dddfy = curves[curveIndex + 5];
        var x = dfx, y = dfy;
        var i = 10 - 2;
        while (true) {
            if (x >= percent) {
                var lastX = x - dfx;
                var lastY = y - dfy;
                return lastY + (y - lastY) * (percent - lastX) / (x - lastX);
            }
            if (i == 0) break;
            i--;
            dfx += ddfx;
            dfy += ddfy;
            ddfx += dddfx;
            ddfy += dddfy;
            x += dfx;
            y += dfy;
        }
        return y + (1 - y) * (percent - x) / (1 - x);
    }
};
spine.RotateTimeline = function (frameCount) {
    this.curves = new spine.Curves(frameCount);
    this.frames = [];
    this.frames.length = frameCount * 2;
};
spine.RotateTimeline.prototype = {
    boneIndex: 0,
    getFrameCount: function () {
        return this.frames.length / 2;
    },
    setFrame: function (frameIndex, time, angle) {
        frameIndex *= 2;
        this.frames[frameIndex] = time;
        this.frames[frameIndex + 1] = angle;
    },
    apply: function (skeleton, lastTime, time, firedEvents, alpha) {
        var frames = this.frames;
        if (time < frames[0]) return;
        var bone = skeleton.bones[this.boneIndex];
        if (time >= frames[frames.length - 2]) {
            var amount = bone.data.rotation + frames[frames.length - 1] - bone.rotation;
            while (amount > 180)
                amount -= 360;
            while (amount < -180)
                amount += 360;
            bone.rotation += amount * alpha;
            return;
        }
        var frameIndex = spine.binarySearch(frames, time, 2);
        var lastFrameValue = frames[frameIndex - 1];
        var frameTime = frames[frameIndex];
        var percent = 1 - (time - frameTime) / (frames[frameIndex - 2] - frameTime);
        percent = this.curves.getCurvePercent(frameIndex / 2 - 1, percent);
        var amount = frames[frameIndex + 1] - lastFrameValue;
        while (amount > 180)
            amount -= 360;
        while (amount < -180)
            amount += 360;
        amount = bone.data.rotation + (lastFrameValue + amount * percent) - bone.rotation;
        while (amount > 180)
            amount -= 360;
        while (amount < -180)
            amount += 360;
        bone.rotation += amount * alpha;
    }
};
spine.TranslateTimeline = function (frameCount) {
    this.curves = new spine.Curves(frameCount);
    this.frames = [];
    this.frames.length = frameCount * 3;
};
spine.TranslateTimeline.prototype = {
    boneIndex: 0,
    getFrameCount: function () {
        return this.frames.length / 3;
    },
    setFrame: function (frameIndex, time, x, y) {
        frameIndex *= 3;
        this.frames[frameIndex] = time;
        this.frames[frameIndex + 1] = x;
        this.frames[frameIndex + 2] = y;
    },
    apply: function (skeleton, lastTime, time, firedEvents, alpha) {
        var frames = this.frames;
        if (time < frames[0]) return;
        var bone = skeleton.bones[this.boneIndex];
        if (time >= frames[frames.length - 3]) {
            bone.x += (bone.data.x + frames[frames.length - 2] - bone.x) * alpha;
            bone.y += (bone.data.y + frames[frames.length - 1] - bone.y) * alpha;
            return;
        }
        var frameIndex = spine.binarySearch(frames, time, 3);
        var lastFrameX = frames[frameIndex - 2];
        var lastFrameY = frames[frameIndex - 1];
        var frameTime = frames[frameIndex];
        var percent = 1 - (time - frameTime) / (frames[frameIndex + -3] - frameTime);
        percent = this.curves.getCurvePercent(frameIndex / 3 - 1, percent);
        bone.x += (bone.data.x + lastFrameX + (frames[frameIndex + 1] - lastFrameX) * percent - bone.x) * alpha;
        bone.y += (bone.data.y + lastFrameY + (frames[frameIndex + 2] - lastFrameY) * percent - bone.y) * alpha;
    }
};
spine.ScaleTimeline = function (frameCount) {
    this.curves = new spine.Curves(frameCount);
    this.frames = [];
    this.frames.length = frameCount * 3;
};
spine.ScaleTimeline.prototype = {
    boneIndex: 0,
    getFrameCount: function () {
        return this.frames.length / 3;
    },
    setFrame: function (frameIndex, time, x, y) {
        frameIndex *= 3;
        this.frames[frameIndex] = time;
        this.frames[frameIndex + 1] = x;
        this.frames[frameIndex + 2] = y;
    },
    apply: function (skeleton, lastTime, time, firedEvents, alpha) {
        var frames = this.frames;
        if (time < frames[0]) return;
        var bone = skeleton.bones[this.boneIndex];
        if (time >= frames[frames.length - 3]) {
            bone.scaleX += (bone.data.scaleX - 1 + frames[frames.length - 2] - bone.scaleX) * alpha;
            bone.scaleY += (bone.data.scaleY - 1 + frames[frames.length - 1] - bone.scaleY) * alpha;
            return;
        }
        var frameIndex = spine.binarySearch(frames, time, 3);
        var lastFrameX = frames[frameIndex - 2];
        var lastFrameY = frames[frameIndex - 1];
        var frameTime = frames[frameIndex];
        var percent = 1 - (time - frameTime) / (frames[frameIndex + -3] - frameTime);
        percent = this.curves.getCurvePercent(frameIndex / 3 - 1, percent);
        bone.scaleX += (bone.data.scaleX - 1 + lastFrameX + (frames[frameIndex + 1] - lastFrameX) * percent - bone.scaleX) * alpha;
        bone.scaleY += (bone.data.scaleY - 1 + lastFrameY + (frames[frameIndex + 2] - lastFrameY) * percent - bone.scaleY) * alpha;
    }
};
spine.ColorTimeline = function (frameCount) {
    this.curves = new spine.Curves(frameCount);
    this.frames = [];
    this.frames.length = frameCount * 5;
};
spine.ColorTimeline.prototype = {
    slotIndex: 0,
    getFrameCount: function () {
        return this.frames.length / 5;
    },
    setFrame: function (frameIndex, time, r, g, b, a) {
        frameIndex *= 5;
        this.frames[frameIndex] = time;
        this.frames[frameIndex + 1] = r;
        this.frames[frameIndex + 2] = g;
        this.frames[frameIndex + 3] = b;
        this.frames[frameIndex + 4] = a;
    },
    apply: function (skeleton, lastTime, time, firedEvents, alpha) {
        var frames = this.frames;
        if (time < frames[0]) return;
        var slot = skeleton.slots[this.slotIndex];
        if (time >= frames[frames.length - 5]) {
            var i = frames.length - 1;
            slot.r = frames[i - 3];
            slot.g = frames[i - 2];
            slot.b = frames[i - 1];
            slot.a = frames[i];
            return;
        }
        var frameIndex = spine.binarySearch(frames, time, 5);
        var lastFrameR = frames[frameIndex - 4];
        var lastFrameG = frames[frameIndex - 3];
        var lastFrameB = frames[frameIndex - 2];
        var lastFrameA = frames[frameIndex - 1];
        var frameTime = frames[frameIndex];
        var percent = 1 - (time - frameTime) / (frames[frameIndex - 5] - frameTime);
        percent = this.curves.getCurvePercent(frameIndex / 5 - 1, percent);
        var r = lastFrameR + (frames[frameIndex + 1] - lastFrameR) * percent;
        var g = lastFrameG + (frames[frameIndex + 2] - lastFrameG) * percent;
        var b = lastFrameB + (frames[frameIndex + 3] - lastFrameB) * percent;
        var a = lastFrameA + (frames[frameIndex + 4] - lastFrameA) * percent;
        if (alpha < 1) {
            slot.r += (r - slot.r) * alpha;
            slot.g += (g - slot.g) * alpha;
            slot.b += (b - slot.b) * alpha;
            slot.a += (a - slot.a) * alpha;
        } else {
            slot.r = r;
            slot.g = g;
            slot.b = b;
            slot.a = a;
        }
    }
};
spine.AttachmentTimeline = function (frameCount) {
    this.curves = new spine.Curves(frameCount);
    this.frames = [];
    this.frames.length = frameCount;
    this.attachmentNames = [];
    this.attachmentNames.length = frameCount;
};
spine.AttachmentTimeline.prototype = {
    slotIndex: 0,
    getFrameCount: function () {
        return this.frames.length;
    },
    setFrame: function (frameIndex, time, attachmentName) {
        this.frames[frameIndex] = time;
        this.attachmentNames[frameIndex] = attachmentName;
    },
    apply: function (skeleton, lastTime, time, firedEvents, alpha) {
        var frames = this.frames;
        if (time < frames[0]) return;
        var frameIndex;
        if (time >= frames[frames.length - 1])
            frameIndex = frames.length - 1;
        else
            frameIndex = spine.binarySearch(frames, time, 1) - 1;
        var attachmentName = this.attachmentNames[frameIndex];
        skeleton.slots[this.slotIndex].setAttachment(!attachmentName ? null : skeleton.getAttachmentBySlotIndex(this.slotIndex, attachmentName));
    }
};
spine.EventTimeline = function (frameCount) {
    this.frames = [];
    this.frames.length = frameCount;
    this.events = [];
    this.events.length = frameCount;
};
spine.EventTimeline.prototype = {
    getFrameCount: function () {
        return this.frames.length;
    },
    setFrame: function (frameIndex, time, event) {
        this.frames[frameIndex] = time;
        this.events[frameIndex] = event;
    },
    apply: function (skeleton, lastTime, time, firedEvents, alpha) {
        if (!firedEvents) return;
        var frames = this.frames;
        var frameCount = frames.length;
        if (lastTime > time) {
            this.apply(skeleton, lastTime, Number.MAX_VALUE, firedEvents, alpha);
            lastTime = -1;
        } else if (lastTime >= frames[frameCount - 1])
            return;
        if (time < frames[0]) return;
        var frameIndex;
        if (lastTime < frames[0])
            frameIndex = 0;
        else {
            frameIndex = spine.binarySearch(frames, lastTime, 1);
            var frame = frames[frameIndex];
            while (frameIndex > 0) {
                if (frames[frameIndex - 1] != frame) break;
                frameIndex--;
            }
        }
        var events = this.events;
        for (; frameIndex < frameCount && time >= frames[frameIndex]; frameIndex++)
            firedEvents.push(events[frameIndex]);
    }
};
spine.DrawOrderTimeline = function (frameCount) {
    this.frames = [];
    this.frames.length = frameCount;
    this.drawOrders = [];
    this.drawOrders.length = frameCount;
};
spine.DrawOrderTimeline.prototype = {
    getFrameCount: function () {
        return this.frames.length;
    },
    setFrame: function (frameIndex, time, drawOrder) {
        this.frames[frameIndex] = time;
        this.drawOrders[frameIndex] = drawOrder;
    },
    apply: function (skeleton, lastTime, time, firedEvents, alpha) {
        var frames = this.frames;
        if (time < frames[0]) return;
        var frameIndex;
        if (time >= frames[frames.length - 1])
            frameIndex = frames.length - 1;
        else
            frameIndex = spine.binarySearch(frames, time, 1) - 1;
        var drawOrder = skeleton.drawOrder;
        var slots = skeleton.slots;
        var drawOrderToSetupIndex = this.drawOrders[frameIndex];
        if (!drawOrderToSetupIndex) {
            for (var i = 0, n = slots.length; i < n; i++)
                drawOrder[i] = slots[i];
        } else {
            for (var i = 0, n = drawOrderToSetupIndex.length; i < n; i++)
                drawOrder[i] = skeleton.slots[drawOrderToSetupIndex[i]];
        }
    }
};
spine.SkeletonData = function () {
    this.bones = [];
    this.slots = [];
    this.skins = [];
    this.events = [];
    this.animations = [];
};
spine.SkeletonData.prototype = {
    defaultSkin: null,
    findBone: function (boneName) {
        var bones = this.bones;
        for (var i = 0, n = bones.length; i < n; i++)
            if (bones[i].name == boneName) return bones[i];
        return null;
    },
    findBoneIndex: function (boneName) {
        var bones = this.bones;
        for (var i = 0, n = bones.length; i < n; i++)
            if (bones[i].name == boneName) return i;
        return -1;
    },
    findSlot: function (slotName) {
        var slots = this.slots;
        for (var i = 0, n = slots.length; i < n; i++) {
            if (slots[i].name == slotName) return slots[i];
        }
        return null;
    },
    findSlotIndex: function (slotName) {
        var slots = this.slots;
        for (var i = 0, n = slots.length; i < n; i++)
            if (slots[i].name == slotName) return i;
        return -1;
    },
    findSkin: function (skinName) {
        var skins = this.skins;
        for (var i = 0, n = skins.length; i < n; i++)
            if (skins[i].name == skinName) return skins[i];
        return null;
    },
    findEvent: function (eventName) {
        var events = this.events;
        for (var i = 0, n = events.length; i < n; i++)
            if (events[i].name == eventName) return events[i];
        return null;
    },
    findAnimation: function (animationName) {
        var animations = this.animations;
        for (var i = 0, n = animations.length; i < n; i++)
            if (animations[i].name == animationName) return animations[i];
        return null;
    }
};
spine.Skeleton = function (skeletonData) {
    this.data = skeletonData;
    this.bones = [];
    for (var i = 0, n = skeletonData.bones.length; i < n; i++) {
        var boneData = skeletonData.bones[i];
        var parent = !boneData.parent ? null : this.bones[skeletonData.bones.indexOf(boneData.parent)];
        this.bones.push(new spine.Bone(boneData, parent));
    }
    this.slots = [];
    this.drawOrder = [];
    for (var i = 0, n = skeletonData.slots.length; i < n; i++) {
        var slotData = skeletonData.slots[i];
        var bone = this.bones[skeletonData.bones.indexOf(slotData.boneData)];
        var slot = new spine.Slot(slotData, this, bone);
        this.slots.push(slot);
        this.drawOrder.push(slot);
    }
};
spine.Skeleton.prototype = {
    x: 0, y: 0,
    skin: null,
    r: 1, g: 1, b: 1, a: 1,
    time: 0,
    flipX: false, flipY: false,
    updateWorldTransform: function () {
        var flipX = this.flipX;
        var flipY = this.flipY;
        var bones = this.bones;
        for (var i = 0, n = bones.length; i < n; i++)
            bones[i].updateWorldTransform(flipX, flipY);
    },
    setToSetupPose: function () {
        this.setBonesToSetupPose();
        this.setSlotsToSetupPose();
    },
    setBonesToSetupPose: function () {
        var bones = this.bones;
        for (var i = 0, n = bones.length; i < n; i++)
            bones[i].setToSetupPose();
    },
    setSlotsToSetupPose: function () {
        var slots = this.slots;
        for (var i = 0, n = slots.length; i < n; i++)
            slots[i].setToSetupPose(i);
    },
    getRootBone: function () {
        return this.bones.length == 0 ? null : this.bones[0];
    },
    findBone: function (boneName) {
        var bones = this.bones;
        for (var i = 0, n = bones.length; i < n; i++)
            if (bones[i].data.name == boneName) return bones[i];
        return null;
    },
    findBoneIndex: function (boneName) {
        var bones = this.bones;
        for (var i = 0, n = bones.length; i < n; i++)
            if (bones[i].data.name == boneName) return i;
        return -1;
    },
    findSlot: function (slotName) {
        var slots = this.slots;
        for (var i = 0, n = slots.length; i < n; i++)
            if (slots[i].data.name == slotName) return slots[i];
        return null;
    },
    findSlotIndex: function (slotName) {
        var slots = this.slots;
        for (var i = 0, n = slots.length; i < n; i++)
            if (slots[i].data.name == slotName) return i;
        return -1;
    },
    setSkinByName: function (skinName) {
        var skin = this.data.findSkin(skinName);
        if (!skin) throw "Skin not found: " + skinName;
        this.setSkin(skin);
    },
    setSkin: function (newSkin) {
        if (this.skin && newSkin) {
            newSkin._attachAll(this, this.skin);
        }
        this.skin = newSkin;
    },
    getAttachmentBySlotName: function (slotName, attachmentName) {
        return this.getAttachmentBySlotIndex(this.data.findSlotIndex(slotName), attachmentName);
    },
    getAttachmentBySlotIndex: function (slotIndex, attachmentName) {
        if (this.skin) {
            var attachment = this.skin.getAttachment(slotIndex, attachmentName);
            if (attachment) return attachment;
        }
        if (this.data.defaultSkin) return this.data.defaultSkin.getAttachment(slotIndex, attachmentName);
        return null;
    },
    setAttachment: function (slotName, attachmentName) {
        var slots = this.slots;
        for (var i = 0, n = slots.length; i < n; i++) {
            var slot = slots[i];
            if (slot.data.name == slotName) {
                var attachment = null;
                if (attachmentName) {
                    attachment = this.getAttachment(i, attachmentName);
                    if (!attachment) throw "Attachment not found: " + attachmentName + ", for slot: " + slotName;
                }
                slot.setAttachment(attachment);
                return;
            }
        }
        throw "Slot not found: " + slotName;
    },
    update: function (delta) {
        this.time += delta;
    }
};
spine.EventData = function (name) {
    this.name = name;
};
spine.EventData.prototype = {
    intValue: 0,
    floatValue: 0,
    stringValue: null
};
spine.Event = function (data) {
    this.data = data;
};
spine.Event.prototype = {
    intValue: 0,
    floatValue: 0,
    stringValue: null
};
spine.AttachmentType = {
    region: 0,
    boundingbox: 1
};
spine.RegionAttachment = function (name) {
    this.name = name;
    this.offset = [];
    this.offset.length = 8;
    this.uvs = [];
    this.uvs.length = 8;
    this["type"] = spine.AttachmentType.region;
};
spine.RegionAttachment.prototype = {
    type: spine.AttachmentType.region,
    x: 0, y: 0,
    rotation: 0,
    scaleX: 1, scaleY: 1,
    width: 0, height: 0,
    rendererObject: null,
    regionOffsetX: 0, regionOffsetY: 0,
    regionWidth: 0, regionHeight: 0,
    regionOriginalWidth: 0, regionOriginalHeight: 0,
    setUVs: function (u, v, u2, v2, rotate) {
        var uvs = this.uvs;
        if (rotate) {
            uvs[2] = u;
            uvs[3] = v2;
            uvs[4] = u;
            uvs[5] = v;
            uvs[6] = u2;
            uvs[7] = v;
            uvs[0] = u2;
            uvs[1] = v2;
        } else {
            uvs[0] = u;
            uvs[1] = v2;
            uvs[2] = u;
            uvs[3] = v;
            uvs[4] = u2;
            uvs[5] = v;
            uvs[6] = u2;
            uvs[7] = v2;
        }
    },
    updateOffset: function () {
        var regionScaleX = this.width / this.regionOriginalWidth * this.scaleX;
        var regionScaleY = this.height / this.regionOriginalHeight * this.scaleY;
        var localX = -this.width / 2 * this.scaleX + this.regionOffsetX * regionScaleX;
        var localY = -this.height / 2 * this.scaleY + this.regionOffsetY * regionScaleY;
        var localX2 = localX + this.regionWidth * regionScaleX;
        var localY2 = localY + this.regionHeight * regionScaleY;
        var radians = this.rotation * Math.PI / 180;
        var cos = Math.cos(radians);
        var sin = Math.sin(radians);
        var localXCos = localX * cos + this.x;
        var localXSin = localX * sin;
        var localYCos = localY * cos + this.y;
        var localYSin = localY * sin;
        var localX2Cos = localX2 * cos + this.x;
        var localX2Sin = localX2 * sin;
        var localY2Cos = localY2 * cos + this.y;
        var localY2Sin = localY2 * sin;
        var offset = this.offset;
        offset[0] = localXCos - localYSin;
        offset[1] = localYCos + localXSin;
        offset[2] = localXCos - localY2Sin;
        offset[3] = localY2Cos + localXSin;
        offset[4] = localX2Cos - localY2Sin;
        offset[5] = localY2Cos + localX2Sin;
        offset[6] = localX2Cos - localYSin;
        offset[7] = localYCos + localX2Sin;
    },
    computeVertices: function (x, y, bone, vertices) {
        x += bone.worldX;
        y += bone.worldY;
        var m00 = bone.m00;
        var m01 = bone.m01;
        var m10 = bone.m10;
        var m11 = bone.m11;
        var offset = this.offset;
        vertices[0] = offset[0] * m00 + offset[1] * m01 + x;
        vertices[1] = offset[0] * m10 + offset[1] * m11 + y;
        vertices[2] = offset[2] * m00 + offset[3] * m01 + x;
        vertices[3] = offset[2] * m10 + offset[3] * m11 + y;
        vertices[4] = offset[4] * m00 + offset[5] * m01 + x;
        vertices[5] = offset[4] * m10 + offset[5] * m11 + y;
        vertices[6] = offset[6] * m00 + offset[7] * m01 + x;
        vertices[7] = offset[6] * m10 + offset[7] * m11 + y;
    }
};
spine.BoundingBoxAttachment = function (name) {
    this.name = name;
    this.vertices = [];
    this["type"] = spine.AttachmentType.boundingBox;
};
spine.BoundingBoxAttachment.prototype = {
    type: spine.AttachmentType.boundingBox,
    computeWorldVertices: function (x, y, bone, worldVertices) {
        x += bone.worldX;
        y += bone.worldY;
        var m00 = bone.m00;
        var m01 = bone.m01;
        var m10 = bone.m10;
        var m11 = bone.m11;
        var vertices = this.vertices;
        for (var i = 0, n = vertices.length; i < n; i += 2) {
            var px = vertices[i];
            var py = vertices[i + 1];
            worldVertices[i] = px * m00 + py * m01 + x;
            worldVertices[i + 1] = px * m10 + py * m11 + y;
        }
    }
};
spine.AnimationStateData = function (skeletonData) {
    this.skeletonData = skeletonData;
    this.animationToMixTime = {};
};
spine.AnimationStateData.prototype = {
    defaultMix: 0,
    setMixByName: function (fromName, toName, duration) {
        var from = this.skeletonData.findAnimation(fromName);
        if (!from) throw "Animation not found: " + fromName;
        var to = this.skeletonData.findAnimation(toName);
        if (!to) throw "Animation not found: " + toName;
        this.setMix(from, to, duration);
    },
    setMix: function (from, to, duration) {
        this.animationToMixTime[from.name + ":" + to.name] = duration;
    },
    getMix: function (from, to) {
        var time = this.animationToMixTime[from.name + ":" + to.name];
        return time ? time : this.defaultMix;
    }
};
spine.TrackEntry = function () {
};
spine.TrackEntry.prototype = {
    next: null, previous: null,
    animation: null,
    loop: false,
    delay: 0, time: 0, lastTime: -1, endTime: 0,
    timeScale: 1,
    mixTime: 0, mixDuration: 0,
    onStart: null, onEnd: null, onComplete: null, onEvent: null
};
spine.AnimationState = function (stateData) {
    this.data = stateData;
    this.tracks = [];
    this.events = [];
};
spine.AnimationState.prototype = {
    onStart: null,
    onEnd: null,
    onComplete: null,
    onEvent: null,
    timeScale: 1,
    update: function (delta) {
        delta *= this.timeScale;
        for (var i = 0; i < this.tracks.length; i++) {
            var current = this.tracks[i];
            if (!current) continue;
            var trackDelta = delta * current.timeScale;
            current.time += trackDelta;
            if (current.previous) {
                current.previous.time += trackDelta;
                current.mixTime += trackDelta;
            }
            var next = current.next;
            if (next) {
                if (current.lastTime >= next.delay) this.setCurrent(i, next);
            } else {
                if (!current.loop && current.lastTime >= current.endTime) this.clearTrack(i);
            }
        }
    },
    apply: function (skeleton) {
        for (var i = 0; i < this.tracks.length; i++) {
            var current = this.tracks[i];
            if (!current) continue;
            this.events.length = 0;
            var time = current.time;
            var lastTime = current.lastTime;
            var endTime = current.endTime;
            var loop = current.loop;
            if (!loop && time > endTime) time = endTime;
            var previous = current.previous;
            if (!previous)
                current.animation.apply(skeleton, current.lastTime, time, loop, this.events);
            else {
                var previousTime = previous.time;
                if (!previous.loop && previousTime > previous.endTime) previousTime = previous.endTime;
                previous.animation.apply(skeleton, previousTime, previousTime, previous.loop, null);
                var alpha = current.mixTime / current.mixDuration;
                if (alpha >= 1) {
                    alpha = 1;
                    current.previous = null;
                }
                current.animation.mix(skeleton, current.lastTime, time, loop, this.events, alpha);
            }
            for (var ii = 0, nn = this.events.length; ii < nn; ii++) {
                var event = this.events[ii];
                if (current.onEvent != null) current.onEvent(i, event);
                if (this.onEvent != null) this.onEvent(i, event);
            }
            if (loop ? (lastTime % endTime > time % endTime) : (lastTime < endTime && time >= endTime)) {
                var count = Math.floor(time / endTime);
                if (current.onComplete) current.onComplete(i, count);
                if (this.onComplete) this.onComplete(i, count);
            }
            current.lastTime = current.time;
        }
    },
    clearTracks: function () {
        for (var i = 0, n = this.tracks.length; i < n; i++)
            this.clearTrack(i);
        this.tracks.length = 0;
    },
    clearTrack: function (trackIndex) {
        if (trackIndex >= this.tracks.length) return;
        var current = this.tracks[trackIndex];
        if (!current) return;
        if (current.onEnd != null) current.onEnd(trackIndex);
        if (this.onEnd != null) this.onEnd(trackIndex);
        this.tracks[trackIndex] = null;
    },
    _expandToIndex: function (index) {
        if (index < this.tracks.length) return this.tracks[index];
        while (index >= this.tracks.length)
            this.tracks.push(null);
        return null;
    },
    setCurrent: function (index, entry) {
        var current = this._expandToIndex(index);
        if (current) {
            var previous = current.previous;
            current.previous = null;
            if (current.onEnd != null) current.onEnd(index);
            if (this.onEnd != null) this.onEnd(index);
            entry.mixDuration = this.data.getMix(current.animation, entry.animation);
            if (entry.mixDuration > 0) {
                entry.mixTime = 0;
                if (previous && current.mixTime / current.mixDuration < 0.5)
                    entry.previous = previous;
                else
                    entry.previous = current;
            }
        }
        this.tracks[index] = entry;
        if (entry.onStart != null) entry.onStart(index);
        if (this.onStart != null) this.onStart(index);
    },
    setAnimationByName: function (trackIndex, animationName, loop) {
        var animation = this.data.skeletonData.findAnimation(animationName);
        if (!animation) throw "Animation not found: " + animationName;
        return this.setAnimation(trackIndex, animation, loop);
    },
    setAnimation: function (trackIndex, animation, loop) {
        var entry = new spine.TrackEntry();
        entry.animation = animation;
        entry.loop = loop;
        entry.endTime = animation.duration;
        this.setCurrent(trackIndex, entry);
        return entry;
    },
    addAnimationByName: function (trackIndex, animationName, loop, delay) {
        var animation = this.data.skeletonData.findAnimation(animationName);
        if (!animation) throw "Animation not found: " + animationName;
        return this.addAnimation(trackIndex, animation, loop, delay);
    },
    addAnimation: function (trackIndex, animation, loop, delay) {
        var entry = new spine.TrackEntry();
        entry.animation = animation;
        entry.loop = loop;
        entry.endTime = animation.duration;
        var last = this._expandToIndex(trackIndex);
        if (last) {
            while (last.next)
                last = last.next;
            last.next = entry;
        } else
            this.tracks[trackIndex] = entry;
        if (delay <= 0) {
            if (last)
                delay += last.endTime - this.data.getMix(last.animation, animation);
            else
                delay = 0;
        }
        entry.delay = delay;
        return entry;
    },
    getCurrent: function (trackIndex) {
        if (trackIndex >= this.tracks.length) return null;
        return this.tracks[trackIndex];
    }
};
spine.SkeletonJson = function (attachmentLoader) {
    this.attachmentLoader = attachmentLoader;
};
spine.SkeletonJson.prototype = {
    scale: 1,
    readSkeletonData: function (root) {
        var skeletonData = new spine.SkeletonData();
        var bones = root["bones"];
        for (var i = 0, n = bones.length; i < n; i++) {
            var boneMap = bones[i];
            var parent = null;
            if (boneMap["parent"]) {
                parent = skeletonData.findBone(boneMap["parent"]);
                if (!parent) throw "Parent bone not found: " + boneMap["parent"];
            }
            var boneData = new spine.BoneData(boneMap["name"], parent);
            boneData.length = (boneMap["length"] || 0) * this.scale;
            boneData.x = (boneMap["x"] || 0) * this.scale;
            boneData.y = (boneMap["y"] || 0) * this.scale;
            boneData.rotation = (boneMap["rotation"] || 0);
            boneData.scaleX = boneMap["scaleX"] || 1;
            boneData.scaleY = boneMap["scaleY"] || 1;
            boneData.inheritScale = !boneMap["inheritScale"] || boneMap["inheritScale"] == "true";
            boneData.inheritRotation = !boneMap["inheritRotation"] || boneMap["inheritRotation"] == "true";
            skeletonData.bones.push(boneData);
        }
        var slots = root["slots"];
        for (var i = 0, n = slots.length; i < n; i++) {
            var slotMap = slots[i];
            var boneData = skeletonData.findBone(slotMap["bone"]);
            if (!boneData) throw "Slot bone not found: " + slotMap["bone"];
            var slotData = new spine.SlotData(slotMap["name"], boneData);
            var color = slotMap["color"];
            if (color) {
                slotData.r = spine.SkeletonJson.toColor(color, 0);
                slotData.g = spine.SkeletonJson.toColor(color, 1);
                slotData.b = spine.SkeletonJson.toColor(color, 2);
                slotData.a = spine.SkeletonJson.toColor(color, 3);
            }
            slotData.attachmentName = slotMap["attachment"];
            slotData.additiveBlending = slotMap["additive"] && slotMap["additive"] == "true";
            skeletonData.slots.push(slotData);
        }
        var skins = root["skins"];
        for (var skinName in skins) {
            if (!skins.hasOwnProperty(skinName)) continue;
            var skinMap = skins[skinName];
            var skin = new spine.Skin(skinName);
            for (var slotName in skinMap) {
                if (!skinMap.hasOwnProperty(slotName)) continue;
                var slotIndex = skeletonData.findSlotIndex(slotName);
                var slotEntry = skinMap[slotName];
                for (var attachmentName in slotEntry) {
                    if (!slotEntry.hasOwnProperty(attachmentName)) continue;
                    var attachment = this.readAttachment(skin, attachmentName, slotEntry[attachmentName]);
                    if (attachment != null) skin.addAttachment(slotIndex, attachmentName, attachment);
                }
            }
            skeletonData.skins.push(skin);
            if (skin.name == "default") skeletonData.defaultSkin = skin;
        }
        var events = root["events"];
        for (var eventName in events) {
            if (!events.hasOwnProperty(eventName)) continue;
            var eventMap = events[eventName];
            var eventData = new spine.EventData(eventName);
            eventData.intValue = eventMap["int"] || 0;
            eventData.floatValue = eventMap["float"] || 0;
            eventData.stringValue = eventMap["string"] || null;
            skeletonData.events.push(eventData);
        }
        var animations = root["animations"];
        for (var animationName in animations) {
            if (!animations.hasOwnProperty(animationName)) continue;
            this.readAnimation(animationName, animations[animationName], skeletonData);
        }
        return skeletonData;
    },
    readAttachment: function (skin, name, map) {
        name = map["name"] || name;
        var type = spine.AttachmentType[map["type"] || "region"];
        var attachment = this.attachmentLoader.newAttachment(skin, type, name);
        if (type == spine.AttachmentType.region) {
            attachment.x = (map["x"] || 0) * this.scale;
            attachment.y = (map["y"] || 0) * this.scale;
            attachment.scaleX = map["scaleX"] || 1;
            attachment.scaleY = map["scaleY"] || 1;
            attachment.rotation = map["rotation"] || 0;
            attachment.width = (map["width"] || 32) * this.scale;
            attachment.height = (map["height"] || 32) * this.scale;
            attachment.updateOffset();
        } else if (type == spine.AttachmentType.boundingBox) {
            var vertices = map["vertices"];
            for (var i = 0, n = vertices.length; i < n; i++)
                attachment.vertices.push(vertices[i] * this.scale);
        }
        return attachment;
    },
    readAnimation: function (name, map, skeletonData) {
        var timelines = [];
        var duration = 0;
        var bones = map["bones"];
        for (var boneName in bones) {
            if (!bones.hasOwnProperty(boneName)) continue;
            var boneIndex = skeletonData.findBoneIndex(boneName);
            if (boneIndex == -1) throw "Bone not found: " + boneName;
            var boneMap = bones[boneName];
            for (var timelineName in boneMap) {
                if (!boneMap.hasOwnProperty(timelineName)) continue;
                var values = boneMap[timelineName];
                if (timelineName == "rotate") {
                    var timeline = new spine.RotateTimeline(values.length);
                    timeline.boneIndex = boneIndex;
                    var frameIndex = 0;
                    for (var i = 0, n = values.length; i < n; i++) {
                        var valueMap = values[i];
                        timeline.setFrame(frameIndex, valueMap["time"], valueMap["angle"]);
                        spine.SkeletonJson.readCurve(timeline, frameIndex, valueMap);
                        frameIndex++;
                    }
                    timelines.push(timeline);
                    duration = Math.max(duration, timeline.frames[timeline.getFrameCount() * 2 - 2]);
                } else if (timelineName == "translate" || timelineName == "scale") {
                    var timeline;
                    var timelineScale = 1;
                    if (timelineName == "scale")
                        timeline = new spine.ScaleTimeline(values.length);
                    else {
                        timeline = new spine.TranslateTimeline(values.length);
                        timelineScale = this.scale;
                    }
                    timeline.boneIndex = boneIndex;
                    var frameIndex = 0;
                    for (var i = 0, n = values.length; i < n; i++) {
                        var valueMap = values[i];
                        var x = (valueMap["x"] || 0) * timelineScale;
                        var y = (valueMap["y"] || 0) * timelineScale;
                        timeline.setFrame(frameIndex, valueMap["time"], x, y);
                        spine.SkeletonJson.readCurve(timeline, frameIndex, valueMap);
                        frameIndex++;
                    }
                    timelines.push(timeline);
                    duration = Math.max(duration, timeline.frames[timeline.getFrameCount() * 3 - 3]);
                } else
                    throw "Invalid timeline type for a bone: " + timelineName + " (" + boneName + ")";
            }
        }
        var slots = map["slots"];
        for (var slotName in slots) {
            if (!slots.hasOwnProperty(slotName)) continue;
            var slotMap = slots[slotName];
            var slotIndex = skeletonData.findSlotIndex(slotName);
            for (var timelineName in slotMap) {
                if (!slotMap.hasOwnProperty(timelineName)) continue;
                var values = slotMap[timelineName];
                if (timelineName == "color") {
                    var timeline = new spine.ColorTimeline(values.length);
                    timeline.slotIndex = slotIndex;
                    var frameIndex = 0;
                    for (var i = 0, n = values.length; i < n; i++) {
                        var valueMap = values[i];
                        var color = valueMap["color"];
                        var r = spine.SkeletonJson.toColor(color, 0);
                        var g = spine.SkeletonJson.toColor(color, 1);
                        var b = spine.SkeletonJson.toColor(color, 2);
                        var a = spine.SkeletonJson.toColor(color, 3);
                        timeline.setFrame(frameIndex, valueMap["time"], r, g, b, a);
                        spine.SkeletonJson.readCurve(timeline, frameIndex, valueMap);
                        frameIndex++;
                    }
                    timelines.push(timeline);
                    duration = Math.max(duration, timeline.frames[timeline.getFrameCount() * 5 - 5]);
                } else if (timelineName == "attachment") {
                    var timeline = new spine.AttachmentTimeline(values.length);
                    timeline.slotIndex = slotIndex;
                    var frameIndex = 0;
                    for (var i = 0, n = values.length; i < n; i++) {
                        var valueMap = values[i];
                        timeline.setFrame(frameIndex++, valueMap["time"], valueMap["name"]);
                    }
                    timelines.push(timeline);
                    duration = Math.max(duration, timeline.frames[timeline.getFrameCount() - 1]);
                } else
                    throw "Invalid timeline type for a slot: " + timelineName + " (" + slotName + ")";
            }
        }
        var events = map["events"];
        if (events) {
            var timeline = new spine.EventTimeline(events.length);
            var frameIndex = 0;
            for (var i = 0, n = events.length; i < n; i++) {
                var eventMap = events[i];
                var eventData = skeletonData.findEvent(eventMap["name"]);
                if (!eventData) throw "Event not found: " + eventMap["name"];
                var event = new spine.Event(eventData);
                event.intValue = eventMap.hasOwnProperty("int") ? eventMap["int"] : eventData.intValue;
                event.floatValue = eventMap.hasOwnProperty("float") ? eventMap["float"] : eventData.floatValue;
                event.stringValue = eventMap.hasOwnProperty("string") ? eventMap["string"] : eventData.stringValue;
                timeline.setFrame(frameIndex++, eventMap["time"], event);
            }
            timelines.push(timeline);
            duration = Math.max(duration, timeline.frames[timeline.getFrameCount() - 1]);
        }
        var drawOrderValues = map["draworder"];
        if (drawOrderValues) {
            var timeline = new spine.DrawOrderTimeline(drawOrderValues.length);
            var slotCount = skeletonData.slots.length;
            var frameIndex = 0;
            for (var i = 0, n = drawOrderValues.length; i < n; i++) {
                var drawOrderMap = drawOrderValues[i];
                var drawOrder = null;
                if (drawOrderMap["offsets"]) {
                    drawOrder = [];
                    drawOrder.length = slotCount;
                    for (var ii = slotCount - 1; ii >= 0; ii--)
                        drawOrder[ii] = -1;
                    var offsets = drawOrderMap["offsets"];
                    var unchanged = [];
                    unchanged.length = slotCount - offsets.length;
                    var originalIndex = 0, unchangedIndex = 0;
                    for (var ii = 0, nn = offsets.length; ii < nn; ii++) {
                        var offsetMap = offsets[ii];
                        var slotIndex = skeletonData.findSlotIndex(offsetMap["slot"]);
                        if (slotIndex == -1) throw "Slot not found: " + offsetMap["slot"];
                        while (originalIndex != slotIndex)
                            unchanged[unchangedIndex++] = originalIndex++;
                        drawOrder[originalIndex + offsetMap["offset"]] = originalIndex++;
                    }
                    while (originalIndex < slotCount)
                        unchanged[unchangedIndex++] = originalIndex++;
                    for (var ii = slotCount - 1; ii >= 0; ii--)
                        if (drawOrder[ii] == -1) drawOrder[ii] = unchanged[--unchangedIndex];
                }
                timeline.setFrame(frameIndex++, drawOrderMap["time"], drawOrder);
            }
            timelines.push(timeline);
            duration = Math.max(duration, timeline.frames[timeline.getFrameCount() - 1]);
        }
        skeletonData.animations.push(new spine.Animation(name, timelines, duration));
    }
};
spine.SkeletonJson.readCurve = function (timeline, frameIndex, valueMap) {
    var curve = valueMap["curve"];
    if (!curve) return;
    if (curve == "stepped")
        timeline.curves.setStepped(frameIndex);
    else if (curve instanceof Array)
        timeline.curves.setCurve(frameIndex, curve[0], curve[1], curve[2], curve[3]);
};
spine.SkeletonJson.toColor = function (hexString, colorIndex) {
    if (hexString.length != 8) throw "Color hexidecimal length must be 8, recieved: " + hexString;
    return parseInt(hexString.substring(colorIndex * 2, (colorIndex * 2) + 2), 16) / 255;
};
spine.Atlas = function (atlasText, textureLoader) {
    this.textureLoader = textureLoader;
    this.pages = [];
    this.regions = [];
    var reader = new spine.AtlasReader(atlasText);
    var tuple = [];
    tuple.length = 4;
    var page = null;
    while (true) {
        var line = reader.readLine();
        if (line == null) break;
        line = reader.trim(line);
        if (line.length == 0)
            page = null;
        else if (!page) {
            page = new spine.AtlasPage();
            page.name = line;
            page.format = spine.Atlas.Format[reader.readValue()];
            reader.readTuple(tuple);
            page.minFilter = spine.Atlas.TextureFilter[tuple[0]];
            page.magFilter = spine.Atlas.TextureFilter[tuple[1]];
            var direction = reader.readValue();
            page.uWrap = spine.Atlas.TextureWrap.clampToEdge;
            page.vWrap = spine.Atlas.TextureWrap.clampToEdge;
            if (direction == "x")
                page.uWrap = spine.Atlas.TextureWrap.repeat;
            else if (direction == "y")
                page.vWrap = spine.Atlas.TextureWrap.repeat;
            else if (direction == "xy")
                page.uWrap = page.vWrap = spine.Atlas.TextureWrap.repeat;
            textureLoader.load(page, line, this);
            this.pages.push(page);
        } else {
            var region = new spine.AtlasRegion();
            region.name = line;
            region.page = page;
            region.rotate = reader.readValue() == "true";
            reader.readTuple(tuple);
            var x = parseInt(tuple[0]);
            var y = parseInt(tuple[1]);
            reader.readTuple(tuple);
            var width = parseInt(tuple[0]);
            var height = parseInt(tuple[1]);
            region.u = x / page.width;
            region.v = y / page.height;
            if (region.rotate) {
                region.u2 = (x + height) / page.width;
                region.v2 = (y + width) / page.height;
            } else {
                region.u2 = (x + width) / page.width;
                region.v2 = (y + height) / page.height;
            }
            region.x = x;
            region.y = y;
            region.width = Math.abs(width);
            region.height = Math.abs(height);
            if (reader.readTuple(tuple) == 4) {
                region.splits = [parseInt(tuple[0]), parseInt(tuple[1]), parseInt(tuple[2]), parseInt(tuple[3])];
                if (reader.readTuple(tuple) == 4) {
                    region.pads = [parseInt(tuple[0]), parseInt(tuple[1]), parseInt(tuple[2]), parseInt(tuple[3])];
                    reader.readTuple(tuple);
                }
            }
            region.originalWidth = parseInt(tuple[0]);
            region.originalHeight = parseInt(tuple[1]);
            reader.readTuple(tuple);
            region.offsetX = parseInt(tuple[0]);
            region.offsetY = parseInt(tuple[1]);
            region.index = parseInt(reader.readValue());
            this.regions.push(region);
        }
    }
};
spine.Atlas.prototype = {
    findRegion: function (name) {
        var regions = this.regions;
        for (var i = 0, n = regions.length; i < n; i++)
            if (regions[i].name == name) return regions[i];
        return null;
    },
    dispose: function () {
        var pages = this.pages;
        for (var i = 0, n = pages.length; i < n; i++)
            this.textureLoader.unload(pages[i].rendererObject);
    },
    updateUVs: function (page) {
        var regions = this.regions;
        for (var i = 0, n = regions.length; i < n; i++) {
            var region = regions[i];
            if (region.page != page) continue;
            region.u = region.x / page.width;
            region.v = region.y / page.height;
            if (region.rotate) {
                region.u2 = (region.x + region.height) / page.width;
                region.v2 = (region.y + region.width) / page.height;
            } else {
                region.u2 = (region.x + region.width) / page.width;
                region.v2 = (region.y + region.height) / page.height;
            }
        }
    }
};
spine.Atlas.Format = {
    Alpha: 0,
    Intensity: 1,
    LuminanceAlpha: 2,
    RGB565: 3,
    RGBA4444: 4,
    RGB888: 5,
    RGBA8888: 6
};
spine.Atlas.TextureFilter = {
    Nearest: 0,
    Linear: 1,
    MipMap: 2,
    MipMapNearestNearest: 3,
    MipMapLinearNearest: 4,
    MipMapNearestLinear: 5,
    MipMapLinearLinear: 6
};
spine.Atlas.TextureWrap = {
    mirroredRepeat: 0,
    clampToEdge: 1,
    repeat: 2
};
spine.AtlasPage = function () {
};
spine.AtlasPage.prototype = {
    name: null,
    format: null,
    minFilter: null,
    magFilter: null,
    uWrap: null,
    vWrap: null,
    rendererObject: null,
    width: 0,
    height: 0
};
spine.AtlasRegion = function () {
};
spine.AtlasRegion.prototype = {
    page: null,
    name: null,
    x: 0, y: 0,
    width: 0, height: 0,
    u: 0, v: 0, u2: 0, v2: 0,
    offsetX: 0, offsetY: 0,
    originalWidth: 0, originalHeight: 0,
    index: 0,
    rotate: false,
    splits: null,
    pads: null
};
spine.AtlasReader = function (text) {
    this.lines = text.split(/\r\n|\r|\n/);
};
spine.AtlasReader.prototype = {
    index: 0,
    trim: function (value) {
        return value.replace(/^\s+|\s+$/g, "");
    },
    readLine: function () {
        if (this.index >= this.lines.length) return null;
        return this.lines[this.index++];
    },
    readValue: function () {
        var line = this.readLine();
        var colon = line.indexOf(":");
        if (colon == -1) throw "Invalid line: " + line;
        return this.trim(line.substring(colon + 1));
    },
    readTuple: function (tuple) {
        var line = this.readLine();
        var colon = line.indexOf(":");
        if (colon == -1) throw "Invalid line: " + line;
        var i = 0, lastMatch = colon + 1;
        for (; i < 3; i++) {
            var comma = line.indexOf(",", lastMatch);
            if (comma == -1) {
                if (i == 0) throw "Invalid line: " + line;
                break;
            }
            tuple[i] = this.trim(line.substr(lastMatch, comma - lastMatch));
            lastMatch = comma + 1;
        }
        tuple[i] = this.trim(line.substring(lastMatch));
        return i + 1;
    }
};
spine.AtlasAttachmentLoader = function (atlas) {
    this.atlas = atlas;
};
spine.AtlasAttachmentLoader.prototype = {
    newAttachment: function (skin, type, name) {
        switch (type) {
            case spine.AttachmentType.boundingbox:
                return new spine.BoundingBoxAttachment(name);
            case spine.AttachmentType.region:
                var region = this.atlas.findRegion(name);
                if (!region) throw "Region not found in atlas: " + name + " (" + type + ")";
                var attachment = new spine.RegionAttachment(name);
                attachment.rendererObject = region;
                attachment.setUVs(region.u, region.v, region.u2, region.v2, region.rotate);
                attachment.regionOffsetX = region.offsetX;
                attachment.regionOffsetY = region.offsetY;
                attachment.regionWidth = region.width;
                attachment.regionHeight = region.height;
                attachment.regionOriginalWidth = region.originalWidth;
                attachment.regionOriginalHeight = region.originalHeight;
                return attachment;
        }
        throw "Unknown attachment type: " + type;
    }
};
spine.SkeletonBounds = function () {
    this.polygonPool = [];
    this.polygons = [];
    this.boundingBoxes = [];
};
spine.SkeletonBounds.prototype = {
    minX: 0, minY: 0, maxX: 0, maxY: 0,
    update: function (skeleton, updateAabb) {
        var slots = skeleton.slots;
        var slotCount = slots.length;
        var x = skeleton.x, y = skeleton.y;
        var boundingBoxes = this.boundingBoxes;
        var polygonPool = this.polygonPool;
        var polygons = this.polygons;
        boundingBoxes.length = 0;
        for (var i = 0, n = polygons.length; i < n; i++)
            polygonPool.push(polygons[i]);
        polygons.length = 0;
        for (var i = 0; i < slotCount; i++) {
            var slot = slots[i];
            var boundingBox = slot.attachment;
            if (boundingBox.type != spine.AttachmentType.boundingBox) continue;
            boundingBoxes.push(boundingBox);
            var poolCount = polygonPool.length, polygon;
            if (poolCount > 0) {
                polygon = polygonPool[poolCount - 1];
                polygonPool.splice(poolCount - 1, 1);
            } else
                polygon = [];
            polygons.push(polygon);
            polygon.length = boundingBox.vertices.length;
            boundingBox.computeWorldVertices(x, y, slot.bone, polygon);
        }
        if (updateAabb) this.aabbCompute();
    },
    aabbCompute: function () {
        var polygons = this.polygons;
        var minX = Number.MAX_VALUE, minY = Number.MAX_VALUE, maxX = Number.MIN_VALUE, maxY = Number.MIN_VALUE;
        for (var i = 0, n = polygons.length; i < n; i++) {
            var vertices = polygons[i];
            for (var ii = 0, nn = vertices.length; ii < nn; ii += 2) {
                var x = vertices[ii];
                var y = vertices[ii + 1];
                minX = Math.min(minX, x);
                minY = Math.min(minY, y);
                maxX = Math.max(maxX, x);
                maxY = Math.max(maxY, y);
            }
        }
        this.minX = minX;
        this.minY = minY;
        this.maxX = maxX;
        this.maxY = maxY;
    },
    aabbContainsPoint: function (x, y) {
        return x >= this.minX && x <= this.maxX && y >= this.minY && y <= this.maxY;
    },
    aabbIntersectsSegment: function (x1, y1, x2, y2) {
        var minX = this.minX, minY = this.minY, maxX = this.maxX, maxY = this.maxY;
        if ((x1 <= minX && x2 <= minX) || (y1 <= minY && y2 <= minY) || (x1 >= maxX && x2 >= maxX) || (y1 >= maxY && y2 >= maxY))
            return false;
        var m = (y2 - y1) / (x2 - x1);
        var y = m * (minX - x1) + y1;
        if (y > minY && y < maxY) return true;
        y = m * (maxX - x1) + y1;
        if (y > minY && y < maxY) return true;
        var x = (minY - y1) / m + x1;
        if (x > minX && x < maxX) return true;
        x = (maxY - y1) / m + x1;
        if (x > minX && x < maxX) return true;
        return false;
    },
    aabbIntersectsSkeleton: function (bounds) {
        return this.minX < bounds.maxX && this.maxX > bounds.minX && this.minY < bounds.maxY && this.maxY > bounds.minY;
    },
    containsPoint: function (x, y) {
        var polygons = this.polygons;
        for (var i = 0, n = polygons.length; i < n; i++)
            if (this.polygonContainsPoint(polygons[i], x, y)) return this.boundingBoxes[i];
        return null;
    },
    intersectsSegment: function (x1, y1, x2, y2) {
        var polygons = this.polygons;
        for (var i = 0, n = polygons.length; i < n; i++)
            if (polygons[i].intersectsSegment(x1, y1, x2, y2)) return this.boundingBoxes[i];
        return null;
    },
    polygonContainsPoint: function (polygon, x, y) {
        var nn = polygon.length;
        var prevIndex = nn - 2;
        var inside = false;
        for (var ii = 0; ii < nn; ii += 2) {
            var vertexY = polygon[ii + 1];
            var prevY = polygon[prevIndex + 1];
            if ((vertexY < y && prevY >= y) || (prevY < y && vertexY >= y)) {
                var vertexX = polygon[ii];
                if (vertexX + (y - vertexY) / (prevY - vertexY) * (polygon[prevIndex] - vertexX) < x) inside = !inside;
            }
            prevIndex = ii;
        }
        return inside;
    },
    intersectsSegment: function (polygon, x1, y1, x2, y2) {
        var nn = polygon.length;
        var width12 = x1 - x2, height12 = y1 - y2;
        var det1 = x1 * y2 - y1 * x2;
        var x3 = polygon[nn - 2], y3 = polygon[nn - 1];
        for (var ii = 0; ii < nn; ii += 2) {
            var x4 = polygon[ii], y4 = polygon[ii + 1];
            var det2 = x3 * y4 - y3 * x4;
            var width34 = x3 - x4, height34 = y3 - y4;
            var det3 = width12 * height34 - height12 * width34;
            var x = (det1 * width34 - width12 * det2) / det3;
            if (((x >= x3 && x <= x4) || (x >= x4 && x <= x3)) && ((x >= x1 && x <= x2) || (x >= x2 && x <= x1))) {
                var y = (det1 * height34 - height12 * det2) / det3;
                if (((y >= y3 && y <= y4) || (y >= y4 && y <= y3)) && ((y >= y1 && y <= y2) || (y >= y2 && y <= y1))) return true;
            }
            x3 = x4;
            y3 = y4;
        }
        return false;
    },
    getPolygon: function (attachment) {
        var index = this.boundingBoxes.indexOf(attachment);
        return index == -1 ? null : this.polygons[index];
    },
    getWidth: function () {
        return this.maxX - this.minX;
    },
    getHeight: function () {
        return this.maxY - this.minY;
    }
};
sp._atlasPage_createTexture_webGL = function (self, path) {
    var texture = cc.textureCache.addImage(path);
    self.rendererObject = new cc.TextureAtlas(texture, 128);
    self.width = texture.getPixelsWide();
    self.height = texture.getPixelsHigh();
};
sp._atlasPage_createTexture_canvas = function(self, path) {
    self._texture = cc.textureCache.addImage(path);
};
sp._atlasPage_disposeTexture = function (self) {
    self.rendererObject.release();
};
sp._atlasLoader = {
    spAtlasFile:null,
    setAtlasFile:function(spAtlasFile){
        this.spAtlasFile = spAtlasFile;
    },
    load:function(page, line, spAtlas){
        var texturePath = cc.path.join(cc.path.dirname(this.spAtlasFile), line);
        if (cc._renderType === cc._RENDER_TYPE_WEBGL)
            sp._atlasPage_createTexture_webGL(page,texturePath);
        else
            sp._atlasPage_createTexture_canvas(page,texturePath);
    },
    unload:function(obj){
    }
};
sp._regionAttachment_computeWorldVertices = function(self, x, y, bone, vertices){
    var offset = self.offset;
    x += bone.worldX;
    y += bone.worldY;
    var vertexIndex = sp.VERTEX_INDEX;
    vertices[vertexIndex.X1] = offset[vertexIndex.X1] * bone.m00 + offset[vertexIndex.Y1] * bone.m01 + x;
    vertices[vertexIndex.Y1] = offset[vertexIndex.X1] * bone.m10 + offset[vertexIndex.Y1] * bone.m11 + y;
    vertices[vertexIndex.X2] = offset[vertexIndex.X2] * bone.m00 + offset[vertexIndex.Y2] * bone.m01 + x;
    vertices[vertexIndex.Y2] = offset[vertexIndex.X2] * bone.m10 + offset[vertexIndex.Y2] * bone.m11 + y;
    vertices[vertexIndex.X3] = offset[vertexIndex.X3] * bone.m00 + offset[vertexIndex.Y3] * bone.m01 + x;
    vertices[vertexIndex.Y3] = offset[vertexIndex.X3] * bone.m10 + offset[vertexIndex.Y3] * bone.m11 + y;
    vertices[vertexIndex.X4] = offset[vertexIndex.X4] * bone.m00 + offset[vertexIndex.Y4] * bone.m01 + x;
    vertices[vertexIndex.Y4] = offset[vertexIndex.X4] * bone.m10 + offset[vertexIndex.Y4] * bone.m11 + y;
};
sp._regionAttachment_updateQuad = function(self, slot, quad, premultipliedAlpha) {
    var vertices = {};
    self.computeVertices(slot.skeleton.x, slot.skeleton.y, slot.bone, vertices);
    var r = slot.skeleton.r * slot.r * 255;
    var g = slot.skeleton.g * slot.g * 255;
    var b = slot.skeleton.b * slot.b * 255;
    var normalizedAlpha = slot.skeleton.a * slot.a;
    if (premultipliedAlpha) {
        r *= normalizedAlpha;
        g *= normalizedAlpha;
        b *= normalizedAlpha;
    }
    var a = normalizedAlpha * 255;
    quad.bl.colors.r = quad.tl.colors.r = quad.tr.colors.r = quad.br.colors.r = r;
    quad.bl.colors.g = quad.tl.colors.g = quad.tr.colors.g = quad.br.colors.g = g;
    quad.bl.colors.b = quad.tl.colors.b = quad.tr.colors.b = quad.br.colors.b = b;
    quad.bl.colors.a = quad.tl.colors.a = quad.tr.colors.a = quad.br.colors.a = a;
    var VERTEX = sp.VERTEX_INDEX;
    quad.bl.vertices.x = vertices[VERTEX.X1];
    quad.bl.vertices.y = vertices[VERTEX.Y1];
    quad.tl.vertices.x = vertices[VERTEX.X2];
    quad.tl.vertices.y = vertices[VERTEX.Y2];
    quad.tr.vertices.x = vertices[VERTEX.X3];
    quad.tr.vertices.y = vertices[VERTEX.Y3];
    quad.br.vertices.x = vertices[VERTEX.X4];
    quad.br.vertices.y = vertices[VERTEX.Y4];
    quad.bl.texCoords.u = self.uvs[VERTEX.X1];
    quad.bl.texCoords.v = self.uvs[VERTEX.Y1];
    quad.tl.texCoords.u = self.uvs[VERTEX.X2];
    quad.tl.texCoords.v = self.uvs[VERTEX.Y2];
    quad.tr.texCoords.u = self.uvs[VERTEX.X3];
    quad.tr.texCoords.v = self.uvs[VERTEX.Y3];
    quad.br.texCoords.u = self.uvs[VERTEX.X4];
    quad.br.texCoords.v = self.uvs[VERTEX.Y4];
};
sp._regionAttachment_updateSlotForCanvas = function(self, slot, points) {
    if(!points)
        return;
    var vertices = {};
    self.computeVertices(slot.skeleton.x, slot.skeleton.y, slot.bone, vertices);
    var VERTEX = sp.VERTEX_INDEX;
    points.length = 0;
    points.push(cc.p(vertices[VERTEX.X1], vertices[VERTEX.Y1]));
    points.push(cc.p(vertices[VERTEX.X4], vertices[VERTEX.Y4]));
    points.push(cc.p(vertices[VERTEX.X3], vertices[VERTEX.Y3]));
    points.push(cc.p(vertices[VERTEX.X2], vertices[VERTEX.Y2]));
};
sp.ANIMATION_EVENT_TYPE = {
    START: 0,
    END: 1,
    COMPLETE: 2,
    EVENT: 3
};
sp.SkeletonAnimation = sp.Skeleton.extend({
    _state: null,
    _target: null,
    _callback: null,
    init: function () {
        sp.Skeleton.prototype.init.call(this);
        this.setAnimationStateData(new spine.AnimationStateData(this._skeleton.data));
    },
    setAnimationStateData: function (stateData) {
        var state = new spine.AnimationState(stateData);
        state.onStart = this._onAnimationStateStart.bind(this);
        state.onComplete = this._onAnimationStateComplete.bind(this);
        state.onEnd = this._onAnimationStateEnd.bind(this);
        state.onEvent = this._onAnimationStateEvent.bind(this);
        this._state = state;
    },
    setMix: function (fromAnimation, toAnimation, duration) {
        this._state.data.setMixByName(fromAnimation, toAnimation, duration);
    },
    setAnimationListener: function (target, callback) {
        this._target = target;
        this._callback = callback;
    },
    setAnimation: function (trackIndex, name, loop) {
        var animation = this._skeleton.data.findAnimation(name);
        if (!animation) {
            cc.log("Spine: Animation not found: " + name);
            return null;
        }
        return this._state.setAnimation(trackIndex, animation, loop);
    },
    addAnimation: function (trackIndex, name, loop, delay) {
        var animation = this._skeleton.data.findAnimation(name);
        if (!animation) {
            cc.log("Spine: Animation not found:" + name);
            return null;
        }
        return this._state.addAnimation(trackIndex, animation, loop, delay);
    },
    getCurrent: function (trackIndex) {
        return this._state.getCurrent(trackIndex);
    },
    clearTracks: function () {
        this._state.clearTracks();
    },
    clearTrack: function (trackIndex) {
        this._state.clearTrack(trackIndex);
    },
    update: function (dt) {
        this._super(dt);
        dt *= this._timeScale;
        this._state.update(dt);
        this._state.apply(this._skeleton);
        this._skeleton.updateWorldTransform();
    },
    _onAnimationStateStart: function (trackIndex) {
        this._animationStateCallback(trackIndex, sp.ANIMATION_EVENT_TYPE.START, null, 0);
    },
    _onAnimationStateEnd: function (trackIndex) {
        this._animationStateCallback(trackIndex, sp.ANIMATION_EVENT_TYPE.END, null, 0);
    },
    _onAnimationStateComplete: function (trackIndex, count) {
        this._animationStateCallback(trackIndex, sp.ANIMATION_EVENT_TYPE.COMPLETE, null, count);
    },
    _onAnimationStateEvent: function (trackIndex, event) {
        this._animationStateCallback(trackIndex, sp.ANIMATION_EVENT_TYPE.EVENT, event, 0);
    },
    _animationStateCallback: function (trackIndex, type, event, loopCount) {
        if (this._target && this._callback) {
            this._callback.call(this._target, this, trackIndex, type, event, loopCount)
        }
    }
});
sp.SkeletonAnimation.create = function (skeletonDataFile, atlasFile, scale) {
    return new sp.SkeletonAnimation(skeletonDataFile, atlasFile, scale);
};
(function(){
    sp.Skeleton.CanvasRenderCmd = function(renderableObject){
        cc.Node.CanvasRenderCmd.call(this, renderableObject);
        this._needDraw = true;
        this._skeletonSprites = [];
    };
    var proto = sp.Skeleton.CanvasRenderCmd.prototype = Object.create(cc.Node.CanvasRenderCmd.prototype);
    proto.constructor = sp.Skeleton.CanvasRenderCmd;
    proto.rendering = function (wrapper, scaleX, scaleY) {
        var node = this._node, i, n, sprites = this._skeletonSprites, selSpriteCmd;
        wrapper = wrapper || cc._renderContext;
        wrapper.save();
        wrapper._switchToArmatureMode(true, this._worldTransform, scaleX, scaleY);
        for(i = 0, n = sprites.length; i < n; i++){
            selSpriteCmd = sprites[i]._renderCmd;
            if(selSpriteCmd && selSpriteCmd.rendering){
                selSpriteCmd.rendering(wrapper, scaleX, scaleY);
                selSpriteCmd._dirtyFlag = 0;
            }
        }
        wrapper._switchToArmatureMode(false);
        wrapper.restore();
        if (!node._debugSlots && !node._debugBones)
            return;
        wrapper.setTransform(this._worldTransform, scaleX, scaleY);
        var locSkeleton = node._skeleton;
        var attachment, slot, drawingUtil = cc._drawingUtil;
        if (node._debugSlots) {
            drawingUtil.setDrawColor(0, 0, 255, 255);
            drawingUtil.setLineWidth(1);
            var points = [];
            for (i = 0, n = locSkeleton.slots.length; i < n; i++) {
                slot = locSkeleton.drawOrder[i];
                if (!slot.attachment || slot.attachment.type != sp.ATTACHMENT_TYPE.REGION)
                    continue;
                attachment = slot.attachment;
                sp._regionAttachment_updateSlotForCanvas(attachment, slot, points);
                drawingUtil.drawPoly(points, 4, true);
            }
        }
        if (node._debugBones) {
            var bone;
            drawingUtil.setLineWidth(2);
            drawingUtil.setDrawColor(255, 0, 0, 255);
            for (i = 0, n = locSkeleton.bones.length; i < n; i++) {
                bone = locSkeleton.bones[i];
                var x = bone.data.length * bone.m00 + bone.worldX;
                var y = bone.data.length * bone.m10 + bone.worldY;
                drawingUtil.drawLine(
                    {x: bone.worldX, y: bone.worldY},
                    {x: x, y: y});
            }
            drawingUtil.setPointSize(4);
            drawingUtil.setDrawColor(0, 0, 255, 255);
            for (i = 0, n = locSkeleton.bones.length; i < n; i++) {
                bone = locSkeleton.bones[i];
                drawingUtil.drawPoint({x: bone.worldX, y: bone.worldY});
                if (i === 0)
                    drawingUtil.setDrawColor(0, 255, 0, 255);
            }
        }
    };
    proto._createChildFormSkeletonData = function(){
        var node = this._node;
        var locSkeleton = node._skeleton, rendererObject, rect;
        for (var i = 0, n = locSkeleton.drawOrder.length; i < n; i++) {
            var slot = locSkeleton.drawOrder[i];
            var attachment = slot.attachment;
            if (!(attachment instanceof spine.RegionAttachment))
                continue;
            rendererObject = attachment.rendererObject;
            rect = cc.rect(rendererObject.x, rendererObject.y, rendererObject.width,rendererObject.height);
            var sprite = new cc.Sprite(rendererObject.page._texture, rect, rendererObject.rotate);
            this._skeletonSprites.push(sprite);
            slot.currentSprite = sprite;
        }
    };
    proto._updateChild = function(){
        var node = this._node;
        var locSkeleton = node._skeleton;
        locSkeleton.updateWorldTransform();
        var drawOrder = node._skeleton.drawOrder;
        for (var i = 0, n = drawOrder.length; i < n; i++) {
            var slot = drawOrder[i];
            var attachment = slot.attachment, selSprite = slot.currentSprite;
            if (!(attachment instanceof spine.RegionAttachment)) {
                if(selSprite)
                    selSprite.setVisible(false);
                continue;
            }
            if(!selSprite){
                var rendererObject = attachment.rendererObject;
                var rect = cc.rect(rendererObject.x, rendererObject.y, rendererObject.width,rendererObject.height);
                var sprite = new cc.Sprite(rendererObject.page._texture, rect, rendererObject.rotate);
                this._skeletonSprites.push(sprite);
                slot.currentSprite = sprite;
            }
            selSprite.setVisible(true);
            selSprite.setBlendFunc(cc.BLEND_SRC, slot.data.additiveBlending ? cc.ONE : cc.BLEND_DST);
            var bone = slot.bone;
            selSprite.setPosition(bone.worldX + attachment.x * bone.m00 + attachment.y * bone.m01,
                    bone.worldY + attachment.x * bone.m10 + attachment.y * bone.m11);
            selSprite.setScale(bone.worldScaleX, bone.worldScaleY);
            selSprite.setRotation(- (slot.bone.worldRotation + attachment.rotation));
        }
    };
})();
(function(){
    sp.Skeleton.WebGLRenderCmd = function (renderableObject) {
        cc.Node.WebGLRenderCmd.call(this, renderableObject);
        this._needDraw = true;
        this.setShaderProgram(cc.shaderCache.programForKey(cc.SHADER_POSITION_TEXTURECOLOR));
    };
    var proto = sp.Skeleton.WebGLRenderCmd.prototype = Object.create(cc.Node.WebGLRenderCmd.prototype);
    proto.constructor = sp.Skeleton.WebGLRenderCmd;
    proto.rendering = function (ctx) {
        var node = this._node;
        this._shaderProgram.use();
        this._shaderProgram._setUniformForMVPMatrixWithMat4(this._stackMatrix);
        var color = node.getColor(), locSkeleton = node._skeleton;
        locSkeleton.r = color.r / 255;
        locSkeleton.g = color.g / 255;
        locSkeleton.b = color.b / 255;
        locSkeleton.a = node.getOpacity() / 255;
        if (node._premultipliedAlpha) {
            locSkeleton.r *= locSkeleton.a;
            locSkeleton.g *= locSkeleton.a;
            locSkeleton.b *= locSkeleton.a;
        }
        var additive, textureAtlas, attachment, slot, i, n,
            quad = new cc.V3F_C4B_T2F_Quad();
        var locBlendFunc = node._blendFunc;
        for (i = 0, n = locSkeleton.slots.length; i < n; i++) {
            slot = locSkeleton.drawOrder[i];
            if (!slot.attachment || slot.attachment.type != sp.ATTACHMENT_TYPE.REGION)
                continue;
            attachment = slot.attachment;
            var regionTextureAtlas = node.getTextureAtlas(attachment);
            if (slot.data.additiveBlending != additive) {
                if (textureAtlas) {
                    textureAtlas.drawQuads();
                    textureAtlas.removeAllQuads();
                }
                additive = !additive;
                cc.glBlendFunc(locBlendFunc.src, additive ? cc.ONE : locBlendFunc.dst);
            } else if (regionTextureAtlas != textureAtlas && textureAtlas) {
                textureAtlas.drawQuads();
                textureAtlas.removeAllQuads();
            }
            textureAtlas = regionTextureAtlas;
            var quadCount = textureAtlas.getTotalQuads();
            if (textureAtlas.getCapacity() == quadCount) {
                textureAtlas.drawQuads();
                textureAtlas.removeAllQuads();
                if (!textureAtlas.resizeCapacity(textureAtlas.getCapacity() * 2))
                    return;
            }
            sp._regionAttachment_updateQuad(attachment, slot, quad, node._premultipliedAlpha);
            textureAtlas.updateQuad(quad, quadCount);
        }
        if (textureAtlas) {
            textureAtlas.drawQuads();
            textureAtlas.removeAllQuads();
        }
        if (node._debugBones || node._debugSlots) {
            cc.kmGLMatrixMode(cc.KM_GL_MODELVIEW);
            cc.current_stack.stack.push(cc.current_stack.top);
            cc.current_stack.top = this._stackMatrix;
            var drawingUtil = cc._drawingUtil;
            if (node._debugSlots) {
                drawingUtil.setDrawColor(0, 0, 255, 255);
                drawingUtil.setLineWidth(1);
                for (i = 0, n = locSkeleton.slots.length; i < n; i++) {
                    slot = locSkeleton.drawOrder[i];
                    if (!slot.attachment || slot.attachment.type != sp.ATTACHMENT_TYPE.REGION)
                        continue;
                    attachment = slot.attachment;
                    quad = new cc.V3F_C4B_T2F_Quad();
                    sp._regionAttachment_updateQuad(attachment, slot, quad);
                    var points = [];
                    points.push(cc.p(quad.bl.vertices.x, quad.bl.vertices.y));
                    points.push(cc.p(quad.br.vertices.x, quad.br.vertices.y));
                    points.push(cc.p(quad.tr.vertices.x, quad.tr.vertices.y));
                    points.push(cc.p(quad.tl.vertices.x, quad.tl.vertices.y));
                    drawingUtil.drawPoly(points, 4, true);
                }
            }
            if (node._debugBones) {
                var bone;
                drawingUtil.setLineWidth(2);
                drawingUtil.setDrawColor(255, 0, 0, 255);
                for (i = 0, n = locSkeleton.bones.length; i < n; i++) {
                    bone = locSkeleton.bones[i];
                    var x = bone.data.length * bone.m00 + bone.worldX;
                    var y = bone.data.length * bone.m10 + bone.worldY;
                    drawingUtil.drawLine(cc.p(bone.worldX, bone.worldY), cc.p(x, y));
                }
                drawingUtil.setPointSize(4);
                drawingUtil.setDrawColor(0, 0, 255, 255);
                for (i = 0, n = locSkeleton.bones.length; i < n; i++) {
                    bone = locSkeleton.bones[i];
                    drawingUtil.drawPoint(cc.p(bone.worldX, bone.worldY));
                    if (i == 0) {
                        drawingUtil.setDrawColor(0, 255, 0, 255);
                    }
                }
            }
            cc.kmGLPopMatrix();
        }
    };
    proto._createChildFormSkeletonData = function(){};
    proto._updateChild = function(){};
})();
