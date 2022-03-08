let current = 0;
let threshold = 5;

// Initialize the viewer (calls the constructor in functions.js)
const E = window.exports;
let { viewer, panner, filter, stereoPanner, audioCtx, audioElement, track, listener } = E.funcs.initialize();
E.funcs.setMarker(viewer, E.consts.targetLat, E.consts.targetLng, "target");

// Get route
const checkpoints = []
const startPos = {lng: null, lat: null}
const initPromise = new Promise(function(resolve,reject){
    viewer.getPosition()
        .then (async function (pos){
            const p = await pos;
            startPos.lng = p.lng;
            startPos.lat = p.lat;
            E.funcs.setListenerPos(listener, audioCtx, startPos.lng, startPos.lat)
            E.funcs.getRoute(startPos.lng, startPos.lat,E.consts.targetLng, E.consts.targetLat)
            .then(locations => {for (var i = 0; i < locations.length; i++){
                checkpoints.push({lng: locations[i][0], lat: locations[i][1]});
                }
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
            cp = E.funcs.getNextCheckPoint(position, checkpoints, current);
            if (E.funcs.distance(position, cp) < threshold){
                current+=1;
                if (current === checkpoints.length-1){
                    console.log("You made it!")
                }
                //cp = E.funcs.getNextCheckPoint(pos, checkpoints, current)
            } 
            E.funcs.setListenerPos(listener, audioCtx, position.lat, position.lng) 
        });
});

// Update listener POV if user updates their POV 
viewer.on('bearing', event => {
    const bearing = event.bearing * (Math.PI / 180) // Get bearing and convert to radians
    resumeIfSuspended();
    cp = checkpoints[current];
    console.log(cp);
    const angle = E.funcs.calcAngle2(listener, bearing, cp);
    E.funcs.setStereoPannerPos2(stereoPanner, audioCtx, angle);
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
