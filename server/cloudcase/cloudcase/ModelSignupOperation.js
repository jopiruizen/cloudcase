var crypto = require('crypto');
var ModelOperation = require("./../cloudcase/ModelOperation");

function ModelSignupOperation() {
	
};


ModelSignupOperation.prototype = new ModelOperation();


ModelSignupOperation.prototype.execute = function ( model, settings, mongodb , callback , params ) {
	var self = this;
	this.init( model, settings, mongodb, callback, params );
	this.model.collection_name = settings.signup_collection;
	 
	var required_fields = settings.signup_required_fields;
	var unique_fields = settings.signup_unique_fields;
	var schema = settings.collections[this.model.collection_name ];
	var encrypted = settings.signup_encrypted_fields;
	  
	var signup_data = params.signup_data;
	function has_requirements() {
		var result = true;
		var missing_fields = [];
		for( var i = 0; i < required_fields.length ; i++ ){
			var field = required_fields[i];
			console.log("Checking for FAILED FIELDS: " + field + " Value: " +  signup_data[field] );
			if( signup_data[field] == null) {
				console.log("Inserting for FAILED FIELDS: " + field + " Value: " +  signup_data[field] );
				result = false;
				missing_fields.push(field);
			}	
		}
		if( result == false ) {
			self.model.errorStack.signupRequiredFieldsError ( missing_fields ,  required_fields ); 
		}
		return result;
	};
	 
	function connect_callback() {
		var selector_fields = [];
		for( var i = 0; i < unique_fields.length;i++ ) {
			var field = unique_fields[i];
			var obj = {};
			obj[field] = signup_data[field];
			selector_fields.push( obj );
		}
		self.collection.find({$or:selector_fields}).toArray( find_callback );
	};
	
	function find_callback( err, results ) {
		if ( results != null &&  results[0] != null  ) {
			failed_signup( results );	
		} else {
			self.remove_undefined_fields( signup_data , schema );
			self.insert_empty_fields( signup_data , schema );
			encrypt( signup_data,  encrypted );
			self.collection.insert(signup_data, {w:1 } ,  signup_complete);
		}
	};
	
	function encrypt(item, encrypted_fields) {
		for( var i = 0; i < encrypted_fields.length; i++ ) {
			var field = encrypted_fields[i];
			item[field] = crypto.createHash('md5').update( item[field] ).digest("hex");
			console.log("signup encrypted " + field + "=" + item[field]);
		}	
	};
	
	function failed_signup( results ) {
		for( var i = 0 ; i < results.length; i++ ) {
			var item = results[i];	
			check_for_unique_error( item );	
		}
		self.close();
		self.callback (  null  );
	};
	
	function check_for_unique_error( item ) {
		var not_unique = [];
		var msg_inline = [];
		for( var i = 0 ; i < unique_fields.length; i++ ) {
			var field = unique_fields[i];
			if( item[field] == signup_data[field] ) {
				var data = {};
				data[field] = signup_data[field];
				not_unique.push(  data  );
				msg_inline.push ( "" + field + ":'" + signup_data[field] + "'"  );
			}
		}
		self.model.errorStack.signupUniqueFieldsError ( msg_inline , not_unique , unique_fields );
	};
	 
	function signup_complete( err, success_item ) {
		self.close();
		self.callback( success_item );
	};
	
	if( has_requirements() ) {
		this.operation = connect_callback;
		this.callback = callback;
		this.connect();
	} else {
		//write errors and invoke callback...
	   this.callback ( null ) ;
	}
};

module.exports = ModelSignupOperation;