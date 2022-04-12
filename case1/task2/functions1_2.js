

const { Viewer, SimpleMarker, geodeticToEnu, enuToGeodetic } = mapillary;

const exports = {
    consts: {
        refLat: 55.680763888889,
        refLng: 12.560666666667,

        // These variables define our destination coordinates
        //targetLat: 55.678210776097494, //A->B
        //targetLng: 12.556136444185778, //A->B

        targetLat: 55.68171833505691,  //C->D
        targetLng: 12.551868533141779, //C->D
        
    },
    funcs: {
        initialize() {
            // Initialize viewer
            // Parameters for the Mapillary Viewer constructor 
            let viewer = new Viewer({
                accessToken: 'MLY|5055210414499610|cc32fb072365a29201fee81cf2d9e241',
                container: 'mly', // the ID of our container defined in the HTML body

                //imageId: '1552132681648763', //starting point A->B
                //imageId: '844024269842239',//starting point A->B, short

                imageId: '973113553478933', //starting point C->D
                component: { marker: true, cover: false },
                transitionMode: 1
            });
        
            viewer.setFilter(["==", "cameraType", 'spherical'], ["==", "creatorId", "gisfrb"]);

            // Initialize Audio
            const audioCtx = new AudioContext();
            const audioElement = document.getElementById('music');
            const vocalElement = document.getElementById('vocals');
            const successElement = document.getElementById('success');

            const track = audioCtx.createMediaElementSource(audioElement);
            const vocalTrack = audioCtx.createMediaElementSource(vocalElement);
            const successTrack = audioCtx.createMediaElementSource(successElement);
            const listener = audioCtx.listener;

            const panner = audioCtx.createPanner();
            panner.panningModel = 'HRTF';
            panner.distanceModel = 'linear';
            panner.refDistance = 1;
            panner.maxDistance = 10000;
            panner.rolloffFactor = 10;
            panner.coneInnerAngle = 0;
            panner.coneOuterAngle = 360;
            panner.coneOuterGain = 0;

            //Filter
            const filter = audioCtx.createBiquadFilter();
            filter.type = "highshelf"
            const hipass_freq = 20000;
            filter.frequency.value = hipass_freq;
            filter.gain.value = -5;

            //Gain
            const gain = audioCtx.createGain();
            const gain_inst = audioCtx.createGain();
            gain_inst.gain.value = 0.9;
            //Panner
            const stereoPanner = audioCtx.createStereoPanner();
        
            vocalTrack.connect(stereoPanner);
            stereoPanner.connect(filter);
            filter.connect(gain);
            gain.connect(audioCtx.destination);

            successTrack.connect(audioCtx.destination);
            track.connect(gain_inst);
            gain_inst.connect(audioCtx.destination);
            return { viewer, panner, stereoPanner, filter, gain, audioCtx, audioElement, vocalElement, successElement, listener };
        },
        setMarker(viewer, latitude, longitude, id) {
            viewer.activateComponent("marker");
            let markerComponent = viewer.getComponent("marker");
            
            markerComponent.add([
                new SimpleMarker(id, { lat: latitude, lng: longitude })
            ]);
        },
        

        
        //AUDIO
        
        //  Function to create a new audiocontext, panner and listener for the audio and select audio source. 
        //  The panner controls the audio position (only updated once) and the listener tells the panner about the users location so it can 
        //  modulate the signal accordingly.
        
        
        //  Sets the listener position. geoDeticToEnu converts latitude and longitude to x-y-z coordinates in a local topocentric plane 
        //  using a reference latitude and longitude.
        setListenerPos(listener, audioCtx, longitude, latitude) {
            const pos = geodeticToEnu(longitude, latitude, 0, exports.consts.refLng, exports.consts.refLat, 0);
            listener.positionX.setValueAtTime(pos[0], audioCtx.currentTime);
            listener.positionY.setValueAtTime(pos[1], audioCtx.currentTime);
            listener.positionZ.setValueAtTime(0, audioCtx.currentTime);  
        },
        // Sets listener point of view using the bearing (relative compass angle to north).
        setListenerPov(listener, audioCtx, viewer, bearing) {
            const x = listener.positionX.value + Math.sin(bearing);
            const y = listener.positionY.value + Math.cos(bearing);

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
        setPannerPos(panner, audioCtx, dirCoords) {
            panner.positionX.setValueAtTime(dirCoords.x, audioCtx.currentTime);
            panner.positionY.setValueAtTime(dirCoords.y, audioCtx.currentTime);
            panner.positionZ.setValueAtTime(0, audioCtx.currentTime);
        },

        setStereoPannerPos(stereoPanner, audioCtx, angle){
            //angle = Math.min(135,Math.max(-135,angle))
            angle = Math.sin(angle*(Math.PI/180))
            //angle = (angle > 0) ? sin(angle+)
            //stereoPanner.pan.setValueAtTime((angle/-135), audioCtx.currentTime);
            stereoPanner.pan.setValueAtTime((angle), audioCtx.currentTime);

        
        },

        setStereoPannerPos2(stereoPanner, audioCtx, angle){
            let val;
            if ((150 <= angle && angle < 180) || (-150 >= angle && angle > -180)){
                val = -Math.sin(2*angle*Math.PI/180);
            }
            else{
                val = Math.sin(angle*Math.PI/180);
           }
            //console.log(val)
            stereoPanner.pan.setValueAtTime(val, audioCtx.currentTime);

        
        },

        setFilterCutoff(filter, audioCtx, angle){
            let s = (800 - 20000) / (180 - 90)
            let input = Math.abs(angle)
            if (input > 90){
                let output = 20000 + s * (input-90)
                filter.frequency.setValueAtTime(output, audioCtx.currentTime)
                console.log(`Filter frequency: ${output}`);
            }

        },

        setGain(gain, audioCtx, angle){
            let s = -0.8/90
            //let s = (0.2-0.5)/90
            let input = Math.abs(angle)
            if (input >90){
                let output = 1 + s *(input-90)
                gain.gain.setValueAtTime(output, audioCtx.currentTime)
            }

        },

        calcdirCoords(listener, bearing, targ) {
            const pos = geodeticToEnu(
                targ.lng, targ.lat, 0,
                exports.consts.refLng, exports.consts.refLat, 0
            );
            
            const pCoords = { x: pos[0], y: pos[1] };
            const lCoords = { x: listener.positionX.value, y: listener.positionY.value };
            const dirCoords = { 
                x: listener.positionX.value + Math.sin(bearing),
                y: listener.positionY.value + Math.cos(bearing)
            };

            const ab = { x: lCoords.x - pCoords.x, y: lCoords.y - pCoords.y };
            const cb = { x: lCoords.x - dirCoords.x, y: lCoords.y - dirCoords.y };

            const dot = ab.x * cb.x + ab.y * cb.y;   // dot product
            const cross = ab.x * cb.y - ab.y * cb.x; // cross product
            const alpha = Math.atan2(cross, dot);
            
            return dirCoords
        },

        calcAngle2(listener, bearing, targ) {
            const pos = geodeticToEnu(
                targ.lng, targ.lat, 0,
                exports.consts.refLng, exports.consts.refLat, 0
            );
            
            const pCoords = { x: pos[0], y: pos[1] };
            const lCoords = { x: listener.positionX.value, y: listener.positionY.value };
            const dirCoords = { 
                x: listener.positionX.value + Math.sin(bearing),
                y: listener.positionY.value + Math.cos(bearing)
            };

            const lp = { x: pCoords.x - lCoords.x, y: pCoords.y - lCoords.y };
            const ld = { x: dirCoords.x - lCoords.x, y: dirCoords.y - lCoords.y };
            const lp_ = Math.sqrt((lp.x*lp.x+lp.y*lp.y));
            const ld_ = Math.sqrt((ld.x*ld.x+ld.y*ld.y));
            const det = lp.x * ld.y - lp.y * ld.x;
            const dot = lp.x*ld.x+lp.y*ld.y;
            //const cos_alpha = (lp.x*ld.x+lp.y*ld.y)/(lp_*ld_)
            let alpha = Math.atan2(det, dot);
            alpha = alpha * (180.0/Math.PI);
            //console.log(alpha)
            return alpha;
        },

        //ROUTING

        getRoute(startLng, startLat, endLng, endLat){

            let orsDirections = new Openrouteservice.Directions({ api_key: "5b3ce3597851110001cf6248733a96d9c13a4d91994d48edeb3bf8aa"});
          
            return orsDirections.calculate({
              coordinates: [[startLng, startLat], [endLng, endLat]],
              profile: "foot-walking",
              //extra_info: ["waytype", "steepness"],
              format: "geojson",
              preference: "recommended",
              api_version: "v2",
              geometry_simplify: false
            })
            .then(function(json) {
                return new Promise((resolve, reject) => {
                resolve((json.features[0].geometry.coordinates));
                })
              })
            .catch(function(err) {
              console.error(err);
            })
          
          },

        getNextCheckPoint(position, checkpoints, current){
            let distances = []
            for (let i = current; i < checkpoints.length; i++) {
                let d = E.funcs.distance(checkpoints[i].lng, checkpoints[i].lat, position.lng, position.lat);
                distances.push(d);
            }
            next = Math.min(distances)
            console.log(next)
            return next;
        },

        distance(lon1, lat1, lon2, lat2) {
            const p = Math.PI / 180
            const a = 0.5 - Math.cos((lat2 - lat1) * p) / 2 + 
                    Math.cos(lat1 * p) * Math.cos(lat2 * p) * 
                    (1 - Math.cos((lon2 - lon1) * p)) / 2;
        
            return 12742 * Math.asin(Math.sqrt(a)); // 2 * R; R = 6371 km
        },
        dist(listener, targ){
            const pos = geodeticToEnu(
                targ.lng, targ.lat, 0,
                exports.consts.refLng, exports.consts.refLat, 0
            );
            
            const pCoords = { x: pos[0], y: pos[1] };
            const lCoords = { x: listener.positionX.value, y: listener.positionY.value };
            const lp = { x: pCoords.x - lCoords.x, y: pCoords.y - lCoords.y };
            const lp_ = Math.sqrt((lp.x*lp.x+lp.y*lp.y));
            return lp_;

        }
    }
};



window.exports = exports;
