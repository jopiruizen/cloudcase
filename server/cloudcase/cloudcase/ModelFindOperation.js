var ModelOperation = require("./../cloudcase/ModelOperation");

function ModelFindOperation() {
	
};
ModelFindOperation.prototype = new ModelOperation();

ModelFindOperation.prototype.execute = function ( model, settings, mongodb , callback , params ) {
	this.init ( model , settings , mongodb , callback );
	
	var self = this;
	var selector = params.selector;
	var options = params.options;
	
	if( selector == null ) selector = {};
	if( options == null ) options = {};
	
	function strip_selector_regex () {
		for( var fld in selector ) {
			var obj = selector [fld ];
			if( typeof obj  == "object" ) {
			 	for( var qtype in obj ) {
					if( qtype == "$regex" ) {
						var regexVal = obj[qtype];	
						console.log("selector is creating Regular Expression:[" + regexVal + "] for [" + fld +"]" );
						delete obj[qtype];
						selector[fld] = new RegExp(regexVal, "i");
						//console.log("selector field is now " + selector[fld]);
					}
				}
			}
		}
	}
	
		function recursive_array_strip( arr ) {
  			var newArr = [];
  			for ( var i =0 ; i < arr.length; i++ ) {
  				var child = arr[i];
  				if( child instanceof Array) {
  					newArr[i] = recursive_array_strip( child );
  				} else if(  typeof(child) == "object" ) {
  					newArr[i] = recursive_regex_strip( child );
  				} else {
  					newArr[i] = child;
  				}
  			}
  			return newArr;	
  		}
  		
	  	function recursive_regex_strip(obj){
			for( var fld in obj ) {
				var child = obj[fld];
				if( fld == "$regex" ) {
					//console.log("Here comes the regex.../" + child + "/" );
					delete obj[fld];
					return new RegExp(  child,"i");
				}
				
				if( child instanceof Array) {
					 obj[fld] = recursive_array_strip( child);
				} else if( typeof(child) == "object" ) {
					obj[fld] = recursive_regex_strip( child);
				} else {
					//do nothing..
				}
			};
			return obj;
		};
	
	function operation () {
		//console.log( "Selector: " + JSON.stringify(selector ) );
		//console.log("Options: " + JSON.stringify( options ) ) ;
		if( self.collection != null ) {
			
			//console.log("Collection " + self.collection + " name: " + self.model.collection_name ) ;
			//console.log( "Selector:" + JSON.stringify( selector, null , 4 ) ); 
			//console.log( "Options:" + JSON.stringify( options , null , 4 ) ); 
			
			selector = recursive_regex_strip ( selector ) ;
			//strip_selector_regex ();
			//console.log( "Selector:" + JSON.stringify( selector, null , 4 ) ); 
			
			
			if( options.sort != null ) {
				 add_index();
			}	else {
				self.collection.find( selector , options ).toArray( operation_callback );
			}
		 
		} else {
			self.callback ( [] );
		}
		
	};
	
	var index_fields = {};
	var index_names = "";
	function add_index() {
		console.log("ModelOperation.add_index() ");
		for( var i in options.sort ) {
			index_fields[i] = 1;
			index_names += "" + i + "_" + "1_";
		}
		index_names = index_names.substr(0, index_names.length - 1 );
		console.log("adding index : " + index_names );
		self.collection.ensureIndex( index_fields , {}, indexing_complete  );
	}
	
	
	function indexing_complete(err, indexName) {
		self.collection.find( selector , options ).toArray( operation_callback );
	};
	
	var native_errors = [];
	
	var final_results;
	function operation_callback(err, items ) {
	 	if( err ) {
			native_errors.push( err );
		}
		final_results = items;
		if( options.sort != null ) {
			console.log("ModelFindOperation dropping index " + index_names );
			self.collection.dropIndex ( index_names , finalize_find);
		} else {
			finalize_find( null, null);
		}
	};
	
	function finalize_find( err, result ) {
		 if( self.callback != null ) {
		 	if( native_errors.length > 0 ) {
		 		self.model.errorStack.dbQueryError ( "FIND" , [] , native_errors );
		 	}
		 	self.close();
		 	self.callback ( final_results )	;
		 } 
	};
	
	
	this.operation = operation;
	this.connect();
};

module.exports = ModelFindOperation;