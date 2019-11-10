
 
var fs = require("fs");
var mkdirp = require("mkdirp");

function ClearPostOperation() {
	
};
 
 
ClearPostOperation.prototype.clear = function ( files   ) {
	if( files == null ) return;
	if( files.length <= 0 ) return;
	
	var self = this;
 	var fields = this.get_fieldnames( files ) ;
 	 
 	for( var i = 0; i < fields.length; i++ ) {
 		var file = files[fields[i]];
 		fs.unlinkSync ( file.path );
 	} 
};
  
ClearPostOperation.prototype.get_fieldnames = function( files ) {
	var fields = [];
	for( var i in files) {
		fields.push(i);
	}
	return fields;
};  
  
  
module.exports = new ClearPostOperation();
