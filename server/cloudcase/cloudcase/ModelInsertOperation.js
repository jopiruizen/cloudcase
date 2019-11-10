var ModelOperation = require("./../cloudcase/ModelOperation");

function ModelInsertOperation () {
	
};

ModelInsertOperation.prototype = new ModelOperation();

ModelInsertOperation.prototype.execute = function (model , settings, mongodb,  callback , params ) {
	console.log("ModelInsertOperation.execute()");
	this.init( model, settings, mongodb, callback ) ;
 	if( this.illegal_collection == true && callback != null) {
 		callback ( null );
 		return;
 	}
	
	var items = params.items;
	
	var self = this;
	var insert_index = 0; 
	var schema = this.settings.collections[this.model.collection_name ];
	var new_items = [];
	var fault_items = [];
	var native_errors = [];
	function operation_callback ( err, item ) {
		
		if( err ) {
			var lastItem = items[ insert_index];
			console.log("Inserting... Error" + insert_index + " at  " + self.model.collection_name );
			fault_items.push( lastItem );
			native_errors.push( err ) ;
		} else {
			console.log("Success... " + insert_index + " at " + self.model.collection_name );
			if(item != null ) new_items.push( item[0] ) ;
		}
		 
		insert_index++;
		if( insert_index >= items.length   ) {
			if( native_errors.length > 0 ) {
				self.model.errorStack.dbQueryError ( "CREATE" , fault_items , native_errors );
			}
			self.close();
			if( self.callback != null )  self.callback ( new_items );	
		
		} else {
			validate_and_insert();	
		}
	};
	
	function actual_operation () {
		validate_and_insert();
	};	
	
	function validate_and_insert() {
		var item = items [ insert_index ];  
		self.remove_undefined_fields( item , schema );
		self.insert_empty_fields(item, schema );
		self.collection.insert(item, {w:1 } , operation_callback );
		//console.log("Inserting: " + insert_index );
		
	}
	
	this.operation = actual_operation;  
	this.callback = callback;
	this.connect();
};

module.exports = ModelInsertOperation;
