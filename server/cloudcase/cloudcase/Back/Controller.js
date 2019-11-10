
var Model = require("./../cloudcase/Model");
var View = require("./../cloudcase/View");

var util = require("./../cloudcase/CloudcaseUtil");

var uploadManager = require("./../cloudcase/UploadManager");

var importCSV = require("./../cloudcase/ImportCSVOperation");
var postClean = require("./../cloudcase/ClearPostOperation");

var ModelJoinOperation =  require("./../cloudcase/ModelJoinOperation");

var _model;// = new Model();
var _view;// = new View();


function Controller () {
	 _model = new Model();
	 _view = new View();
};

Controller.prototype.will_render_default = function () {
	return true;
};

Controller.prototype.sync = function ( req, res ) {
	postClean.clear( req.files );
	var data = req.body.data;
	var self= this;
  
	eval( "data = " +  data + ";" );
	
	var collection = data.collection;
	 
	var new_items = data.new_items;
	var updated_items = data.updated_items; 

	var options = data.options;
	var selector = data.selector;
	 
	eval( "selector = " + selector + ";");
	eval( "options = " + options + ";");
	
	var response_obj = { updated_items:[], new_items:[], latest_items:[]};
	
	function find() {
		if( selector != null ) {
			_model.find(  selector , options , find_callback );
		} else {
			find_callback([]);
		}
	}
	
	function find_callback( results ) {
		response_obj.latest_items = results;
		var latestJSON =   JSON.stringify( results , null, 4 )  ;
		//console.log( "Latest:" +  latestJSON );
		//console.log("WILL UPDATED " + collection ) ;
		if( updated_items != null && updated_items.length > 0 ) {
			_model.update(updated_items, "_id" , update_callback );
		} else {
			update_callback( [] );
		}
		
	}
	 
	function update_callback( results ) {
		response_obj.updated_items  = results;
		//var ljson =   JSON.stringify( results , null, 4 )  ;
	   //console.log("Controller.update_callback " + ljson );
		
		if( new_items != null && new_items.length > 0 ) {
			_model.insert(new_items, insert_callback );
		} else {
			insert_callback ( [] ) ;
		}
	}
	
	function insert_callback (results) {
	 
		response_obj.new_items = results;
		response_obj.errors =_model.errorStack.errors;
		response_obj.warnings = _model.errorStack.warnings;
		 
		_view.will_render_sync ( res, response_obj );	
	}
	
	
	_model.set_date_fields( data);
	_model.collection_name =  collection;	
	find();
	
};

Controller.prototype.signup = function ( req , res ) {
	var data = req.body.data;
	eval( "data = " +  data + ";" );
	function signup_callback( result ) {
		var obj = {
			errors : _model.errorStack.errors,
			warnings: _model.errorStack.warnings
		};
		if( result != null ) {
			obj.success = true;
			obj.signup_data = result;
		} else {
			obj.success = false;
		}
	
		_view.render (res, obj );
	};
	_model.signup( data, signup_callback );
};

Controller.prototype.save_session_data = function (req , res  ) {
	var data = req.body.data;
	eval( "data = " +  data + ";" );
	var name = data.name;
	req.session[name] = data.session_data;
	var obj = {
		errors: [],
		warnings: [],
		success : true
	};
	_view.render (res, obj );
};

Controller.prototype.load_session_data = function  (req , res ) {
	var data = req.body.data;
	eval( "data = " +  data + ";" );
	
 
	var name = data.name;
	var session_data = req.session[name]  ;
	var obj = {
		errors: [],
		warnings: [],
		success : true,
		session_data : session_data
	};
	_view.render (res, obj );
	
	
};



Controller.prototype.login = function ( req, res ) {
	 
	var data = req.body.data;
	eval( "data = " +  data + ";" );
 	function login_callback( result ) {
		var obj = {
			errors : _model.errorStack.errors,
			warnings: _model.errorStack.warnings
		};
		if( result != null ) {
			obj.success = true;
		    req.session.token = util.random_string();
		    req.session.data_id = result._id;
		    req.session.access = "user";
			obj.token = req.session.token;
		 	res.cookie( "data", "{\"token\":\"" + req.session.token + "\"}" );
		} else {
		
			obj.success = false;
		}
		
		_view.render (res, obj );
	};
	_model.login( data, login_callback );
};

Controller.prototype.logout = function ( req, res ) {
	
};



Controller.prototype.create = function ( req , res ) {
	var data = req.body.data;
	eval( "data = " +  data + ";" );
	var collection = data.collection;
	var inserts = data.inserts;
 
	function insert_callback(results){				
		var obj = {
			collections : results, 
			errors : _model.errorStack.errors,
			warnings: _model.errorStack.warnings
		};
		_view.will_render_create (res, obj );
		//res.end("Controller.insert.callback New Entries.count " + inserts.length + " name " + collection );
	};
	_model.set_date_fields( data);
	_model.collection_name =  collection;
	_model.insert( inserts , insert_callback);
};

