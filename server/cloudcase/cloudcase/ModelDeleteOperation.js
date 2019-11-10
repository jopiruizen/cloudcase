var ModelOperation = require("./../cloudcase/ModelOperation");

function ModelDeleteOperation() {
	
};

ModelDeleteOperation.prototype = new ModelOperation();
ModelDeleteOperation.prototype.execute = function ( model, settings, mongodb , callback , params ) {
	this.init ( model , settings , mongodb , callback );
	var selector = params.selector ;
	if( selector == null ) selector = {};
	if( this.has_properties(selector) == false ) {
		this.model.errorStack.deleteWarning();
		callback(  null );	
		return;
	}
	var self = this;
	function operation () {
		self.collection.remove( selector  , {w:1} , operation_callback );
	};
	var native_errors = [];
	function operation_callback( err , items ) {
		if( err ) {
			native_errors.push( err );
		}
		 if( self.callback != null ) {
		 	if( native_errors.length > 0 ) {
		 		self.model.errorStack.dbQueryError ( "DELETE" , [] ,  native_errors );
		 	}
		 	self.close();
		 	self.callback( items );
		 }
	};
	this.operation = operation;
	this.connect();
};

module.exports = ModelDeleteOperation;