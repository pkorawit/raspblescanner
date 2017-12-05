var Bleacon = require('bleacon');
var addressToTrack = 'fda50693a4e24fb1afcf000000000917';
var netpie = require('./netpie.js');
var microgear = require('./netpie.js').microgear;
var KalmanFilter = require('kalmanjs').default;
var kalmanFilterR = new KalmanFilter({R: 0.01, Q: 3});
var kalmanFilterA = new KalmanFilter({R: 0.01, Q: 3});
var kalmanFilterD = new KalmanFilter({R: 0.01, Q: 3});

Bleacon.on('discover', function (bleacon) {
    var rssiOptimized = kalmanFilterR.filter(bleacon.rssi).toFixed(2);
    var accuracyOptimized = kalmanFilterA.filter(bleacon.accuracy).toFixed(2);
    var distanceRaw = calculateDistance(rssiOptimized,-64).toFixed(2);
    var distanceOptimized = kalmanFilterD.filter(calculateDistance(rssiOptimized,-64)).toFixed(2);
    console.log('found device: ',
        bleacon.uuid, ' ',
        bleacon.measuredPower, ' ',
        bleacon.rssi, ' ',
        rssiOptimized, ' ',
        accuracyOptimized, ' ',
        bleacon.proximity);

        microgear.publish('/device/info', bleacon.uuid + ',' + distanceOptimized);
        microgear.publish('/rssi/raw', bleacon.rssi.toString());
        microgear.publish('/rssi/optimized', rssiOptimized.toString());
        microgear.publish('/distance/optimized', distanceOptimized.toString());
        microgear.publish('/distance/raw', distanceRaw.toString());
        microgear.publish('/distance/proximity', bleacon.proximity);
});

microgear.on('connected', function() {
    console.log('Connected...');
    microgear.setAlias("raspberry-pi");
    Bleacon.startScanning(addressToTrack);
});

microgear.on("closed", function() {
    console.log("closed");
    Bleacon.stopScanning();
});

function calculateDistance(rssi, txPower) {

    if (rssi == 0) {
        return -1.0;
    }

    var ratio = rssi * 1 / txPower;
    if (ratio < 1.0) {
        return Math.pow(ratio, 10);
    }
    else {
        var distance = (0.89976) * Math.pow(ratio, 7.7095) + 0.111;
        return distance;
    }
} 