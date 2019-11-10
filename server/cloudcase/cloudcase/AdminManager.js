var fs = require("fs");
var mkdirp = require("mkdirp");
var crypto = require('crypto');


var View = require("./../cloudcase/View");

var _view;// = new View();

function AdminManager() {
	 _view = new View();

};
 

function static_read_registry ( callback ) {
	fs.readFile ( "cloudcase-registry.json" , {encoding: "utf8"} ,   callback  );
};

function static_update_registry ( registry ) {
	var json = JSON.stringify( registry , null, 4 );
	fs.writeFileSync(  "cloudcase-registry.json" ,  json  );
};

function static_generate_key ( string1 , string2 ) {
	return crypto.createHash('md5').update(  string1 + "_" + string2 ).digest("hex");
}

AdminManager.prototype.change_password = function( req, res ) {
	var data = req.body.data;
	var self = this;
 	eval( "data = " +  data + ";" );


 	var admin_name = data.admin_name;
	var old_pass = data.old_pass;
	var new_pass = data.new_pass;

 	var registry;
 	var  result = { success: true , errors:[]};

 	function start () {
 		static_read_registry( read_registry_callback );
	};

	function read_registry_callback( err, content ) {
		try {
			eval( "registry = " + content + ";" );
		 	if(	change_password() ) {
		 		static_update_registry( registry );	
		 		_view.render( res ,  result  );
		 	} else {
		 		result.success = false;
			 	result.errors.push( { 
			 			 code: "invalid_admin_credentials", 
			 			 msg:"Admin name or password is not valid, please check your admin credentials again." 
			 				} );
				_view.render( res ,  result  );
		 	}
		 
  
		} catch( err ) {
			 result.success = false;
			 result.errors.push( { 
			 			 code: "malformed_registry_file", 
			 			 msg:"Registry file is not properly formatted. Please check cloudcase-registry.json give extra attention to commas, quotes and colons. " 
			 				} );
			_view.render ( res, result );
		}
	};

	function change_password() {
		var index = verify_registry ( registry.admin,  admin_name , old_pass );
		if( index != -1 ) {
			update_admin_password ( index , new_pass ) ;
			return true;
		}  
		return false;
	};
 
	function verify_registry ( admin_list , adminname, password )  {
		var e_password =  crypto.createHash('md5').update(  password ).digest("hex");
		for( var i = 0 ; i < admin_list.length; i++ ) {
			var admin = admin_list[i];
			if( admin.name == adminname && admin.password == e_password ) {
				return i;
			}	
		}
		return -1;
	};
 
	function update_admin_password( index , new_pass ) {
		var admin = registry.admin[index];
		var e_password =  crypto.createHash('md5').update( new_pass ).digest("hex");

		admin.password = e_password;
		registry.admin[index] = admin;
	};
 
	start();

};

AdminManager.prototype.add_admin = function( req, res ) {
	
	var data = req.body.data;
	var self = this;
 	eval( "data = " +  data + ";" );


 	var admin_name = data.admin_name;
	var password = data.new_pass;
	var secret = data.secret

	var key = static_generate_key ( admin_name, secret);

	var new_admin = { 
		name: admin_name, 
		secret: secret,
		password: password,
		admin_key: key
	};

 	var registry;
 	var  result = { success: true , errors:[]};

	function start () {
 		static_read_registry( read_registry_callback );
	};

	function read_registry_callback( err, content ) {
		try {
			eval( "registry = " + content + ";" );
		 	registry.admin.push( new_admin );
		 	static_update_registry( registry );
		 	_view.render ( res, result );
		} catch( err ) {
			 result.success = false;
			 result.errors.push( { 
			 			 code: "malformed_registry_file", 
			 			 msg:"Registry file is not properly formatted. Please check cloudcase-registry.json give extra attention to commas, quotes and colons. " 
			 				} );
			_view.render ( res, result );
		}
	};
	start();
};

module.exports = new  AdminManager();