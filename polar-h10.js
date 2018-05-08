var noble = require('noble');
var HRVAnalysis = require('hrv-time-domain-analysis');

var hrv = new HRVAnalysis({
    windowSize: 60, // size of moving analysis timeframe in seconds
    rrTimeFormat: 'ms', // time format of rr intervals: 's' (seconds) or 'ms' (milliseconds)
    rmssdLog: true, // apply natural logarithm to rmssd 
    rmssdFactor: 20 // multiply rmssd value by this factor
});

hrv.on('data', ({ rmssd, sdnn, pnn50 }) => {
    console.log('HRV(rmssd) :' + rmssd);
    console.log('HRV(sdnn) :' + sdnn);
    console.log('HRV(pnn50) :' + pnn50);
})


noble.on('stateChange', function(state) {
  if (state === 'poweredOn') {
    // Seek for peripherals broadcasting the heart rate service
    // This will pick up a Polar H7 and should pick up other ble heart rate bands
    // Will use whichever the first one discovered is if more than one are in range
    noble.startScanning(["180d"]);
    console.log('Scanning...');
  } else {
    noble.stopScanning();
  }
});

noble.on('discover', function(peripheral) {
  // Once peripheral is discovered, stop scanning
  console.log('Found!');
  console.log(peripheral.advertisement.localName);
  noble.stopScanning();

  // connect to the heart rate sensor
  peripheral.connect(function(error){
    // 180d is the bluetooth service for heart rate:
    // https://developer.bluetooth.org/gatt/services/Pages/ServiceViewer.aspx?u=org.bluetooth.service.heart_rate.xml
    var serviceUUID = ["180d"];
    // 2a37 is the characteristic for heart rate measurement
    // https://developer.bluetooth.org/gatt/characteristics/Pages/CharacteristicViewer.aspx?u=org.bluetooth.characteristic.heart_rate_measurement.xml
    var characteristicUUID = ["2a37"];

    // use noble's discoverSomeServicesAndCharacteristics
    // scoped to the heart rate service and measurement characteristic
    peripheral.discoverSomeServicesAndCharacteristics(serviceUUID, characteristicUUID, function(error, services, characteristics){
      characteristics[0].notify(true, function(error){
        characteristics[0].on('data', function(data, isNotification){
          // Upon receiving data, output the BPM
          // The actual BPM data is stored in the 2nd bit in data (at array index 1)
          // Thanks Steve Daniel: http://www.raywenderlich.com/52080/introduction-core-bluetooth-building-heart-rate-monitor
          // Measurement docs here: https://developer.bluetooth.org/gatt/characteristics/Pages/CharacteristicViewer.aspx?u=org.bluetooth.characteristic.heart_rate_measurement.xml                    
          //console.log('data = ' + JSON.stringify(data));   
          if(data[1]){            
            console.log('HR = ' + data.readUInt8(1));    
            console.log('HR = ' + data[1]);           
          }       
          if(data[4]){
            var rrs = [];
            var d = new Date();
            var m = d.getMinutes(); // =>  30
            var s = d.getSeconds(); // => 51
            var rr = (data.readUInt16LE(4)/1024)*1000;
            rrs.push(rr);
            hrv.addRRs(rrs)        
            console.log('R-R Interval ' + m + ':' + s + ' = ' + rr.toFixed(2));            
          }          
        });
      });
    });
  });
});