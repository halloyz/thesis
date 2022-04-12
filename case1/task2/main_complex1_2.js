let startTime = 0
let endTime = 0
let result = window.localStorage.getItem(("result"));
result = JSON.parse(result)
let current = 0; //Keeps track of current checkpoint index, (initial: 0)
const threshold = 20; //Distance in m for when audio should move to next checkpoint (default: 20)
let posMarker; //Will show user position on map
let cp;

let checkbox = document.querySelector("input");
L.mapquest.key = 'NePvDdAo6FWQ7Q9oc5G7B2caoYXN876p';

//We will use a map to see what is going on from above.
 const map =L.mapquest.map('map', {
  center: [55.680763888889, 12.560666666667],
  // L.mapquest.tileLayer('map') is the MapQuest map tile layer
  layers: L.mapquest.tileLayer('map'),
  zoom: 20
});

// Initialize the viewer (calls the constructor in functions.js)
const E = window.exports;
let { viewer, panner, stereoPanner, filter, gain, audioCtx, audioElement, successElement, listener } = E.funcs.initialize();
//E.funcs.setMarker(viewer, E.consts.targetLat, E.consts.targetLng, "target");

// Get route
const checkpoints = []
const markers = []
const initPromise = new Promise(function(resolve,reject){
    viewer.getPosition()
        .then (async function (pos){
            const p = await pos;
            map.setView([p.lat, p.lng]);
            posMarker = L.marker([p.lat,p.lng], {icon: L.mapquest.icons.circle({primaryColor: '#FF0000',
            })}).addTo(map)
            E.funcs.setListenerPos(listener, audioCtx, p.lng, p.lat)
            E.funcs.getRoute(p.lng, p.lat, E.consts.targetLng, E.consts.targetLat)
            
            .then(locations => {for (var i = 0; i < locations.length; i++){
                checkpoints.push({lng: locations[i][0], lat: locations[i][1]});
                let m = L.marker([locations[i][1], locations[i][0]], {icon: L.mapquest.icons.marker({symbol: String(i)})})
                    .bindTooltip(String(i))
                    .addTo(map)
                markers.push(m)
                }
                E.funcs.setMarker(viewer, checkpoints[1].lat, checkpoints[1].lng, "cp")
                cp = checkpoints[current+1];
                viewer.getBearing()
                .then(bearing => E.funcs.calcAngle2(listener,bearing,checkpoints[1]))
                .then(angle => E.funcs.setStereoPannerPos2(stereoPanner,audioCtx,angle))
                .then(resolve())
                .catch(function(err) {
                    console.error(err);
                })

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
    startTime = performance.now();
// Update listener position+relative angle if user updates their position
    viewer.on('position', event => {
        resumeIfSuspended();
        viewer.getPosition()
            .then(function(position){
                let p = position;
                posMarker.setLatLng([p.lat, p.lng])
                E.funcs.setListenerPos(listener, audioCtx, p.lng, p.lat);

                let dist = E.funcs.dist(listener, cp)
                console.log(`Distance:  ${dist}`)
                if (dist < threshold){
                    console.log('Checkpoint updated!')
                    markers[current+1].setIcon(L.mapquest.icons.marker({primaryColor: '#FF0000',}))

                    current +=1;

                    if (current === checkpoints.length-1){ //If current checkpoint is the final checkpoint, we made it 
                        let time = Math.floor((performance.now() - startTime)/1000)
                        result.task2 = time
                        window.localStorage.setItem("result", JSON.stringify(result));
                        audioElement.pause()
                        successElement.play()
                        alert("You made it!");
                        window.location.href = "https://halloyz.github.io/thesis/case1/finish.html";
                    }
                }
                cp = checkpoints[current+1]
                E.funcs.setMarker(viewer, cp.lat, cp.lng, "cp");

                viewer.getBearing()//The angle relative to the speaker changes with listener position also, so we need to update that as well
                    .then(bearing => {
                        bearing = (bearing * Math.PI / 180)//convert to radians
                        const angle = E.funcs.calcAngle2(listener, bearing, cp)
                        E.funcs.setStereoPannerPos2(stereoPanner, audioCtx, angle)
                        E.funcs.setFilterCutoff(filter, audioCtx, angle);
                        E.funcs.setGain(gain, audioCtx, angle)
                        //console.log(`The angle is: ${angle}`);
                        })
                

                if (!checkbox.checked){
                    viewer.deactivateComponent('marker');
                }


            });
    });

    // Update angle relative to speaker if user updates their POV (rotating)
    viewer.on('bearing', event => {
        const bearing = event.bearing * (Math.PI / 180) // Get bearing and convert to radians
        resumeIfSuspended();
        let cp = checkpoints[current+1];
        const angle = E.funcs.calcAngle2(listener, bearing, cp);
        E.funcs.setStereoPannerPos2(stereoPanner, audioCtx, angle);
        console.log(`The angle is: ${angle}`);
        E.funcs.setFilterCutoff(filter, audioCtx, angle);
        E.funcs.setGain(gain, audioCtx, angle)
    });

    //Button to play/pause audio
    document.getElementById("start").onclick = event => {
        if (audioElement.paused || !audioElement.currentTime) {
            audioElement.play()
                .then(() => console.log("Playback started!"))
                .catch(e => console.error("Playback failed"));
        } else {
            audioElement.pause();

        }
    };

    //Checkbox for showing markers (where the audio is coming from)
    checkbox.addEventListener('change', function() {
    if (this.checked) {
        viewer.activateComponent('marker');
    } else {
        viewer.deactivateComponent('marker');
    }
    });

});
