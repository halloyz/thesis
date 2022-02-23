const ctx = new AudioContext();

const buffer = ctx.createBuffer(2, ctx.sampleRate * 1, ctx.sampleRate);

const leftData = buffer.getChannelData(0);
const rightData = buffer.getChannelData(1);


for (let i = 1; i < buffer.length; i++){
    leftData[i] = Math.random() * 2 - 1;
    rightData[i] = Math.random() * 2 - 1;
}

const primaryGaincontrol = ctx.createGain()
primaryGaincontrol.gain.setValueAtTime(0.01, 0);
primaryGaincontrol.connect(ctx.destination)

const filter = ctx.createBiquadFilter();
filter.type = "hipass"
filter.frequency.value = 3000;
filter.connect(primaryGaincontrol)

const myPanner = ctx.createStereoPanner();
myPanner.connect(filter);


const whiteNoiseSource = ctx.createBufferSource();



function playAudio(){
    whiteNoiseSource.buffer = buffer;
    whiteNoiseSource.connect(filter)
    whiteNoiseSource.connect(myPanner)
    whiteNoiseSource.loop = true;
   whiteNoiseSource.start();
}

function stopAudio(){
    whiteNoiseSource.stop();
}


let options = {
  positionX : 1,
  maxDistance: 5000
}


//myPanner.pan.value = 1;
//const listener = ctx.listener;


