
const audioCtx = new AudioContext();
var panner = audioCtx.createPanner();
const listener = audioCtx.listener;

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
panner.connect(audioCtx.destination)

function playAudio(){
if (audioCtx.state === 'suspended'){
  audioElement.play()
}

    };
