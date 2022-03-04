
(function() {

    // Initialize the viewer (calls the constructor in functions.js)
    const E = window.exports;
    let { viewer, panner, audioCtx, audioElement, track, listener } = E.funcs.initialize();
    E.funcs.setMarker(viewer, E.consts.targetLat, E.consts.targetLng, "target");
    
    // This tells the audio module where to position the viewer
    viewer.getPosition().then(pos => E.funcs.setListenerPos(listener, audioCtx, pos.lat, pos.lng));
    E.funcs.setPannerPos(panner, audioCtx, E.consts.targetLng, E.consts.targetLat);
    
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
        viewer.getPosition()
            .then(position => E.funcs.setListenerPos(listener, audioCtx, position.lat, position.lng));
    });

    // Update listener POV if user updates their POV 
    viewer.on('bearing', event => {
        bearing = event.bearing * (Math.PI / 180) // Get bearing and convert to radians
        resumeIfSuspended();
        E.funcs.setListenerPov(listener, audioCtx, viewer, bearing);
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
})();

