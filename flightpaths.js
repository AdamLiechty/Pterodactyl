var EARTH_RADIUS = 6371; // km
var FRAMES_PER_SECOND = 60;
var TO_DEGREES = 180 / Math.PI;
var FROM_DEGREES = Math.PI / 180;

function getStraightPath(startPos, stopPos, speed /* km/hour */) {
	startPos = radiansPosition(startPos);
	stopPos = radiansPosition(stopPos);

	var d = greatCircleDistance(
		startPos.latitude,
		startPos.longitude,
		stopPos.latitude,
		stopPos.longitude);
	var dKilometers = EARTH_RADIUS * d;
	var tHours = dKilometers / speed;
	var tSeconds = tHours * 3600;
	var frames = tSeconds * FRAMES_PER_SECOND;

	var altDiff = stopPos.altitude - startPos.altitude;
	var tiltDiff = stopPos.tilt - startPos.tilt;
	var rollDiff = stopPos.roll - startPos.roll;
	var heading

	var positions = [];
	var lastPosition = null;
	for (var i = 0; i < frames; ++i) {
		var f = i / frames;
		var position = intermediatePointOnGreatCircle(
			startPos.latitude,
			startPos.longitude,
			stopPos.latitude,
			stopPos.longitude,
			f,
			d);

		position.altitude = startPos.altitude + f*altDiff;
		position.tilt = startPos.tilt + f*tiltDiff;
		position.roll = startPos.roll + f*rollDiff;

		if (lastPosition) {
			lastPosition.heading = getHeading(lastPosition, position);
		}

		positions.push(position);
		lastPosition = position;
	}

	if (positions.length >= 2) {
		// Set heading of last position to the same as second-to-last.
		positions[positions.length - 1].heading = positions[positions.length - 2].heading;
	}

	return $.map(positions, degreesPosition);
}

function getHeading(startPos, stopPos) {
//	   tc1=mod(atan2(sin(lon1-lon2)*cos(lat2),
//           cos(lat1)*sin(lat2)-sin(lat1)*cos(lat2)*cos(lon1-lon2)), 2*pi)

	// var cosStopLat = Math.cos(stopPos.latitude);
	// return Math.atan2(
	// 		Math.sin(startPos.longitude - stopPos.longitude) * cosStopLat,
	// 		Math.cos(startPos.latitude)*Math.sin(stopPos.latitude) - Math.sin(startPos.latitude)*cosStopLat*Math.cos(startPos.longitude-stopPos.longitude)
	// 	) - Math.PI / 2;

	var dLon = stopPos.longitude - startPos.longitude;
	var cosStopLat = Math.cos(stopPos.latitude);
    var tmp0 = Math.sin(dLon) * cosStopLat;
    var tmp1 = Math.cos(startPos.latitude) * Math.sin(stopPos.latitude) - Math.sin(startPos.latitude) * cosStopLat * Math.cos(dLon);
    var tmp = Math.atan2(tmp0, tmp1);
    var tc1 = tmp % (2 * Math.PI);
    var heading = tc1;// + Math.PI / 2; 
    return heading;
}

//------------------------------------------------------------------------------
// TODO: Donate here after I make millions.
// From  http://williams.best.vwh.net/avform.htm

// Distance between points

// The great circle distance d between two points with coordinates {lat1,lon1} and {lat2,lon2} is given by:

// d=acos(sin(lat1)*sin(lat2)+cos(lat1)*cos(lat2)*cos(lon1-lon2))
// A mathematically equivalent formula, which is less subject to rounding error for short distances is:

// d=2*asin(sqrt((sin((lat1-lat2)/2))^2 + 
//                  cos(lat1)*cos(lat2)*(sin((lon1-lon2)/2))^2))

function greatCircleDistance(lat1, lon1, lat2, lon2) {
	return 2 *
		Math.asin(
			Math.sqrt(
				square(Math.sin((lat1-lat2) / 2)) + 
                Math.cos(lat1) * Math.cos(lat2) * square(Math.sin((lon1-lon2) / 2))
                )
			);
}

// Intermediate points on a great circle

// In previous sections we have found intermediate points on a great circle
// given either the crossing latitude or longitude. Here we find points
// (lat,lon) a given fraction of the distance (d) between them. Suppose the
// starting point is (lat1,lon1) and the final point (lat2,lon2) and we want the
// point a fraction f along the great circle route. f=0 is point 1. f=1 is point
// 2. The two points cannot be antipodal ( i.e. lat1+lat2=0 and
// abs(lon1-lon2)=pi) because then the route is undefined. The intermediate
// latitude and longitude is then given by:

//        A=sin((1-f)*d)/sin(d)
//        B=sin(f*d)/sin(d)
//        x = A*cos(lat1)*cos(lon1) +  B*cos(lat2)*cos(lon2)
//        y = A*cos(lat1)*sin(lon1) +  B*cos(lat2)*sin(lon2)
//        z = A*sin(lat1)           +  B*sin(lat2)
//        lat=atan2(z,sqrt(x^2+y^2))
//        lon=atan2(y,x)

function intermediatePointOnGreatCircle(lat1, lon1, lat2, lon2, f, d) {
	var cosLat1 = Math.cos(lat1);
	var cosLat2 = Math.cos(lat2);
    var A = Math.sin((1-f)* d) / Math.sin(d);
    var B = Math.sin(f*d) / Math.sin(d);
    var x = A*cosLat1*Math.cos(lon1) + B*cosLat2*Math.cos(lon2);
    var y = A*cosLat1*Math.sin(lon1) + B*cosLat2*Math.sin(lon2);
    var z = A*Math.sin(lat1)         + B*Math.sin(lat2);
    var lat = Math.atan2(z,Math.sqrt(square(x)+square(y)));
    var lon = Math.atan2(y,x);
    return { latitude: lat, longitude: lon };
}

function radiansPosition(degreesPosition) {
	return {
		latitude: degreesPosition.latitude * FROM_DEGREES,
		longitude: degreesPosition.longitude * FROM_DEGREES,
		altitude: degreesPosition.altitude,
		tilt: degreesPosition.tilt * FROM_DEGREES,
		roll: degreesPosition.roll * FROM_DEGREES,
		heading: degreesPosition.heading * FROM_DEGREES,
	}
}

function degreesPosition(radiansPosition) {
	return {
		latitude: radiansPosition.latitude * TO_DEGREES,
		longitude: radiansPosition.longitude * TO_DEGREES,
		altitude: radiansPosition.altitude,
		tilt: radiansPosition.tilt * TO_DEGREES,
		roll: radiansPosition.roll * TO_DEGREES,
		heading: radiansPosition.heading * TO_DEGREES,
	}
}

function square(a) {
	return a * a;
}
