var fs = require("fs");
var ErrorStacks =  require("./../cloudcase/ErrorStacks");
var crypto = require('crypto');

var util = require("./../cloudcase/CloudcaseUtil");


 
 
function AppAuthenticate() {
	
};
 

AppAuthenticate.prototype.attach_settings = function ( req, res, next ) {
	console.log("AppAuthenticate.attach_settings");
 	function read_callback( err, settingsContent ) {
		var _settings ;
		try {
			eval( "_settings = " + settingsContent + ";");	
		}  catch( err ) {
			console.log("Cloudcase AppAuthenticate.attach_settings Error: Error parsing settings file.");
			_settings = {};
		}
		req.cloudcase_settings = _settings;
	  	fs.readFile ( "cloudcase-registry.json" , {encoding: "utf8"} ,  read_registry_callback  );
	};
	
	function read_registry_callback ( err, content ) {
		var _settings ;
		try {
			eval( "_settings = " + content + ";");	
		}  catch( err ) {
			console.log("Cloudcase AppAuthenticate.attach_settings Error: Error parsing settings file.");
			_settings = {};
		}
		req.cloudcase_registry = _settings;

		console.log("AppAuthenticate.attach_settings() complete.. proceed-next...\n\n\n####\n");
		next();

	};
	 
	fs.readFile ( "cloudcase-settings.json" , {encoding: "utf8"} ,  read_callback  );
};
 
 
AppAuthenticate.prototype.authenticate_app = function( req, res , next ) {
	console.log("AppAuthenticate.authenticate_app starting...");
 	var errorStacks = new ErrorStacks();
 	var self = this;
 	
 	var data = req.body.data;
  
 	eval( "data = " +  data + ";" );
 	var app_key = data.app_key;
 	var app_id = data.app_id;
 	console.log("Authenticatng App: " + app_id + " AppKEY: "+  app_key );
 	 
 	function authenticate_error(type ) {
 		errorStacks.authenticateError(type);
   	 	var obj = {
   	 		errors: errorStacks.errors,
   	 		warnings: errorStacks.warnings
   	 	};
   	 	res.end( JSON.stringify(  obj , null , 4 ) );
 	};
 	
 	
 	if( app_key == null || app_key == "" || app_id == null || app_id == "" ) {
 		console.log("AppAuthenticate.auth_app(): No Credentials....");
   	 	authenticate_error(1);
 	}
 	
 	function load_registry( settings ) {
 	 	var app = get_app_info( settings.apps);
 	 	
 	 	console.log("APP Settings:  "  + JSON.stringify(settings.apps) );
 		if( app != null) {
 			verify_appkey( app );
 		} else {
 		 	console.log("AppAuthenticate.auth_app(): Failed : Reason app_id not registered.");
 			authenticate_error(2);
 		}
 	};
 	
 	function get_app_info(apps){
 		var app = null;
 		for( var i = 0; i < apps.length ; i++ ) {
 			var item = apps[i];
 			if( item.app_id ==  app_id )	 {
 				app = item;
 				break;
 			}
 		}
 		return app;
 	};
 	
 	
 	function verify_appkey( app ) {
 		var secret = app.secret;
 		var fullstring = app_id + "_" + secret;
 		var key = crypto.createHash('md5').update( fullstring ).digest("hex");
 		if( key == app_key ) {
 			next();
 		} else{ 
 			authenticate_error(3);
 		}
 	};
 	 
 	 
 	load_registry( req.cloudcase_registry  );
};

 
AppAuthenticate.prototype.authenticate_access = function (req, res, next ) {
	console.log("AppAuth.authenticate_access " + req.body.data );
	var errorStacks = new ErrorStacks();
 	var self = this;
 	var data = req.body.data;
  	 	
 	eval( "data = " +  data + ";" );
 	var registry = req.cloudcase_registry;
 	var settings = req.cloudcase_settings;
 	
 	function validate () {
 		if( should_ignore() ) {
 			console.log("wIll Ignore...  \n\n\n");
 			console.log("AppAuthenticate.authenticate_access complete... next->");
 			next();
 		} else {
 			validate_access();
 		}
 	}
 	
 	function should_ignore() {
 		var result = false;
 		for( var i = 0; i < registry.ignored_routes.length; i++ ) {
 			if( req.path == registry.ignored_routes[i]) {
 				//validate_app_domains();
 				//validate_admin_domain();
 				result = true;
 				break;
 			}
 		}
 		console.log("AppAuth.authenticate_access.should_ignore: " + result );
 		return result;
 	}
 	 
 	function validate_access() {
 		console.log("AppAuth.authenticate_access.validate_access");
 		if( req.session == null ) {
 			console.log("AppAuth.authenticate_access.validate_access session null allow all domains")
 			validate_app_domains();
 			next();
 			return;
 		}
 		var access = req.session.access;
 		
 		console.log("AppAuthenticate.authenticate_access.validate_Access() Access is  " + req.session.access );
		
 		if( access == "admin" ) {
 			validate_admin_domain();	
 		} else if( access == "user" ) {
 			validate_app_domains();
 			next();	
 		} else {
 			validate_app_domains();
 			validate_guest();
 		}
 	};
 	
 	function validate_app_domains() {
 		console.log("\n\n\nAppAuth.authenticate_access.validate_app_domains " + registry.app_domains  + "\n\n\n");
 		res.header('Access-Control-Allow-Origin',  registry.app_domains ); 	 
		res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    	res.header('Access-Control-Allow-Headers', 'Content-Type');
    
 	};
 	 
 	
 	function validate_admin_domain() {
 		console.log("\n\n\nAppAuth.authenticate_access.validate_admin_domains " + registry.admin_domains + "\n\n\n");
 		res.header('Access-Control-Allow-Origin',  registry.admin_domains ); 	 
		res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    	res.header('Access-Control-Allow-Headers', 'Content-Type');
    	next();
 	};
 	
 	
 	function render_error() {
 		 
 		var obj = { success: false };
 		obj.errors = errorStacks.errors;
 		obj.warnings = errorStacks.warnings;
 		res.end( JSON.stringify( obj , null, 4 ) );
 	};
 	
 	function validate_guest () {
 		console.log("AppAuth.authenticate_access.validate_guest");
 		if( is_guest_valid() && is_guest_route_valid() && is_guest_collection_valid() ) {
 			console.log("guest authentication success...");
 			next();
 		} else {
 			console.log("guest authentication failed...");
 			errorStacks.guestAccessError();
 			render_error();
 		}
 	};
 	
 	function is_guest_valid() {
 		var result = false;
 		var guest = settings.guest_access;
 		var guest_name = data.guest_name;
  		var key = data.guest_key;
  		console.log("guest_name: " + guest_name + " Key: " + key );
  		console.log("guest.name:[" +  guest.name + "]newkey: " + newKey );
 		var newKey = crypto.createHash('md5').update( guest_name + "_" + guest.secret  ).digest("hex");
 		if( guest_name == guest.name && key == newKey ) {
 			result = true;
 		}
 		console.log("is_guest_valid? " + result );
 		return  result;
 	};
 	
 	function is_guest_route_valid() {
 		var result = false;
 		var route = req.path;
 		var routes = settings.guest_allowed_routes;
 		for( var i = 0; i < routes.length; i++ ) {
 			if( route == routes[i]) {
 				result = true;
 				break;
 			}
 		}
 		console.log("is_guest_route_valid? " + result );
 		return  result;
 	};
 	
 	function is_guest_collection_valid() {
 		var result = false;
 		var collection = data.collection;
 		var collections = settings.guest_allowed_collections;
 		for( var i = 0; i < collections.length; i++ ) {
 			if( collection == collections[i]) {
 				result = true;
 				break;
 			}
 		}
 		console.log("is_guest_collection_valid? " +  result );
 		return  result;
 	};
 	 
 	validate();
};


