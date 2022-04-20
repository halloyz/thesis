let startTime = 0;
let endTime = 0;
let result = window.localStorage.getItem(("result"));
result = JSON.parse(result);
let current = 0; //Keeps track of current checkpoint index, (initial: 0)
const threshold = 20; //Distance in m for when audio should move to next checkpoint (default: 20)
let posMarker; //Will show user position on map


let checkbox = document.querySelector("input");
L.mapquest.key = 'NePvDdAo6FWQ7Q9oc5G7B2caoYXN876p';

//We will use a map to see what is going on from above.
 const map =L.mapquest.map('map', {
  center: [cases.case3.task3.targetLat, cases.case3.task3.targetLng,],
  // L.mapquest.tileLayer('map') is the MapQuest map tile layer
  layers: L.mapquest.tileLayer('map'),
  zoom: 20
});

// Initialize the viewer (calls the constructor in functions.js)
const c = result.case;
const E = window.exports;
let { viewer, stereoPanner, filter, gain, wetGain, audioCtx, audioElement, vocalElement, wetElement, successElement, listener } = E.funcs.initialize(cases[c].task3.imageId);
const target = {lat: cases[c].task3.targetLat, lng: cases[c].task3.targetLng};
let targetDist;
let dist;
E.funcs.setMarker(viewer, cases[c].task2.targetLat, cases[c].task2.targetLng, "target");

// This tells the audio module where to position the viewer
viewer.getPosition().then(function(pos){
    startTime = performance.now();
    const p = pos;
    E.funcs.setListenerPos(listener, audioCtx, p.lng, p.lat)
    targetDist = E.funcs.dist(listener, target)
    E.funcs.setReverb(gain,wetGain,targetDist,targetDist)

    posMarker = L.marker([p.lat,p.lng], {icon: L.mapquest.icons.circle({primaryColor: '#0000FF',})}).bindTooltip("You are here").addTo(map);
    let targetMarker = L.marker([target.lat, target.lng]).addTo(map);
    viewer.getBearing().then(function(bearing){
        const b = bearing;
        const angle = E.funcs.calcAngle2(listener,b,target)
        E.funcs.setStereoPannerPos2(stereoPanner,audioCtx,angle)
        E.funcs.setFilterCutoff(filter, audioCtx, angle);
        E.funcs.setGain(gain, wetGain, audioCtx, angle)
    })
});
    
//E.funcs.setPannerPos(panner, audioCtx, E.consts.targetLng, E.consts.targetLat);

const resumeIfSuspended = () => {
    if (audioCtx.state === "suspended") {
        audioCtx.resume()
            .then(() => console.log("Resumed"))
            .catch(() => console.error("Could not resume"));
    }
};

// Update listener position if user updates their position
viewer.on('position', event => {
    resumeIfSuspended();
    viewer.getPosition().then(function(position){
        const p = position;
        posMarker.setLatLng([p.lat, p.lng])
        E.funcs.setListenerPos(listener, audioCtx, p.lng, p.lat);
        dist = E.funcs.dist(listener, target);
        E.funcs.setReverb(gain, wetGain, dist, targetDist);
        if (dist < threshold){
            let time = Math.floor((performance.now() - startTime)/1000)
            result.task3.time = time;
            result.task3.completed = true;
            window.localStorage.setItem("result", JSON.stringify(result));
            audioElement.pause()
            successElement.play()
            alert("You made it!");
            //window.location.href = "https://halloyz.github.io/thesis/finish.html";
            window.location.href = "../finish.html"
        }
        viewer.getBearing().then(function(bearing){
            const b = bearing * (Math.PI / 180);
            const angle = E.funcs.calcAngle2(listener,b,target)
            console.log(`angle ${angle}`);
            E.funcs.setStereoPannerPos2(stereoPanner,audioCtx,angle)
            E.funcs.setFilterCutoff(filter, audioCtx, angle);
            E.funcs.setGain(gain, wetGain, audioCtx, angle)
        })
})
});

// Update listener POV if user updates their POV 
viewer.on('bearing', event => {
    resumeIfSuspended();
    const b = event.bearing * (Math.PI / 180);
    const angle = E.funcs.calcAngle2(listener,b,target)
    // console.log(`angle ${angle}`);
    E.funcs.setStereoPannerPos2(stereoPanner,audioCtx,angle)
    E.funcs.setFilterCutoff(filter, audioCtx, angle);
    E.funcs.setReverb(gain, wetGain,dist,targetDist)
    E.funcs.setGain(gain, wetGain,audioCtx, angle)
});

document.getElementById("start").onclick = event => {
    if (audioElement.paused || !audioElement.currentTime) {
        audioElement.play()
        vocalElement.play()
        wetElement.play()
            .then(() => console.log("Playback started!"))
            .catch(e => console.error("Playback failed"));
    } else {
        audioElement.pause();
        vocalElement.pause();
        wetElement.pause();

    }
};

document.getElementById("lost").onclick = function(){
    E.funcs.showMap(result,map);

}

