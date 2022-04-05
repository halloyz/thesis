

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


//Resonance audio
const audioElement = document.getElementById('music');
const track = audioCtx.createMediaElementSource(audioElement);
let resonanceAudio = new ResonanceAudio(audioCtx);
let source = resonanceAudio.createSource({
});
track.connect(source.input);
resonanceAudio.output.connect(audioCtx.destination);


function play(){
if (audioElement.paused){
  audioElement.play()
} else  {
  audioElement.pause()
}
};

function calcAngle2(listener, bearing, targ, refLng, refLat) {

  const lpos = listener;

  const pCoords = { x: targ[0], y: targ[1] };
  const lCoords = { x: lpos[0], y: lpos[1] };
  const dirCoords = { 
    x: lCoords.x + Math.sin(bearing),
    y: lCoords.y + Math.cos(bearing)
};

  const lp = { x: pCoords.x - lCoords.x, y: pCoords.y - lCoords.y };
  const ld = { x: dirCoords.x - lCoords.x, y: dirCoords.y - lCoords.y };
  const lp_ = Math.sqrt((lp.x*lp.x+lp.y*lp.y));
  const ld_ = Math.sqrt((ld.x*ld.x+ld.y*ld.y));
  const det = lp.x * ld.y - lp.y * ld.x;
  const dot = lp.x*ld.x+lp.y*ld.y;
  //const cos_alpha = (lp.x*ld.x+lp.y*ld.y)/(lp_*ld_)
  let alpha = Math.atan2(det, dot);
  alpha = alpha * (180.0/Math.PI);
  //console.log(alpha)
  return alpha;
}
