var crypto = require('crypto');
var ModelOperation = require("./../cloudcase/ModelOperation");


function ModelCountOperation() {
	
};


ModelCountOperation.prototype = new ModelOperation();

ModelCountOperation.prototype.execute = function ( model, settings, mongodb , callback , params ) {
	this.init ( model , settings , mongodb , callback );
	var self = this;
	 
	var options = params.options;
	var selector = params.selector;
	
	if(options == null ) {
		options = {};
	}
	
	if( selector == null ) {
		selector = {};
	}
	
	function operation_callback(  ) {
		if( self.collection != null ) { 
			self.collection.count ( selector  , options, count_callback );
		} else {
			self.callback ( 0 );
		}
		
	};
	
	function count_callback( err, count ) {
		self.callback( count ) ;
	};
	
	this.operation = operation_callback;
	this.connect();
};



module.exports = ModelCountOperation;