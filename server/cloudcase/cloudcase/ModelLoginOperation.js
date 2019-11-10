var crypto = require('crypto');
var ModelOperation = require("./../cloudcase/ModelOperation");

function ModelLoginOperation() {
	
};


ModelLoginOperation.prototype = new ModelOperation();


ModelLoginOperation.prototype.execute = function ( model, settings, mongodb , callback , params ) {
	console.log("ModelLoginOperation.execute() ");
	var self = this;
	this.init( model, settings, mongodb, callback, params );
	
	this.model.collection_name = settings.login_collection;
	var schema = settings.collections[this.model.collection_name ]; 
	var required_fields = settings.login_required_fields;
	var encrypted = settings.signup_encrypted_fields;
	
	var login_data = params.login_data;
	
	
	function filter_login_data(login_data) {
		var obj = {};
		for( var i =0 ; i < required_fields.length; i++ ) {
			var field = required_fields[i];
			obj [ field ] = login_data[field];
		}
		return obj;
	}
	
	login_data = filter_login_data(login_data);
	
	console.log("ModelLoginOperation.execute login data " + JSON.stringify( login_data ) );
	
	function is_or_separated_fields_valid (  field_str ) {
		var result = false;
		var fields = field_str.split("||");
		for( var i = 0; i < fields.length; i++ ) {
			var field = fields[i];
			if( login_data[field] != null ) {
				result = true;
				break;
			}
		}	
		return result;
	};
	
	function has_requirements() {
		var result = true;
		var missing_fields = [];
		for( var i = 0; i < required_fields.length ; i++ ){
			var field = required_fields[i];
			if( field.indexOf("||")   ) {
			 	if( is_or_separated_fields_valid(field ) == false ) {
			 		result = false
			 		missing_fields.push(field);
			 	}
			} else {
				if( login_data[field] == null) {
					result = false;
					missing_fields.push(field);
				}
			}
		}
		if( result == false ) {
			self.model.errorStack.loginRequiredFieldsError ( missing_fields ,  required_fields ); 
		}
		return result;
	};
	
	function encrypt(item, encrypted_fields) {

		for( var i = 0; i < encrypted_fields.length; i++ ) {
			var field = encrypted_fields[i];
			item[field] = crypto.createHash('md5').update( item[field] ).digest("hex");
		}	
	};
	
	
	function connect_callback( ) {
		var selector = {};
		for( var i in login_data ) {
			selector[i] = login_data[i];
		}
		encrypt( selector , encrypted );
		console.log("\n\nModelLoginOperation.connect_callback:  Selector " + JSON.stringify( selector, null , 4)  );
		
		self.collection.find( selector ).toArray( find_callback );
	};
	
	function find_callback( err , results ) {
		self.close();
		 
		if( results != null && results[0] != null ) {
			var item = results[0];
			self.callback( item );
		} else {
			self.model.errorStack.loginFailedError ( login_data );
			self.callback( null );
		}
	}
	 
	if( has_requirements() ) {
	  	this.operation = connect_callback;
		this.callback = callback;
		this.connect();
	} else {
		this.callback( null );	
	}
	
	
};

module.exports = ModelLoginOperation;