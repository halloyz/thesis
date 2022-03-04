let targetLat = 55.680208333332985 //These variables define our destination coordinates
let targetLng = 12.556296296296068



//Parameters for the Mapillary Viewer constructor 
let options = {
    accessToken: 'MLY|5055210414499610|cc32fb072365a29201fee81cf2d9e241',
    container: 'mly', // the ID of our container defined in the HTML body
    imageId: '2921734351448761',
    //imageId: '2556983327944830',
    component: { marker: true, cover: false }
  };

//Initialize the viewer (calls the constructor in functions.js)
let viewer = initializeViewer(options);
setMarker(targetLat, targetLng, "target");


initializeAudio();
viewer.getPosition().then(pos => setListenerPos(pos.lat, pos.lng)); //This tells the audio module where to position the viewer
setPannerPos(targetLng, targetLat)


//Update listener position if user updates their position
viewer.on('position', async (event) => {
  let position =  viewer.getPosition();
  resumeIfSuspended();
  position.then((position)=>{
      setListenerPos(position.lat, position.lng)
      
    })

});
//Update listener POV if user updates their POV 
viewer.on('bearing', (event) => {
  bearing = event.bearing * (Math.PI/180) //get bearing and convert to radians
  resumeIfSuspended();
  setListenerPov(bearing) //placeaudio

});


document.getElementById("start").onclick = function() {playPause()};

