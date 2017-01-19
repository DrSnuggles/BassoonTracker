UI.PatternView = function(x,y,w,h){

    var me = UI.panel(x,y,w,h);
    var visibleLines = 0;
    var lineHeight = 13;
    var scrollBarItemOffset = 0;
    var max = 64;


    var scrollBar = UI.scale9Panel(w-28,18,16,h-3,{
        img: cachedAssets.images["skin/bar.png"],
        left:2,
        top:2,
        right:3,
        bottom: 3
    });

    scrollBar.onDragStart=function(){
        if (Tracker.isPlaying()) return;
        scrollBar.startDragIndex = Tracker.getCurrentPatternPos();

    };

    scrollBar.onDrag=function(touchData){
        if (Tracker.isPlaying()) return;
        if (visibleLines && scrollBarItemOffset){
            var delta =  touchData.dragY - touchData.startY;
            var pos = Math.floor(scrollBar.startDragIndex + delta/scrollBarItemOffset);
            pos = Math.min(pos,max-1);
            pos = Math.max(pos,0);
            Tracker.setCurrentPatternPos(pos);
            //setScrollBarPosition();
        }


    };

    me.addChild(scrollBar);
    setScrollBarPosition();

    me.render = function(){
        if (!me.isVisible()) return;

        if (this.needsRendering){
            var index = Tracker.getCurrentPattern() || 0;
            var patternPos = Tracker.getCurrentPatternPos() || 0;

            var song = Tracker.getSong();
            if (!song) return;

            var margin = UI.mainPanel.defaultMargin;
            var trackWidth = UI.mainPanel.col1W;
            var visibleHeight = UI.mainPanel.patternHeight - 30;
            var trackY = 0;
            var trackLeft = 0;

            visibleLines = Math.floor(visibleHeight/lineHeight);
            if (visibleLines%2== 0) visibleLines--;

            var topLines =  Math.ceil(visibleLines/2);

            var visibleStart = patternPos - topLines;
            var visibleEnd = visibleStart + visibleLines;

            var centerLineHeight = lineHeight + 2;
            var centerLineTop = Math.floor((visibleHeight + centerLineHeight)/2);

            var baseY = centerLineTop - (topLines*lineHeight) + 4;

            var panelHeight = centerLineTop;
            var panelTop2 = centerLineTop + centerLineHeight;

            var darkPanel = cachedAssets.darkPanel;
            if (!darkPanel && cachedAssets.images["skin/panel_dark.png"]){
                var p = UI.scale9Panel(0,0,trackWidth,panelHeight,{
                    img: cachedAssets.images["skin/panel_dark.png"],
                    left:3,
                    top:3,
                    right:1,
                    bottom: 1
                });
                cachedAssets.darkPanel = p.render(true);
                darkPanel = cachedAssets.darkPanel;
            }

            for (var i = 0; i<4;i++){
                var trackX = trackLeft + i*(trackWidth+margin);
                me.ctx.drawImage(darkPanel,trackX,0,trackWidth,panelHeight);
                me.ctx.drawImage(darkPanel,trackX,panelTop2,trackWidth,panelHeight);
                //me.ctx.fillStyle = "black";
                //me.ctx.fillRect(trackX,trackY,trackWidth,trackHeight);
            }

            //var patternIndex = song.patternTable[index];
            //var pattern = song.patterns[patternIndex];
            var pattern = song.patterns[index];


            if (pattern){

                if (Tracker.isRecording()){
                    me.ctx.fillStyle = "#A50B0F";
                }else{
                    me.ctx.fillStyle = "#202E58";
                }


                me.ctx.fillRect(0,centerLineTop,me.width,centerLineHeight);

                // draw cursor
                var cursorPos = Tracker.getCurrentTrackPosition();
                var cursorWidth = 9;
                var cursorX = trackLeft + 60 + ((Tracker.getCurrentTrack()) * trackWidth) + (cursorPos*cursorWidth) - 1;
                if (cursorPos > 0) {
                    cursorX += cursorWidth*2 + 1;
                    if (cursorPos > 2) cursorX += 2;
                }else{
                    cursorWidth = 28;
                }

                //me.ctx.fillStyle = "rgba(231,198,46,.5)";
                me.ctx.fillStyle = "rgba(220,220,220,.3)";
                me.ctx.fillRect(cursorX,centerLineTop,cursorWidth,lineHeight+2);


                for (var i = visibleStart; i< visibleEnd; i++){
                    if (i>=0 && i<64){
                        var step = pattern[i];
                        var y = baseY + ((i-visibleStart)*lineHeight);

                        var isCenter = true;
                        if (y<centerLineTop){
                            y -= 3;
                            isCenter = false;
                        }
                        if (y>centerLineTop+lineHeight) {
                            y += 3;
                            isCenter = false;
                        }

                        var ti = "" + i;
                        if (i<10) ti = "0" + ti;
                        var color = false;
                        if (i%4 == 0) color = "orange";
                        drawText(ti,trackLeft+10,y,color);
                        if (isCenter){
                            drawText(ti,trackLeft+10,y,color);
                            drawText(ti,trackLeft+10,y,color);
                        }

                        for (var j = 0; j<4;j++){
                            var note = step[j];
                            var x = trackLeft + 60 + (j*trackWidth);

                            var baseNote = periodNoteTable[note.period];

                            var noteString = baseNote ? baseNote.name : "---";

                            drawText(noteString,x,y);
                            if (isCenter){
                                drawText(noteString,x,y);
                                drawText(noteString,x,y);
                            }

                            x += (fontMed.charWidth*3) + 4;
                            noteString = formatHex(note.sample,2,"0");
                            drawText(noteString,x,y,"green");

                            x += (fontMed.charWidth*2) + 4;
                            noteString = formatHex(note.effect);
                            noteString += formatHex(note.param,2,"0");
                            drawText(noteString,x,y,"orange");



                        }
                    }

                }
            }

            setScrollBarPosition();
            scrollBar.render();

        }
        this.needsRendering = false;

        me.parentCtx.drawImage(me.canvas,me.left,me.top,me.width,me.height);
    };

    function drawText(t,x,y,color){
        fontMed.write(me.ctx,t,x,y,0,color);
    }

    function formatHex(i,length,padString){
        var h = i.toString(16).toUpperCase();
        if (length && h.length<length){
            padString = padString || "0";
            while (h.length<length){
                h = padString + h;
            }
        }
        return h;
    }

    function setScrollBarPosition(){

        var patternPos = Tracker.getCurrentPatternPos() || 0;
        if (visibleLines){
            var startTop = 1;
            var top = startTop;
            var startHeight = me.height-2;
            var height = startHeight;
            scrollBarItemOffset = 0;

            if (max>1){
                height = Math.floor((visibleLines / max) * startHeight);
                if (height<12) height = 12;
                scrollBarItemOffset = (startHeight - height) / (max-1);
            }

            if (patternPos && scrollBarItemOffset){
                top = Math.floor(startTop + scrollBarItemOffset*patternPos);
            }

            scrollBar.setProperties({
                left: me.width - 16,
                top: top,
                width: 16,
                height: height
            });
        }

    }

    me.onMouseWheel = function(touchData){
        if (Tracker.isPlaying()) return;
        var pos = Tracker.getCurrentPatternPos();
        if (touchData.mouseWheels[0] > 0){
            if (pos) Tracker.moveCurrentPatternPos(-1);
        }else{
            if (pos<max-1) Tracker.moveCurrentPatternPos(1);
        }
    };

    me.onDragStart = function(touchData){
        if (Tracker.isPlaying()) return;
        me.startDragPos = Tracker.getCurrentPatternPos();
    };

    me.onDrag = function(touchData){
        if (Tracker.isPlaying()) return;

        var delta =  Math.round((touchData.dragY - touchData.startY)/lineHeight);
        var targetPos = me.startDragPos - delta;
        targetPos = Math.max(targetPos,0);
        targetPos = Math.min(targetPos,max-1);
        Tracker.setCurrentPatternPos(targetPos);
    };

    return me;

};

