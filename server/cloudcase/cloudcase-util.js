// key  = appid + secret
// the way to do it is pass the key
// pass the appid 
// combine the appid and secret( stored on the server )
// encrypt appid and secret
// compare the key to the encrypted appid and secret


//admin rule 
/*
 * 1. Admin pages should always be on the same domain to administer mongodb
 * 2. Admin should login using the admin pages hosted by the domain.
 * 3. 
 * 
 */

var crypto = require('crypto');

function generate_key () {
	var type = process.argv[2];
	
	if( type == "password" ) {
		var password = process.argv[3];
		return crypto.createHash('md5').update(  password ).digest("hex");
	} 
	
	var app_id = process.argv[3];
	var secret = process.argv[4];
	var key = "";
	if( app_id != null && secret != null ) {
		key = crypto.createHash('md5').update(  app_id + "_" + secret ).digest("hex");
	}
	return key;
};

var type = process.argv[2];
if( type ==  "password") {
	console.log("password: " + generate_key() )	
} else if( type == "key" ) {
	console.log("key: " + generate_key() );
} else {
	console.log("--")
}

