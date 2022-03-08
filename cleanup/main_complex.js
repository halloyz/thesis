let current = 0;
let threshold = 20;
let posMarker;
L.mapquest.key = 'NePvDdAo6FWQ7Q9oc5G7B2caoYXN876p';

// 'map' refers to a <div> element with the ID map
 var map =L.mapquest.map('map', {
  center: [55.680763888889, 12.560666666667],
  // L.mapquest.tileLayer('map') is the MapQuest map tile layer
  layers: L.mapquest.tileLayer('map'),
  zoom: 20
});

// Initialize the viewer (calls the constructor in functions.js)
const E = window.exports;
let { viewer, panner, filter, stereoPanner, audioCtx, audioElement, track, listener } = E.funcs.initialize();
E.funcs.setMarker(viewer, E.consts.targetLat, E.consts.targetLng, "target");

// Get route
const checkpoints = []
const markers = []
const startPos = {lng: null, lat: null}
const initPromise = new Promise(function(resolve,reject){
    viewer.getPosition()
        .then (async function (pos){
            console.log(pos);
            const p = await pos;
            startPos.lng = p.lng;
            startPos.lat = p.lat;
            map.setView([p.lat, p.lng]);
            posMarker = L.marker([p.lat,p.lng], {icon: L.mapquest.icons.circle({primaryColor: '#FF0000',
            })}).addTo(map)
            E.funcs.setListenerPos(listener, audioCtx, startPos.lng, startPos.lat)
            E.funcs.getRoute(startPos.lng, startPos.lat, E.consts.targetLng, E.consts.targetLat)
            .then(locations => {for (var i = 0; i < locations.length; i++){
                checkpoints.push({lng: locations[i][0], lat: locations[i][1]});
                let m = L.marker([locations[i][1], locations[i][0]], {icon: L.mapquest.icons.marker()})
                m.addTo(map)
                markers.push(m)
                }
                E.funcs.setMarker(viewer, checkpoints[1].lat, checkpoints[1].lng, "cp")
                viewer.getBearing()
                .then(bearing => E.funcs.calcAngle2(listener,bearing,checkpoints[1]))
                .then(angle => E.funcs.setStereoPannerPos2(stereoPanner,audioCtx,angle))
                .then(resolve())
                .catch(function(err) {
                    console.error(err);
                })
                    //.then(next => E.funcs.calcAngle2(listener,b,next))
                    //.then(angle => console.log(angle));
                    //;
                })
            })
        });

    function resumeIfSuspended() {
    if (audioCtx.state === "suspended") {
        audioCtx.resume()
            .then(() => console.log("Resumed"))
            .catch(() => console.error("Could not resume"));
    }
}

initPromise.then(function(){
// Update listener position if user updates their position
viewer.on('position', event => {
    resumeIfSuspended();
    viewer.getPosition()
        .then(function(position){
            p = position;
            posMarker.setLatLng([p.lat, p.lng])
            E.funcs.setListenerPos(listener, audioCtx, p.lng, p.lat);
            //cp = E.funcs.getNextCheckPoint(p, checkpoints, current);
            cp = checkpoints[current+1];
            E.funcs.setMarker(viewer, cp.lat, cp.lng, "cp");
            //console.log(p)
            dist = E.funcs.dist(listener, cp)
            console.log(dist);
            if (dist < threshold){
                markers[current].setIcon(L.mapquest.icons.marker({primaryColor: '#FF0000',
            }))
                current+=1;
                
                if (current === checkpoints.length-1){
                    console.log("You made it!")
                }
                //cp = E.funcs.getNextCheckPoint(pos, checkpoints, current)
            } 
            //console.log(cp);

        });
});

// Update listener POV if user updates their POV 
viewer.on('bearing', event => {
    const bearing = event.bearing * (Math.PI / 180) // Get bearing and convert to radians
    resumeIfSuspended();
    cp = checkpoints[current+1];
    const angle = E.funcs.calcAngle2(listener, bearing, cp);
    E.funcs.setStereoPannerPos2(stereoPanner, audioCtx, angle);
    console.log(`The angle is: ${angle}`);

    //E.funcs.setFilterCutoff(filter, audioCtx,angle);
});

document.getElementById("start").onclick = event => {
    if (audioElement.paused || !audioElement.currentTime) {
        audioElement.play()
            .then(() => console.log("Playback started!"))
            .catch(e => console.error("Playback failed"));
    } else {
        audioElement.pause()
            .then(() => console.log("Playback paused!"))
            .catch(e => console.error("Pause failed"));
    }
};

});
