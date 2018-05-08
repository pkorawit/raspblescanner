var noble = require('noble');

var addressToTrack = '3d4e982e7871458692371e8aedf3b7da';

noble.on('stateChange', function (state) {
    if (state === 'poweredOn')
        noble.startScanning([], true)
    else
        noble.stopScanning();
});

noble.on('discover', function (peripheral) {
    if (peripheral.uuid == addressToTrack) {
        var macAddress = peripheral.uuid;
        var rss = peripheral.rssi;
        var txPower = peripheral.advertisement.txPowerLevel;
        var localName = peripheral.advertisement.localName;
        var distance = calculateDistance(rss);    
        var serviceData =  peripheral.advertisement.serviceData;
        console.log('found device: ', macAddress, ' ', localName, ' ', rss, ' ', distance, ' ', txPower, ' ', serviceData); 
        if(serviceData.length > 0){   
            console.log('  Service Data      = ' + (serviceData[0].data.readUInt16LE(1) / 100) / 2);
        }
          
    }
});

function calculateDistance(rssi) {
    
    var txPower = -86 //hard coded power value. Usually ranges between -59 to -65
    
    if (rssi == 0) {
      return -1.0; 
    }
  
    var ratio = rssi*1.0/txPower;
    if (ratio < 1.0) {
      return Math.pow(ratio,10);
    }
    else {
      var distance =  (0.89976)*Math.pow(ratio,7.7095) + 0.111;    
      return distance;
    }
  } 