Controller.prototype.update = function ( req , res  ) {
	var data = req.body.data;
	eval( "data = " +  data + ";" );
	var collection = data.collection;
	var updates = data.updates;
	var date_modified_field = data.date_modified_field;
	var selector_field = data.selector_field;
 	var options = data.options;
 	
	function update_callback(  results ) {
		var obj = {
			collections : results, 
			errors : _model.errorStack.errors,
			warnings: _model.errorStack.warnings
		};
	 
		_view.will_render_update (res, obj );
		//res.end("Cloudcase.Controller.update_callback " + results.length );
	};
	
	_model.set_date_fields( data);
	_model.collection_name =  collection;
	_model.update( updates, selector_field , update_callback );
	
};

Controller.prototype.find = function ( req, res ) {
	 
	var data = req.body.data;
	eval( "data = " +  data + ";" );
	var collection = data.collection;
	 
	var selector = data.selector;
	var options = data.options;
   
	function find_callback( results ) {
		//console.log("Results: " + JSON.stringify( results, null , 4 ) ) ;
		var obj = {
			collections : results, 
			errors : _model.errorStack.errors,
			warnings: _model.errorStack.warnings
		};
		_view.will_render_find (res, obj );
		//res.end("cloudcase.Controller.find results:  " + results.length );	
	};
	
	_model.set_date_fields( data);
	_model.collection_name =  collection;
	_model.find(  selector , options , find_callback );
};

Controller.prototype.remove = function ( req, res ) {
	var data = req.body.data;
	eval( "data = " +  data + ";" );
	var collection = data.collection;
	var selector = data.selector;
	 
	function delete_callback(   deletedCount ) {
		//console.log("Results: " + JSON.stringify( results, null , 4 ) ) ;
		//res.end("cloudcase.Controller.delete results:  "  );	
		var obj = {
			deletedCount : deletedCount,
			errors : _model.errorStack.errors,
			warnings: _model.errorStack.warnings
		};
		_view.will_render_find (res, obj );
	};
	_model.set_date_fields( data);
	_model.collection_name =  collection;
	_model.remove(  selector , delete_callback );
};


Controller.prototype.find_and_update = function( req, res ) {
	var data = req.body.data;
	eval( "data = " +  data + ";" );
	var collection = data.collection;
	var selector = data.selector;
	var options = data.options;
	var item = data.item;
	function update_callback( item  ) {
		var obj = {
			item : item,
			errors : _model.errorStack.errors,
			warnings: _model.errorStack.warnings
		};
		_view.will_render_update( res , obj ) ;
	};
	
	_model.set_date_fields( data );
	_model.collection_name = collection;
	_model.find_and_update( selector, item, options, update_callback );
};

Controller.prototype.upload = function ( req , res ) {
	 
	var data = req.body.data;
	eval( "data = " +  data + ";" );
	function upload_callback( result ) {
		 
		var obj = {
			item : result,
			errors : _model.errorStack.errors,
			warnings: _model.errorStack.warnings
		};
		_view.will_render_update( res , obj ) ;
	};
	
	_model.collection_name = data.collection;
	_model.set_date_fields( data );
	uploadManager.manage_upload(req.files, data , _model , upload_callback );
	 
};

Controller.prototype.import_csv = function ( req , res ) {
	var data = req.body.data;
	eval( "data = " +  data + ";" );
	function import_callback ( results ) {
		
		var obj = {
			collection : results,
			errors : _model.errorStack.errors,
			warnings: _model.errorStack.warnings
		};
		console.log("WILL RENDER...import csv" );
		_view.will_render_create( res , obj ) ;
	};
	
	_model.collection_name = data.collection;
	_model.set_date_fields( data );
	importCSV.import_csv(req.files, data , _model , import_callback );
};




Controller.prototype.join = function ( req , res ) {
	var joinOperation = new ModelJoinOperation();
 
	var data = req.body.data;
	eval( "data = " +  data + ";" );
	var collection = data.collection;
	var selector = data.selector;
	var options = data.options;
    var join_collections = data.join_data;
  
	function find_callback( results ) {
		console.log("Results " + results );
		if( join_collections != null && join_collections.length >  0 ) {
			joinOperation.execute ( _model, results , join_collections , join_callback  );
		} else {
			render_results( results);
		}
		
		
	};
	
	function join_callback( results ) {
		render_results( results);
	};
	
	function render_results(results) {
		var obj = {
			collections : results, 
			errors : _model.errorStack.errors,
			warnings: _model.errorStack.warnings
		};
		_view.will_render_find (res, obj );
	}
	
	
	   
	_model.set_date_fields( data);
	_model.collection_name =  collection;
	_model.find(  selector , options , find_callback );
};




module.exports = Controller;

