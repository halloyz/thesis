
let {Viewer, SimpleMarker, geodeticToEnu} = mapillary;

let viewer = new Viewer({
  accessToken: 'MLY|5055210414499610|cc32fb072365a29201fee81cf2d9e241',
  container: 'mly', // the ID of our container defined in the HTML body
   imageId: '2921734351448761',
  //imageId: '766958267354889',
  component: { marker: true, cover: false }
});
 viewer.setFilter(["==", "cameraType", 'spherical'], ["==", "creatorId", "gisfrb"]);
//viewer.setFilter(["==", "cameraType", 'spherical'],["==", "sequenceKey", "DkKRnE0Wuj58hdukO82mxg"]);
let refLat = 55.680763888889
let refLng = 12.560666666667

let targetLat = 55.680208333332985
let targetLng = 12.556296296296068

let target = geodeticToEnu(targetLat, targetLng, 0, refLat, refLng, 0);
const target_x = target[0]
const target_y = target[1]
const target_z = 0
const markerComponent = viewer.getComponent("marker");
viewer.activateComponent("marker");


let targetMarker = new SimpleMarker(
    "id-2",
    {lat: targetLat, lng: targetLng});

markerComponent.add([targetMarker]);


$(document).ready(function(){
  sq_url = "https://graph.mapillary.com/image_ids?sequence_id=DkKRnE0Wuj58hdukO82mxg&access_token=MLY|5055210414499610|cc32fb072365a29201fee81cf2d9e241"
  $.get(sq_url, function(sequence_id){
  console.log(JSON.stringify(sequence_id));
  });
})


//playAudio()


panner.positionX.setValueAtTime(target_x, audioCtx.currentTime);
panner.positionY.setValueAtTime(target_y, audioCtx.currentTime);
panner.positionZ.setValueAtTime(0, audioCtx.currentTime);

viewer.on('position', async (event) => {
  let position =  viewer.getPosition();
  position.then((position)=>{
      let lastKnownLat = position.lat;
      let lastKnownLng = position.lng;
      console.log(distance(lastKnownLat,lastKnownLng,targetLat,targetLng))
      pos = geodeticToEnu(lastKnownLat, lastKnownLng, 0, refLat, refLng, 0);
      listener.positionX.setValueAtTime(pos[0], audioCtx.currentTime);
      listener.positionY.setValueAtTime(pos[1], audioCtx.currentTime);
      listener.positionZ.setValueAtTime(0, audioCtx.currentTime);
      
      
      
      
    })

});

viewer.on('bearing', (event) => {
    // console.log(`'${event.type}' - bearing: ${event.bearing}`);
    playAudio();
    bearing = event.bearing/2*Math.PI
//    myPanner.pan.value = bearing
      listener.forwardX.setValueAtTime(Math.cos(bearing), audioCtx.currentTime);
      listener.forwardY.setValueAtTime(Math.sin(bearing), audioCtx.currentTime);
      listener.forwardZ.setValueAtTime(0, audioCtx.currentTime);
      listener.upX.setValueAtTime(0, audioCtx.currentTime);
      listener.upY.setValueAtTime(0, audioCtx.currentTime);
      listener.upZ.setValueAtTime(0, audioCtx.currentTime);
    
  });





function distance(lat1, lon1, lat2, lon2) {
    var p = 0.017453292519943295;    // Math.PI / 180
    var c = Math.cos;
    var a = 0.5 - c((lat2 - lat1) * p)/2 + 
            c(lat1 * p) * c(lat2 * p) * 
            (1 - c((lon2 - lon1) * p))/2;
  
    return 12742 * Math.asin(Math.sqrt(a)); // 2 * R; R = 6371 km
  }




