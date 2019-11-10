//var settings = require("./../cloudcase_settings");
//var settings;
var delegate = require("./../cloudcase/CCDelegate");
var fs = require("fs");
var mongodb = require("mongodb");

var ModelInsertOperation =   require("./../cloudcase/ModelInsertOperation");
var ModelUpdateOperation = require ("./../cloudcase/ModelUpdateOperation");
var ModelFindOperation = require("./../cloudcase/ModelFindOperation");
var ModelDeleteOperation = require("./../cloudcase/ModelDeleteOperation");


var ModelSignupOperation = require("./../cloudcase/ModelSignupOperation");
var ModelLoginOperation = require("./../cloudcase/ModelLoginOperation");

var ModelFindAndUpdateOperation = require("./../cloudcase/ModelFindAndUpdateOperation");




var ModelCountOperation = require("./../cloudcase/ModelCountOperation");


var EmailOperation =   require("./../cloudcase/EmailOperation");
var ForgotPasswordOperation =   require("./../cloudcase/ForgotPasswordOperation");

var ErrorStacks =  require("./../cloudcase/ErrorStacks");

function Model() {
	//settings = global["settings"];
	 
	this.mongodb = mongodb; 
	this.operation = null;
	this.collection = null; 
	this.callback = null;
	this.date_modified_field = "date_modified";
	this.date_created_field = "date_created";
	this.compare_latest = false;
		 
};

Model.prototype.init = function () {};

Model.prototype.set_date_fields = function( data ) {
	if( data.date_modified_field != null ) {
		this.date_modified_field = data.date_modified_field ;
	}
	
	if( data.date_created_field != null ) {
		this.date_created_field = data.date_created_field;
	}
	
	if( data.compare_lastest != null ) {
		this.compare_latest = data.compare_latest;
	}
};

Model.prototype.load_settings = function ( callback ) {
	this.errorStack = new ErrorStacks();
	function read_callback( err, settingsContent ) {
		var _settings ;
		try {
			eval( "_settings = " + settingsContent + ";");	
		}  catch( err ) {
			console.log("SEttings Error ");
			_settings = {};
		}
	 	callback( _settings );
	};
	fs.readFile ( "cloudcase-settings.json" , {encoding: "utf8"} ,  read_callback  );
}
   
Model.prototype.insert = function ( items , callback ) {
	 
	var operation = new ModelInsertOperation();
	var self = this;
	function settings_callback( settings ) {
		operation.execute( self, settings, mongodb , callback , { items: items });
	}
	this.load_settings ( settings_callback );
	 
};

Model.prototype.update = function ( items, selector_field, callback ) {
	var operation = new ModelUpdateOperation();
	var self = this;
	function settings_callback( settings ) {
		operation.execute(  self ,settings , mongodb , callback , { selector_field: selector_field, items: items } );	
	}
	this.load_settings ( settings_callback );
	
	
};


Model.prototype.find = function ( selector , options , callback ) {
	var operation = new ModelFindOperation();
	var self = this;
	function settings_callback( settings ) {
		operation.execute( self , settings, mongodb, callback , { selector: selector , options: options } );
	}
	this.load_settings ( settings_callback );
};

Model.prototype.remove = function ( selector   , callback ) {
	var operation = new ModelDeleteOperation();
	
	var self = this;
	function settings_callback( settings ) {
		operation.execute( self, settings, mongodb, callback , { selector: selector  } );	
	}
	this.load_settings ( settings_callback );
	
	
};

Model.prototype.find_and_update = function( selector , item, options, callback ) {
	 
	var operation = new ModelFindAndUpdateOperation();
	var self = this;
	function settings_callback( settings ) {
		operation.execute( self , settings, mongodb, callback, { selector: selector , item: item , options: options } );	
	}
	this.load_settings ( settings_callback );
	
};

Model.prototype.signup = function ( signup_data , callback) {
	var self = this;
	var operation = new ModelSignupOperation
	function settings_callback( settings ) {
		operation.execute( self , settings, mongodb, callback, { signup_data: signup_data } );	
	}
	this.load_settings ( settings_callback );
};

Model.prototype.login = function ( login_data , callback) {
	var self = this;
	var operation = new ModelLoginOperation
	function settings_callback( settings ) {
		operation.execute( self , settings, mongodb, callback, { login_data: login_data } );	
	}
	this.load_settings ( settings_callback );
};


Model.prototype.count = function (  selector , options , callback ) {
	var self = this;
	var operation = new ModelCountOperation();
	
	var findOperation = new ModelFindOperation();
	
	function find_callback ( results) {
		results.length
		callback( results.length );
	};
	
	
	function settings_callback( settings ) {
		
		if( selector == null ) {
			operation.execute( self , settings, mongodb, callback, {  options: options } );	
		} else {
			findOperation.execute(  self , settings, mongodb, find_callback , { selector: selector , options: options } )
		}
		
		
	}
	this.load_settings( settings_callback );
};



/*
 * Email and Forgot Password Stub
 */

Model.prototype.email = function ( params, callback ) {
	var self = this;
	var operation = new EmailOperation();

	function settings_callback( settings ) {
			operation.execute( self , settings, mongodb, callback,  params );	
	}
	this.load_settings( settings_callback );
};

Model.prototype.forgot_password = function ( email, callback ) {
	var self = this;
	var operation = new ForgotPasswordOperation();
	function settings_callback( settings ) {
		operation.execute(  self , settings, mongodb, callback, {  email: email  } );
	}
	this.load_settings( settings_callback );
};




 
module.exports = Model;