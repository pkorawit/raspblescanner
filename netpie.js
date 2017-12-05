var MicroGear = require('microgear');

const APPID  = "AssetTracking";
const KEY    = "dCtiV8Nafk0LNEW";
const SECRET = "2BSbP3BS1NixLyFuszkxWWric";

var microgear = MicroGear.create({
    key : KEY,
    secret : SECRET
});



microgear.on('message', function(topic,body) {
    console.log('incoming : '+topic+' : '+body);
});

microgear.on('closed', function() {
    console.log('Closed...');
});

microgear.connect(APPID);

module.exports = {
    microgear : microgear 
}