AppAuthenticate.prototype.admin_login = function ( req ,res  ) {
	
	var registry = req.cloudcase_registry;
 	var settings = req.cloudcase_settings;
	 
	//res.header('Access-Control-Allow-Origin', "http://www.air21.com.ph"  ); 
	res.header('Access-Control-Allow-Origin', registry.admin_domains ); 
	res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
	
    console.log("Header: " +  JSON.stringify(res.headers) );

	var errorStacks = new ErrorStacks();
 	var self = this;
 	var data = req.body.data;
 	eval( "data = " +  data + ";" );
 	 
   
 	function is_login_ok( name , password, key ) {
 		for( var i=0 ; i < registry.admin.length; i++ ) {
 			var admin = registry.admin[i];
 			if( admin.name == name ) {
 				var secret = admin.secret;
 				var aPassword = admin.password;
 				
 				var fullstring = name + "_" + secret;
 				var admin_key = crypto.createHash('md5').update( fullstring ).digest("hex");
 				var enPass = crypto.createHash('md5').update( password ).digest("hex");
 				if( enPass == aPassword && admin_key == key ) {
 					return true;
 				}
 			} 
 		}
 		return false;
 	};
 	
 	
 	function validate(){
 		if( is_login_ok ( data.name, data.password, data.admin_key )  )  {
 			login_success();				
 		} else {
 			login_failed();
 		}
 	};
 	
 	function login_success() {
		var obj = { success: true };
		var token = util.random_string();
		req.session.cookie.maxAge = settings.admin_session_timeout * 1000;
 		req.session.access = "admin";
		req.session.token =  token;
		
		console.log("AppAuthenticate.admin_login.login_success() Access is  " + req.session.access );
		
		res.cookie( "data", "{\"token\":\"" + req.session.token + "\"}" );
		
		 
		obj.token = token; 
		res.end( JSON.stringify( obj , null, 4 ) );
	} 	
	
	
 	function login_failed() {
 		var obj = { success: false };
 		req.session = null; 	
 		res.session = null;
 		errorStacks.adminLoginError();
 		obj.errors = errorStacks.errors;
 		obj.warnings = errorStacks.warnings;
 		res.end( JSON.stringify( obj , null, 4 ) );
 	}
 	
 	validate();
};

AppAuthenticate.prototype.admin_logout = function ( req ,res  ) {
	console.log("AppAuthenticate.admin_logout/logout:");
 
	req.session = null; 	
 	res.session = null;
 
 	res.clearCookie('data')
 	var p = {
 		success: true
 	};
 	res.end( JSON.stringify( p , null, 4) );
};
 

module.exports = new AppAuthenticate();
