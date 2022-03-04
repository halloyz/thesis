

const {Viewer, SimpleMarker, geodeticToEnu, enuToGeodetic} = mapillary;

let audioCtx;
let panner;
let track;
let listener;
let viewerPos;
let audioPos;
let markerComponent;
let refLat = 55.680763888889
let refLng = 12.560666666667

//MAPILLARY

//  Viewer constructor
function initializeViewer(params){
    let viewer = new Viewer(params)
    viewer.setFilter(["==", "cameraType", 'spherical'], ["==", "creatorId", "gisfrb"]);
    return viewer;

}


function setMarker(latitude, longitude, id){
    markerComponent = viewer.getComponent("marker");
    viewer.activateComponent("marker");
    let targetMarker = new SimpleMarker(id, {lat: latitude, lng: longitude});
    markerComponent.add([targetMarker]);

}

//  Haversine formula to calculate the distance between two points
function distance(lat1, lon1, lat2, lon2) {
    var p = 0.017453292519943295;    // Math.PI / 180
    var c = Math.cos;
    var a = 0.5 - c((lat2 - lat1) * p)/2 + 
            c(lat1 * p) * c(lat2 * p) * 
            (1 - c((lon2 - lon1) * p))/2;
  
    return 12742 * Math.asin(Math.sqrt(a)); // 2 * R; R = 6371 km
  }


//AUDIO

//  Function to create a new audiocontext, panner and listener for the audio and select audio source. 
//  The panner controls the audio position (only updated once) and the listener tells the panner about the users location so it can 
//  modulate the signal accordingly.

function initializeAudio(filter = false, reverb = false){
    audioCtx = new AudioContext();
    panner = audioCtx.createPanner();
    audioElement = document.getElementById('music');
    track = audioCtx.createMediaElementSource(audioElement);
    listener = audioCtx.listener;
   
    panner.panningModel = 'HRTF';
    panner.distanceModel = 'inverse';
    panner.refDistance = 1;
    panner.maxDistance = 10000;
    panner.rolloffFactor = 1;
    panner.coneInnerAngle = 360;
    panner.coneOuterAngle = 0;
    panner.coneOuterGain = 0;

    if (filter){
        console.log("Filter not yet implemented.")
    }

    if (reverb){
        console.log("Reverb not yet implemented.")
    }

    track.connect(panner);
    panner.connect(audioCtx.destination);

}
//  Sets the listener position. geoDeticToEnu converts latitude and longitude to x-y-z coordinates in a local topocentric plane 
//  using a reference latitude and longitude.
function setListenerPos(latitude, longitude){

        pos = geodeticToEnu(longitude, latitude, 0, refLng, refLat, 0);
        listener.positionX.setValueAtTime(pos[0], audioCtx.currentTime);
        listener.positionY.setValueAtTime(pos[1], audioCtx.currentTime);
        listener.positionZ.setValueAtTime(0, audioCtx.currentTime);
        
    }
// Sets listener point of view using the bearing (relative compass angle to north).
function setListenerPov(bearing){
    x = listener.positionX.value + Math.sin(bearing);
    y = listener.positionY.value + Math.cos(bearing);
    console.log(x);
    console.log(y);
    listener.forwardX.setValueAtTime(x, audioCtx.currentTime);
    listener.forwardY.setValueAtTime(y, audioCtx.currentTime);
    listener.forwardZ.setValueAtTime(0, audioCtx.currentTime);
    listener.upX.setValueAtTime(0, audioCtx.currentTime);
    listener.upY.setValueAtTime(0, audioCtx.currentTime);
    listener.upZ.setValueAtTime(0, audioCtx.currentTime);
    coords = enuToGeodetic(x, y, 0, refLng, refLat, 0);
    let bearingmarker = new SimpleMarker("bearing", {lat: coords[1], lng: coords[0]});
    markerComponent.add([bearingmarker]);
    //filter.frequency.value = event.bearing * (hipass_freq/360)
  
}

function setPannerPos(longitude, latitude){
    pos = geodeticToEnu(longitude, latitude, 0, refLng, refLat, 0);
    panner.positionX.setValueAtTime(pos[0], audioCtx.currentTime);
    panner.positionY.setValueAtTime(pos[1], audioCtx.currentTime);
    panner.positionZ.setValueAtTime(0, audioCtx.currentTime);

}
function playPause(){
    if (audioElement.paused || audioElement.currentTime == 0){
        audioElement.play().then(function() {
            console.log("Playback started!");
          }).catch(function(error) {
            console.log("Playback failed");
            // Show a UI element to let the user manually start playback.
          });
        
    } else {
      audioElement.pause().then(function(){
          console.log("Playback paused!");
      });
      }
    }

function resumeIfSuspended(){
    if (audioCtx.state == "suspended") {
        audioCtx
            .resume()
            .then(() => console.log("Resumed"))
            .catch(() => console.error("Could not resume"));
    } 
}
//OPENROUTESERVICE – Only used for
