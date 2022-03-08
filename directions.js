L.mapquest.key = 'NePvDdAo6FWQ7Q9oc5G7B2caoYXN876p';
const E = window.exports;


// 'map' refers to a <div> element with the ID map
 var map =L.mapquest.map('map', {
  center: [55.680763888889, 12.560666666667],
  // L.mapquest.tileLayer('map') is the MapQuest map tile layer
  layers: L.mapquest.tileLayer('map'),
  zoom: 20
});

let checkpoints = [];
let cp;


function getRoute(startLng, startLat, endLng, endLat){
  // Add your api_key here
  let a;
  let j;
  let orsDirections = new Openrouteservice.Directions({ api_key: "5b3ce3597851110001cf6248733a96d9c13a4d91994d48edeb3bf8aa"});

  return orsDirections.calculate({
    coordinates: [[startLng, startLat], [endLng, endLat]],
    profile: "driving-car",
    //extra_info: ["waytype", "steepness"],
    format: "geojson",
    api_version: "v2",
    geometry_simplify: true
  })
  .then(function(json) {
      return new Promise((resolve, reject) => {
      resolve((json.features[0].geometry.coordinates));
      })
    })
  .catch(function(err) {
    console.error(err);
  });

};
let startLat = 55.680641878069
let startLng = 12.555555773811998
getRoute(startLng, startLat, 12.556296296296068, 55.680208333332985).then(locations =>{
  
  for (var i = 0; i < locations.length; i++) {
    L.marker([locations[i][1], locations[i][0]], {icon: L.mapquest.icons.marker()}).addTo(map)
    
    checkpoints.push({lng: locations[i][0], lat: locations[i][1]});
    
}
//checkpoints.push(locations);
});



function updateAudio(panner, checkpoints, position){
  panner.set


}
