// TODO: Buy Sublime Text ($70)

var ge;
    
google.load("earth", "1");

$(init);

function init() {
  google.earth.createInstance("map3d", initCallback, failureCallback);

  setTimeout(function() {
    $("#map3d a").hide();
  }, 2000);

  //addSampleButton("Move the camera!", buttonClick);
}

function initCallback(instance) {
  ge = instance;
  ge.getWindow().setVisibility(true);

  // Hide navigation control
  ge.getNavigationControl().setVisibility(ge.VISIBILITY_HIDE);
  ge.getOptions().setFlyToSpeed(ge.SPEED_TELEPORT);

  // add some layers
  setMode({
    borders: false,
    roads: false
  });
  

  ge.getOptions().setStatusBarVisibility(ge.VISIBILITY_HIDE); 
  ge.getOptions().setFadeInOutEnabled(false);

  setCamera({
    latitude: 36,
    longitude: -121,
    altitude: 10000,
    heading: 0,
    tilt: 80,
    roll: 0
  });

  setInterval(function() {
    var pos = getPosition(ge.getView().copyAsCamera(ge.ALTITUDE_ABSOLUTE));

    $("#coordinates").text(JSON.stringify(pos));
  }, 1000);

  // just for debugging purposes
  document.getElementById('installed-plugin-version').innerHTML =
    ge.getPluginVersion().toString();

  doTest();
}

function doTest() {
  var pos1 = {"latitude":32.27145100709465,"longitude":-116.81154265232085,"altitude":5000,"tilt":72.31765881492275,"roll":4.734831323755789e-9,"heading":-37.032850334257};
  var pos2 = {"latitude":37.8493851451606,"longitude":-122.49411333581865,"altitude":1000,"tilt":72.75207589370922,"roll":-3.8413149165375626e-10,"heading":-40.19198711522715}
  var path = getStraightPath(pos1, pos2, 10000000);

  var i = 0;
  var interval = setInterval(function() {
    setCamera(path[i++]);
    if (i >= path.length) {
      clearInterval(interval);
    }
  }, 75);
}

function failureCallback(errorCode) {
}

function setCamera(position) {
  // Create a new LookAt.
  var camera = ge.createCamera("");
  camera.set(position.latitude, position.longitude, position.altitude, ge.ALTITUDE_ABSOLUTE, position.heading, position.tilt, position.roll)

  // Set the position values.
//  camera.setLatitude(position.latitude);
//  camera.setLongitude(position.longitude);
//  camera.setAltitude(position.altitude);

//  camera.setTilt(position.tilt);
//  camera.setRoll(position.roll);

  // Update the view in Google Earth.
  ge.getView().setAbstractView(camera);
}

function makeMovieSegment(frames) {
  for (var i = 0; i < frames.length; ++i) {
    var frameResult = makeMovieFrame(frames[i]);
  }
}

function makeMovieFrame(frame) {
  setCamera(frame.position);
  //for (var i = 0; i < frame.modes.length; ++i) {
  //  setMode(frame.modes[i]);    
  //}
}

function getPosition(camera) {
  return {
    latitude: camera.getLatitude(),
    longitude: camera.getLongitude(),
    altitude: camera.getAltitude(),
    tilt: camera.getTilt(),
    roll: camera.getRoll(),
    heading: camera.getHeading()
  };
}

function setMode(mode) {
  ge.getLayerRoot().enableLayerById(ge.LAYER_BORDERS, mode.borders);
  ge.getLayerRoot().enableLayerById(ge.LAYER_ROADS, mode.roads);
  ge.getLayerRoot().enableLayerById(ge.LAYER_TERRAIN, true);
  ge.getLayerRoot().enableLayerById(ge.LAYER_TREES, true);
  ge.getLayerRoot().enableLayerById(ge.LAYER_BUILDINGS, true);
}
