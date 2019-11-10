

function ModelOperation() {
	this.collection = null;
	this.operation = null;
};

ModelOperation.prototype.init = function ( model , settings, mongodb, callback ) {
	this.model = model;
	this.settings = settings;
	this.mongodb = mongodb;
	this.callback = callback;
	this.illegal_collection = false;
	 
};

ModelOperation.prototype.execute = function  ( model , settings, mongodb ,  callback , params ) {
	this.init ( model, settings , mongodb , callback ) ;
	if( this.settings.collections[this.model.collection_name ] == null ) {
		//throw new Error("Collection name ''" + this.model.collection_name + "' is not on the provided schema sets.");
		this.model.errorStack.collectionNameError( this.model.collection_name );
		this.illegal_collection = true;
		return;
	} 
	
}

 
ModelOperation.prototype.insert_empty_fields = function (item, fields ) {
 	for( var i = 0  ; i < fields.length ; i++ ) {
 		var field = fields[i];
 		if( item[field] == null ) {
 			item[field] = "";
 		}
 	}
 	item._id = "" +  new this.mongodb.ObjectID();
 	item[this.model.date_created_field] = this.string_from_date( new Date() );
 	item[this.model.date_modified_field] = this.string_from_date( new Date() );
}; 


ModelOperation.prototype.remove_undefined_fields = function ( item , fields ) {
	for( var i in item  ) {
		 //check for field availability
		 var field_available = false;
		 
		 for( var  j = 0; j < fields.length; j++ ) {
		 	var fieldname = fields[j];
			if ( i == fieldname ) {
				field_available = true;
				break; //available
			} 
		 }
		 if( field_available == false ) {
		 	this.model.errorStack.fieldWarning( this.model.collection_name , i );
		  	delete item[i];
		 }
	}
};


ModelOperation.prototype.string_from_date = function ( date ) {
	var year = this.zero_pad( date.getFullYear() , 4 );
	var month = this.zero_pad(date.getMonth() + 1, 2 );
	var day  = this.zero_pad(date.getDate() , 2 );
	
	var hours  = this.zero_pad(date.getHours() , 2 );
	var minutes  = this.zero_pad(date.getMinutes() , 2 );
	var seconds  = this.zero_pad(date.getSeconds() , 2 );
	var milli  = this.zero_pad(date.getMilliseconds() , 3 );
	return "" + year  + "_" + month + "_" + day + "_" +  hours + "_" + minutes + "_" + seconds + "_" +  milli;
};

 
ModelOperation.prototype.zero_pad = function( num, size ) {
	var s = num+"";
    while (s.length < size) s = "0" + s;
    return s;
};

ModelOperation.prototype.connect = function () {
	var client = this.mongodb.MongoClient;
	var self = this;
	function connect_callback ( error, db ) {
		if( error )  {
			//throw error;
			console.log("ModelOperation.connect error...");
			self.model.errorStack.connectionError( self.settings.db_path );
			self.connection_failed();
		} else {
			self.db = db;	 
			db.authenticate (self.settings.db_user, self.settings.db_password , auth_callback );
		}
	};
	
	function auth_callback(error , result ) {
		if( error ) {
			console.log("ModelOperation.authenticate error");
			self.model.errorStack.authenticateError( self.settings.db_path );
			self.connection_failed();
		} else {
			console.log("ModelOperation.authenticate success");
			self.collection = self.db.collection(  self.model.collection_name );
			self.operation();
		}
		
		
	}
	 
	client.connect( this.settings.db_path , connect_callback );
};


ModelOperation.prototype.close = function () {
	function close_callback( err, result ) {
		console.log("ModelOperation.close MongoDB Connection..." + err + " result: " + result );
	};
	this.db.close ( true,  close_callback );
}

ModelOperation.prototype.has_properties = function( obj ) {
	var key = [];
	for( var i in obj ) {
		key.push( i );
		break;
	}
	if( key.length <= 0 )  return false;
	return true;
};


ModelOperation.prototype.connection_failed = function () {
	if( this.callback != null ) {
		this.callback ( null ) ;
	}
};

module.exports = ModelOperation;