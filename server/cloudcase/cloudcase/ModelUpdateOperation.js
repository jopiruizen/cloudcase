var ModelOperation = require("./../cloudcase/ModelOperation");

function ModelUpdateOperation() {
	
};

ModelUpdateOperation.prototype = new ModelOperation();

ModelUpdateOperation.prototype.execute = function ( model, settings, mongodb , callback , params ) {
	this.init( model, settings, mongodb, callback, params );
	if( this.illegal_collection == true && callback != null) {
 		callback ( null );
 		return;
 	}
 	 
	var items = params.items;
	var selector_field = params.selector_field;
	 
	var self = this;
	var items_index = 0; 
	var schema = this.settings.collections[this.model.collection_name ];
	var new_items = [];
	var fault_items = [];
	var native_errors = [];
	var prev_id
	var operation_callback = function ( err, result ) {
		var prevItem = items[ items_index];
		prevItem["_id"] = prev_id;
		 if( err ) {
			fault_items.push( prevItem  );
			native_errors.push( err ) ;
		 } else {
		 	if( result > 0 ) {
				new_items.push( prevItem ) ; 		
		 	}
		 }
		 items_index++;
		// console.log("ModelOperationUpdate.updating.. " + items_index );
		 if(items_index  >= items.length ) {
		 	if( self.callback != null ) {
		 		if( native_errors.length > 0 ) {
		 			self.model.errorStack.dbQueryError ( "UPDATE" , fault_items , native_errors );
		 		}
		 		self.close();
		 		self.callback ( new_items ); 
		 	}
		 } else {
		 	validate_and_update();
		 }
	};
	
	function update_operation () {
		validate_and_update(); 
	};	
	
	function validate_and_update() {
		var item = items [ items_index ];  
		self.remove_undefined_fields( item , schema );
		var sel_value = item[selector_field];
		
		var selector = "{" + selector_field + ": \"" + sel_value + "\"";
		if( self.model.compare_latest ) {
			var date_value = item[self.model.date_modified_field];
			selector += ", " + self.model.date_modified_field +  ": {$lt:\"" +  date_value  +  "\"}"
		}
		selector += "}";
		var sel;
		
		eval ( " sel = " + selector + ";" );
		
		prev_id = item["_id"];
		delete item["_id"]; 
		item[self.model.date_modified_field] = self.string_from_date ( new Date() );
		self.collection.update( sel , {$set: item } , {w: 1 , upsert:true  }, operation_callback );
	};
	this.operation = update_operation; 
	this.callback = callback;
	this.connect();
};


module.exports = ModelUpdateOperation;