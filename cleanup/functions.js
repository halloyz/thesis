

const { Viewer, SimpleMarker, geodeticToEnu, enuToGeodetic } = mapillary;

const exports = {
    consts: {
        refLat: 55.680763888889,
        refLng: 12.560666666667,

        // These variables define our destination coordinates
        targetLat: 55.680208333332985, 
        targetLng: 12.556296296296068
    },
    funcs: {
        initialize() {
            // Initialize viewer
            // Parameters for the Mapillary Viewer constructor 
            let viewer = new Viewer({
                accessToken: 'MLY|5055210414499610|cc32fb072365a29201fee81cf2d9e241',
                container: 'mly', // the ID of our container defined in the HTML body
                imageId: '2921734351448761',
                //imageId: '2556983327944830',
                component: { marker: true, cover: false }
            });
        
            viewer.setFilter(["==", "cameraType", 'spherical'], ["==", "creatorId", "gisfrb"]);

            // Initialize Audio
            const audioCtx = new AudioContext();
            const audioElement = document.getElementById('music');
            const track = audioCtx.createMediaElementSource(audioElement);
            const listener = audioCtx.listener;

            const panner = audioCtx.createPanner();
            panner.panningModel = 'HRTF';
            panner.distanceModel = 'inverse';
            panner.refDistance = 1;
            panner.maxDistance = 10000;
            panner.rolloffFactor = 1;
            panner.coneInnerAngle = 360;
            panner.coneOuterAngle = 0;
            panner.coneOuterGain = 0;
        
            // TODO: add filter and reverb

            track.connect(panner);
            panner.connect(audioCtx.destination);

            return { viewer, panner, audioCtx, audioElement, track, listener };
        },
        setMarker(viewer, latitude, longitude, id) {
            viewer.activateComponent("marker");
            let markerComponent = viewer.getComponent("marker");
            
            markerComponent.add([
                new SimpleMarker(id, { lat: latitude, lng: longitude })
            ]);
        },
        
        //  Haversine formula to calculate the distance between two points
        distance(lat1, lon1, lat2, lon2) {
            const p = Math.PI / 180
            const a = 0.5 - Math.cos((lat2 - lat1) * p) / 2 + 
                    Math.cos(lat1 * p) * Math.cos(lat2 * p) * 
                    (1 - Math.cos((lon2 - lon1) * p)) / 2;
          
            return 12742 * Math.asin(Math.sqrt(a)); // 2 * R; R = 6371 km
        },
        
        
        //AUDIO
        
        //  Function to create a new audiocontext, panner and listener for the audio and select audio source. 
        //  The panner controls the audio position (only updated once) and the listener tells the panner about the users location so it can 
        //  modulate the signal accordingly.
        
        
        //  Sets the listener position. geoDeticToEnu converts latitude and longitude to x-y-z coordinates in a local topocentric plane 
        //  using a reference latitude and longitude.
        setListenerPos(listener, audioCtx, latitude, longitude) {
            const pos = geodeticToEnu(longitude, latitude, 0, exports.consts.refLng, exports.consts.refLat, 0);
            listener.positionX.setValueAtTime(pos[0], audioCtx.currentTime);
            listener.positionY.setValueAtTime(pos[1], audioCtx.currentTime);
            listener.positionZ.setValueAtTime(0, audioCtx.currentTime);  
        },
        // Sets listener point of view using the bearing (relative compass angle to north).
        setListenerPov(listener, audioCtx, viewer, bearing) {
            const x = listener.positionX.value + Math.sin(bearing);
            const y = listener.positionY.value + Math.cos(bearing);
            console.log(x);
            console.log(y);
             
            listener.forwardX.setValueAtTime(x, audioCtx.currentTime);
            listener.forwardY.setValueAtTime(y, audioCtx.currentTime);
            listener.forwardZ.setValueAtTime(0, audioCtx.currentTime);
            listener.upX.setValueAtTime(0, audioCtx.currentTime);
            listener.upY.setValueAtTime(0, audioCtx.currentTime);
            listener.upZ.setValueAtTime(0, audioCtx.currentTime);
            
            const coords = enuToGeodetic(x, y, 0, exports.consts.refLng, exports.consts.refLat, 0);
            
            let markerComponent = viewer.getComponent("marker");
            markerComponent.add([
                new SimpleMarker("bearing", {lat: coords[1], lng: coords[0]})
            ]);
            //filter.frequency.value = event.bearing * (hipass_freq/360)          
        },
        setPannerPos(panner, audioCtx, longitude, latitude) {
            const pos = geodeticToEnu(longitude, latitude, 0, exports.consts.refLng, exports.consts.refLat, 0);
            panner.positionX.setValueAtTime(pos[0], audioCtx.currentTime);
            panner.positionY.setValueAtTime(pos[1], audioCtx.currentTime);
            panner.positionZ.setValueAtTime(0, audioCtx.currentTime);
        }
    }
};


//MAPILLARY

window.exports = exports;
