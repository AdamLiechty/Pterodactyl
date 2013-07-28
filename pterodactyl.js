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

  var framesUri = getParameterByName("framesUri");
  $.get(framesUri)
  .done(function(frames) {
    doFrames(JSON.parse(frames));
  });

  // setCamera({
  //   latitude: 36,
  //   longitude: -121,
  //   altitude: 10000,
  //   heading: 0,
  //   tilt: 80,
  //   roll: 0
  // });

  // setInterval(function() {
  //   var pos = getPosition(ge.getView().copyAsCamera(ge.ALTITUDE_ABSOLUTE));

  //   $("#coordinates").text(JSON.stringify(pos));
  // }, 1000);

  // // just for debugging purposes
  // document.getElementById('installed-plugin-version').innerHTML =
  //   ge.getPluginVersion().toString();

  // doTest();
}

function doFrames(frames) {
  var frameIndex = -1;

  var timer = null;
  var pausing = false;
  setTimeout(function() {
    google.earth.addEventListener(ge, "frameend", function() {
      // Make sure updates are all settled.
      timer && clearTimeout(timer);
      if (!pausing) {
        timer = setTimeout(function() {
          pausing = true;
          $("body").css("background-color", colorSignal(frameIndex)) // Signal ready
          setTimeout(incrementAndSetCamera, 500); // Give time for the snapshot before moving to next frame.
          timer = null;
        }, 200);
      }
    });
  }, 9000);

  function incrementAndSetCamera() {
    if (frameIndex < frames.length) {
      $("body").css("background-color", "#ffffff"); // Signal not ready
      ++frameIndex;
      pausing = false;
      setCamera(frames[frameIndex]);
    }
    else {
      $("body").css("background-color", colorSignal(-2)); // Signal DONE.
    }
  }

  // GO!
  setTimeout(incrementAndSetCamera, 10000);

  function colorSignal(frameIndex) {
    if (frameIndex < 0) return "#ffffff";

    var hex = (frameIndex + 1).toString(16);
    while (hex.length < 6) hex = "0" + hex;
    return "#" + hex;
  }
}

// function doTest() {
//   var pos1 = {"latitude":32.27145100709465,"longitude":-116.81154265232085,"altitude":5000,"tilt":72.31765881492275,"roll":4.734831323755789e-9,"heading":-37.032850334257};
//   var pos2 = {"latitude":37.8493851451606,"longitude":-122.49411333581865,"altitude":1000,"tilt":72.75207589370922,"roll":-3.8413149165375626e-10,"heading":-40.19198711522715}
//   var path = getStraightPath(pos1, pos2, 100000);

//   var i = 0;
//   var interval = setInterval(function() {
//     setCamera(path[i++]);
//     if (i >= path.length) {
//       clearInterval(interval);
//     }
//   }, 75);
// }

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

function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}
