var crypto = require('crypto');
var ModelOperation = require("./../cloudcase/ModelOperation");


function ModelFindAndUpdateOperation() {
	
};

ModelFindAndUpdateOperation.prototype = new ModelOperation();

ModelFindAndUpdateOperation.prototype.execute = function ( model, settings, mongodb , callback , params ) {
	this.init( model, settings, mongodb, callback, params );

	if( this.illegal_collection == true && callback != null) {
 		callback ( null );
 		return;
 	}
	var self = this;
 	var selector = params.selector;	
 	var options = params.options;
 	var item  = params.item;
 	var schema = this.settings.collections[this.model.collection_name ];
 	this.remove_undefined_fields( item  , schema );

	var item_id = item["_id"];
 	delete item["_id"];


  	item[this.model.date_modified_field] = this.string_from_date( new Date() );
 	
 	 
 	function operation () {
 		if( options.encrypt_fields != null ) {
 			for( var i = 0; i < options.encrypt_fields.length; i++  ) {
 				var field = options.encrypt_fields[i];
 				item[field] = crypto.createHash('md5').update( item[field] ).digest("hex");
 			}	
 			delete options["encrypt_fields"];
 		}
 		
 		if( options.check_unique != null ) {
 			delete options["check_unique"];
 			check_unique();

 		} else {
 			self.collection.update( selector, {$set: item }, options, operation_callback );
 		}
 	};	
 	function operation_callback (err, result ) {
 		if( err ) {
 			self.model.errorStack.dbQueryError ( "UPDATE" , [] , [err] );
 		} 
 		self.close();
		item ["_id"] = item_id;
 		self.callback (  item );
 		
 	};
 	
 	
 	var unique_fields = settings.signup_unique_fields;
 	function check_unique() {
 		var selector_fields = [];
		for( var i = 0; i < unique_fields.length;i++ ) {
			var field = unique_fields[i];
			var obj = {};
			obj[field] = item[field];
			selector_fields.push( obj );
		}
		self.collection.find({$or:selector_fields}).toArray( check_unique_callback );
 	};
 	
 	function check_unique_callback(err, results ) {
 		if ( results != null &&  results[0] != null  ) {
			failed_update( results );	
		} else {
		 	self.collection.update( selector, {$set: item }, options, operation_callback );
		}
 	};
 	
 	function failed_update( results ) {
		for( var i = 0 ; i < results.length; i++ ) {
			var item = results[i];	
			check_for_unique_error( item );	
		}
		self.close();
		self.callback (  null  );
	};
 	
 	function check_for_unique_error( err_item ) {
		var not_unique = [];
		var msg_inline = [];
		for( var i = 0 ; i < unique_fields.length; i++ ) {
			var field = unique_fields[i];
			if( err_item[field] == item[field] ) {
				var data = {};
				data[field] =   item[field];
				not_unique.push(  data  );
				msg_inline.push ( "" + field + ":'" + item[field] + "'"  );
			}
		}
		self.model.errorStack.signupUniqueFieldsError ( msg_inline , not_unique , unique_fields );
	};
	  
	this.operation = operation; 
	this.connect();
};


module.exports = ModelFindAndUpdateOperation;