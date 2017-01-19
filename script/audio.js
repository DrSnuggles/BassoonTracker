var Audio = (function(){
    var me = {};

    window.AudioContext = window.AudioContext||window.webkitAudioContext;
    var context = new AudioContext();
    var masterVolume;
    var i;
    var trackVolume = [];
    var numberOfTracks = 4;

    masterVolume = context.createGain();
    masterVolume.gain.value = 0.7;
    masterVolume.connect(context.destination);

    for (i = 0; i<numberOfTracks;i++){
        var gain = context.createGain();
        gain.gain.value = 0.7;
        gain.connect(masterVolume);
        trackVolume.push(gain);
    }

    EventBus.on(EVENT.trackStateChange,function(event,state){
        if (typeof state.track != "undefined" && trackVolume[state.track]){
            trackVolume[state.track].gain.value = state.mute?0:0.7;
        }
    });

    me.playSample = function(index,period,volume,track,effects){

        period = period || 428; // C-3
        track = track || Tracker.getCurrentTrack();

        var sample = Tracker.getSample(index);

        if (sample){
            var sampleBuffer;
            var offset = 0;
            var sampleLength = 0;

            volume = typeof volume == "undefined" ? (100*sample.volume/64) : volume;

            if (sample.finetune){
                var note = periodNoteTable[period];
                if (note && note.tune){
                    var centerTune = 8;
                    var tune = 8 + sample.finetune;
                    if (tune>0 && tune<note.tune.length) period = note.tune[tune];
                }

            }
            var sampleRate = PALFREQUENCY / (period*2);

            //volume = volume * (sample.volume/64);

            var initialPlaybackRate = 1;

            if (sample.data.length) {
                sampleLength = sample.data.length;

                if (effects && effects.offset && effects.offset.value<sampleLength){
                    offset = effects.offset.value;
                    sampleLength -= offset;
                }
                // note - on safari you can't set a different samplerate?
                sampleBuffer = context.createBuffer(1, sampleLength,context.sampleRate);
                initialPlaybackRate = sampleRate / context.sampleRate;
            }else {
                // empty samples are often used to cut of the previous sample
                sampleBuffer = context.createBuffer(1, 1, sampleRate);
                offset = 0;
            }
            var buffering = sampleBuffer.getChannelData(0);
            for(i=0; i < sampleLength; i++) {
                buffering[i] = sample.data[i + offset];
            }

            var source = context.createBufferSource();
            source.buffer = sampleBuffer;

            var volumeGain = context.createGain();
            volumeGain.gain.value = volume/100; // TODO : instrument volume

            if (sample.loopStart && sample.loopRepeatLength>1){

                if (!SETTINGS.unrollLoops){
                    function createLoop(){
                        var loopLength = sample.loopRepeatLength;
                        var loopBuffer = context.createBuffer(1, loopLength, sampleRate);


                        var loopBuffering = loopBuffer.getChannelData(0);
                        for(i=0; i < loopLength; i++) {
                            loopBuffering[i] = sample.data[sample.loopStart + i];
                        }

                        var loop = context.createBufferSource();
                        loop.buffer = loopBuffer;
                        loop.connect(volumeGain);
                        loop.start(0);

                        loop.onended = function(){
                            console.error("loop end");
                            createLoop();
                        };
                        return loop;
                    }

                    //source.loop = true;
                    // in seconds ...
                    //source.loopStart = sampleRate
                    //source.loopEnd = ..

                    source.onended = function() {
                        console.error("base sample end");
                        createLoop()
                    };
                }

            }

            source.connect(volumeGain);
            volumeGain.connect(trackVolume[track]);

            source.playbackRate.value = initialPlaybackRate;
            var sourceDelayTime = 0;


            // this was a feably attempt to implement arpeggio
            // reactivate this if we want to play real chords (simultaneously);

            /*if (effects && effects.chord && effects.chord.root){

                var interval1,interval2,sourceDuplicate;

                var bpm = Tracker.getBPM();
                var speed = Tracker.getAmigaSpeed();

                if (effects.chord.interval1 && speed>1) interval1 = semiTonesFrom(source,period,effects.chord.interval1);
                if (effects.chord.interval2 && speed>2) interval2 = semiTonesFrom(source,period,effects.chord.interval2);


                var tickTime = 2.5/bpm;

                // should the notes be played each tick or evenly spread accros the step?
                // the specs are blurry about this
                // let's assume the second

                if (interval1 || interval2){

                    var notesToPlay = 2;
                    if (interval1) notesToPlay++;
                    if (interval2) notesToPlay++;

                    var stepTime = speed*tickTime;
                    var arpeggioDelay = stepTime/notesToPlay;

                    notesToPlay--;
                    var time = arpeggioDelay*notesToPlay;
                    sourceDelayTime = time;

                    if (interval2){
                        notesToPlay--;
                        interval2.connect(volumeGain);
                        time = arpeggioDelay*notesToPlay;
                        interval2.start(time);
                        try{
                            interval2.stop(time+arpeggioDelay);
                        }catch (e){}
                    }

                    if (interval1){
                        notesToPlay--;
                        interval1.connect(volumeGain);
                        time = arpeggioDelay*notesToPlay;
                        interval1.start(time);
                        console.error("interval1 " + (time+arpeggioDelay));
                        //interval1.stop(time+1);
                    }

                    sourceDuplicate = semiTonesFrom(source,period,0);
                    sourceDuplicate.connect(volumeGain);
                    sourceDuplicate.start(0);
                    try{
                        sourceDuplicate.stop(arpeggioDelay);
                    }catch (e){}
                }
            }*/

            source.start(sourceDelayTime);

            var result = {
                source: source,
                volume: volumeGain,
                startVolume: volume,
                currentVolume: volume,
                startPeriod: period,
                startPlaybackRate: initialPlaybackRate,
                sampleIndex: index
            };

            EventBus.trigger(EVENT.samplePlay,result);

            return result;
        }

        return {};
    };

    me.masterVolume = masterVolume;
    me.context = context;
    me.trackVolume = trackVolume;


    /**

     get a new AudioNode playing at x semitones from the root note
     // used to create Chords and Arpeggio

     @param {audioNode} source: audioBuffer of the root note
     @param {Number} root: period of the root note
     @param {Number} semitones: amount of semitones from the root note
     @param {Number} finetune: finetune value of the base sample
     @return {audioNode} audioBuffer of the new note
     */
    function semiTonesFrom(source,root,semitones,finetune){
        var target;

        target = context.createBufferSource();
        target.buffer = source.buffer;

        if (semitones){
            var rootNote = periodNoteTable[root];
            var rootIndex = noteNames.indexOf(rootNote.name);
            var targetName = noteNames[rootIndex+semitones];
            if (targetName){
                var targetNote = nameNoteTable[targetName];
                if (targetNote){
                    target.playbackRate.value = (rootNote.period/targetNote.period) * source.playbackRate.value;
                }
            }
        }else{
            target.playbackRate.value = source.playbackRate.value
        }

        return target;

    }

    me.getSemiToneFrom = function(period,semitones){
        var result = period;
        if (semitones){
            var rootNote = periodNoteTable[period];
            var rootIndex = noteNames.indexOf(rootNote.name);
            var targetName = noteNames[rootIndex+semitones];
            if (targetName){
                var targetNote = nameNoteTable[targetName];
                if (targetNote){
                    result = targetNote.period;
                }
            }
        }
        return result;
    };

    return me;

}());

