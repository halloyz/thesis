

const audioCtx = new AudioContext();
var panner = audioCtx.createPanner();
const listener = audioCtx.listener;
const filter = audioCtx.createBiquadFilter();
filter.type = "hipass"
const hipass_freq = 3000;
filter.frequency.value = hipass_freq;

panner.panningModel = 'HRTF';
panner.distanceModel = 'inverse';
panner.refDistance = 1;
panner.maxDistance = 10000;
panner.rolloffFactor = 1;
panner.coneInnerAngle = 360;
panner.coneOuterAngle = 0;
panner.coneOuterGain = 0;


const audioElement = document.querySelector('audio');
const track = audioCtx.createMediaElementSource(audioElement);
track.connect(panner);
panner.connect(filter);
filter.connect(audioCtx.destination);



function play(){
if (audioElement.paused){
  audioElement.play()
} else  {
  audioElement.pause()
}

document.getElementById("start").onclick = function() {playAudio()}
    };
