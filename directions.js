L.mapquest.key = 'NePvDdAo6FWQ7Q9oc5G7B2caoYXN876p';


// 'map' refers to a <div> element with the ID map
 var map =L.mapquest.map('map', {
  center: [55.680763888889, 12.560666666667],
  // L.mapquest.tileLayer('map') is the MapQuest map tile layer
  layers: L.mapquest.tileLayer('map'),
  zoom: 20
});

let locations = [[12.560618,55.680772],[12.560582,55.680699],[12.560024,55.680891],[12.559954,55.680888],[12.559514,55.681091],[12.558806,55.681346],[12.55848,55.681445],[12.557944,55.68157],[12.5576,55.681612],[12.5574,55.681555],[12.557548,55.681644],[12.557576,55.6817],[12.557543,55.681814],[12.557083,55.681808],[12.556648,55.68178],[12.556634,55.681606],[12.555867,55.680928],[12.555494,55.680552],[12.55564,55.680476],[12.556182,55.680365]]
for (var i = 0; i < locations.length; i++) {
L.marker([locations[i][1], locations[i][0]], {icon: L.mapquest.icons.marker()}).addTo(map)

}

function getRoute(startLng, startLat, endLng, endLat){
  // Add your api_key here
  let a;
  let orsDirections = new Openrouteservice.Directions({ api_key: "5b3ce3597851110001cf6248733a96d9c13a4d91994d48edeb3bf8aa"});

  orsDirections.calculate({
    coordinates: [[startLng, startlat], [endLng, endLat]],
    profile: "driving-car",
    //extra_info: ["waytype", "steepness"],
    format: "geojson",
    api_version: "v2",
    geometry_simplify: true
  })
  .then(function(json) {
      // Add your own result handling here
      j = json;
      a = JSON.stringify(j.features[0].geometry.coordinates);
      
    })
  .catch(function(err) {
    console.error(err);
  });
  return a;
};

function updateAudio(checkPoints, position){

}
