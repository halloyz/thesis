L.mapquest.key = 'NePvDdAo6FWQ7Q9oc5G7B2caoYXN876p';


// 'map' refers to a <div> element with the ID map
 L.mapquest.map('map', {
  center: [55.680763888889, 12.560666666667],
  // L.mapquest.tileLayer('map') is the MapQuest map tile layer
  layers: L.mapquest.tileLayer('map'),
  zoom: 12
});
