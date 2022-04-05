

const { Viewer, SimpleMarker, geodeticToEnu, enuToGeodetic } = mapillary;

const exports = {
    consts: {
        refLat: 55.680763888889,
        refLng: 12.560666666667,

        // These variables define our destination coordinates
        targetLat: 55.678210776097494, 
        targetLng: 12.556136444185778,

        //targetLng: 12.554218, 
        //targetLat: 55.681619,
        
    },
    funcs: {
        initialize() {
            // Initialize viewer
            // Parameters for the Mapillary Viewer constructor 
            let viewer = new Viewer({
                accessToken: 'MLY|5055210414499610|cc32fb072365a29201fee81cf2d9e241',
                container: 'mly', // the ID of our container defined in the HTML body
                //imageId: '2921734351448761', //starting point
                imageId: '1552132681648763', //starting point 2
                //imageId: '2556983327944830',
                //imageId: '756160608403786'
                //imageId: '132246192214397',
                component: { marker: true, cover: false },
                transitionMode: 1
            });
        
            viewer.setFilter(["==", "cameraType", 'spherical'], ["==", "creatorId", "gisfrb"]);

            // Initialize Audio
            const audioCtx = new AudioContext();
            const audioElement = document.getElementById('music');
            const successElement = document.getElementById('success');
            const successTrack = audioCtx.createMediaElementSource(successElement);
            const track = audioCtx.createMediaElementSource(audioElement);
            let resonanceAudio = new ResonanceAudio(audioCtx);
            let source = resonanceAudio.createSource({
            });
            track.connect(source.input);
            resonanceAudio.output.connect(audioCtx.destination);
            

            //Filter
            const filter = audioCtx.createBiquadFilter();
            filter.type = "lowshelf"
            const hipass_freq = 20000;
            filter.frequency.value = hipass_freq;
            filter.gain.value = -2.5;

            //Gain
            const gain = audioCtx.createGain();
            
            //Panner
            const stereoPanner = audioCtx.createStereoPanner();


            successTrack.connect(audioCtx.destination);

            return {viewer, audioCtx, audioElement, successElement, resonanceAudio, source};
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
        setListenerPos(resonanceAudio, longitude, latitude) {
            const pos = geodeticToEnu(longitude, latitude, 0, exports.consts.refLng, exports.consts.refLat, 0);
            resonanceAudio.setListenerPosition(pos[0], pos[1], 0)  
        },
        // Sets listener point of view using dirCoords
        setListenerPov(resonanceAudio, coords) {

            resonanceAudio.setListenerOrientation(coords.x, coords.y, 0, 0, 0, 1)
        },
        setSourcePos(source, targ){
            const pos = geodeticToEnu(
                targ.lng, targ.lat, 0,
                exports.consts.refLng, exports.consts.refLat, 0
            );
            source.setPosition(pos[0], pos[1], 0)
            source.setOrientation(1,0,0,0,0,1)
        },



        setFilterCutoff(filter, audioCtx, angle){
            let s = (800 - 20000) / (180 - 90)
            let input = Math.abs(angle)
            if (input > 90){
                let output = 20000 + s * (input-90)
                filter.frequency.setValueAtTime(output, audioCtx.currentTime)
            }

        },

        setGain(gain, audioCtx, angle){
            let s = -0.8/90
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
            const lpos = geodeticToEnu(listener.lng, listener.lat, 0, exports.consts.refLng, exports.consts.refLat, 0)
            
            const pCoords = { x: pos[0], y: pos[1] };
            const lCoords = { x: lpos[0], y: lpos[1] };
            const dirCoords = { 
                x: lCoords.x + Math.cos(bearing),
                y: lCoords.y + Math.sin(bearing)
            };

            return dirCoords
        },

        calcAngle2(listener, bearing, targ) {
            const pos = geodeticToEnu(
                targ.lng, targ.lat, 0,
                exports.consts.refLng, exports.consts.refLat, 0
            );
            const lpos = geodeticToEnu(listener.lng, listener.lat, 0, exports.consts.refLng, exports.consts.refLat, 0)

            const pCoords = { x: pos[0], y: pos[1] };
            const lCoords = { x: lpos[0], y: lpos[1] };
            const dirCoords = { 
                x: lCoords.x + Math.cos(bearing),
                y: lCoords.y + Math.sin(bearing)
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
              profile: "cycling-regular",
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
            const lpos = geodeticToEnu(listener.lng, listener.lat, 0, exports.consts.refLng, exports.consts.refLat, 0)

            
            const pCoords = { x: pos[0], y: pos[1] };
            const lCoords = { x: lpos[0], y: lpos[1] };
            const lp = { x: pCoords.x - lCoords.x, y: pCoords.y - lCoords.y };
            const lp_ = Math.sqrt((lp.x*lp.x+lp.y*lp.y));
            return lp_;

        }
    }
};



window.exports = exports;
