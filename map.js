
let {Viewer, SimpleMarker} = mapillary;

let viewer = new Viewer({
  accessToken: 'MLY|5055210414499610|cc32fb072365a29201fee81cf2d9e241',
  container: 'mly', // the ID of our container defined in the HTML body
  // imageId: '740655373279080',
  imageId: '766958267354889',
  component: { marker: true, cover: false }
});
// viewer.setFilter(["==", "cameraType", 'spherical'], ["==", "creatorId", "gisfrb"]);
viewer.setFilter(["==", "cameraType", 'spherical'],["==", "sequenceKey", "DkKRnE0Wuj58hdukO82mxg"]);
let targetLat = 55.680763888889
let targetLng = 12.560666666667

let targetLat2 = 55.67924758911006
let targetLng2 = 12.57758973733007

const markerComponent = viewer.getComponent("marker");
viewer.activateComponent("marker");

let defaultMarker = new SimpleMarker(
    "id-1",
    {lat: targetLat, lng: targetLng});

let targetMarker = new SimpleMarker(
    "id-2",
    {lat: targetLat2, lng: targetLng2});

markerComponent.add([defaultMarker]);
markerComponent.add([targetMarker]);


$(document).ready(function(){
  let sequence_id = $.get("https://graph.mapillary.com/image_ids?sequence_id=DkKRnE0Wuj58hdukO82mxg&access_token=MLY|5055210414499610|cc32fb072365a29201fee81cf2d9e241")
  console.log(JSON.stringify(sequence_id));
})


//playAudio()

viewer.on('position', async (event) => {
  let position =  viewer.getPosition();
  position.then((position)=>{
      let lastKnownLat = position.lat;
      let lastKnownLng = position.lng;
      console.log(distance(lastKnownLat,lastKnownLng,targetLat,targetLng))
    })

});

viewer.on('bearing', (event) => {
    // console.log(`'${event.type}' - bearing: ${event.bearing}`);
    myPanner.pan.value = event.bearing/360;
    console.log(myPanner.pan.value);
  });




function distance(lat1, lon1, lat2, lon2) {
    var p = 0.017453292519943295;    // Math.PI / 180
    var c = Math.cos;
    var a = 0.5 - c((lat2 - lat1) * p)/2 + 
            c(lat1 * p) * c(lat2 * p) * 
            (1 - c((lon2 - lon1) * p))/2;
  
    return 12742 * Math.asin(Math.sqrt(a)); // 2 * R; R = 6371 km
  }




