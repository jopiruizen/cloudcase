
 
var fs = require("fs");
var mkdirp = require("mkdirp");

function ImportCSVOperation() {
	
};
 
ImportCSVOperation.prototype.import_csv = function ( files, data, model , callback ) {
	var self = this;
 	
 	this.callback = callback;
 	this.model = model;
 	this.data = data;
 	
	var datafield = data.datafield;
	
	var file = files[datafield];
	var filepath =  file.path;
	var content_type = file.headers["content-type"];  
  
	function read_callback(err, fileContent) {
		if( err )  {
			
		}
		file_content = fileContent;
	    var base64data = file_content.replace("data:" + content_type + ";base64", "" );	  	
	    fs.writeFile( filepath , base64data , "base64", write_callback );
	};
	 
	function write_callback( err ) {
	 	fs.readFile ( filepath , {encoding: "utf8"} , retrieve_content );
	};
	
	function retrieve_content( err, fileContent ) {
		fs.unlinkSync( filepath );
		self.import_to_db(fileContent);
		
	};
	
 
	fs.readFile ( filepath , {encoding: "utf8"} , read_callback );
};

ImportCSVOperation.prototype.import_to_db = function ( fileContent ) {
	var self = this;
	var items = fileContent.split("\n");
	
	var fields = items.shift();
	fields = fields.replace(/["]/gi,"");
	fields = fields.split(",");
	items.pop();
	console.log("Items: " + items.length  ) ;
	
	var index = 0;
	
	var new_items = [];
	
	function insert_callback( results ) {
		self.callback( results ); 
	}
	
	function insert_items() {
		var inserts = [];
		for( index = 0; index < items.length; index++ ) {
			//console.log("fields..." + fields );
			var item = self.to_object( fields, items[index] );
			
			inserts.push( item );
		}
		console.log("Number of items: " + items.length );
		self.model.insert(inserts , insert_callback );
	};
	 
	insert_items();
	//callback("success");
};


ImportCSVOperation.prototype.to_object = function ( fields , item ) {
	

function csvtoArray(text) {
    			var re_valid = /^\s*(?:'[^'\\]*(?:\\[\S\s][^'\\]*)*'|"[^"\\]*(?:\\[\S\s][^"\\]*)*"|[^,'"\s\\]*(?:\s+[^,'"\s\\]+)*)\s*(?:,\s*(?:'[^'\\]*(?:\\[\S\s][^'\\]*)*'|"[^"\\]*(?:\\[\S\s][^"\\]*)*"|[^,'"\s\\]*(?:\s+[^,'"\s\\]+)*)\s*)*$/;
    var re_value = /(?!\s*$)\s*(?:'([^'\\]*(?:\\[\S\s][^'\\]*)*)'|"([^"\\]*(?:\\[\S\s][^"\\]*)*)"|([^,'"\s\\]*(?:\s+[^,'"\s\\]+)*))\s*(?:,|$)/g;
    // Return NULL if input string is not well formed CSV string.
    if (!re_valid.test(text)) return null;

    var a = [];                     // Initialize array to receive values.
    text.replace(re_value, // "Walk" the string using replace with callback.
        function(m0, m1, m2, m3) {
            // Remove backslash from \' in single quoted values.
            if      (m1 !== undefined) a.push(m1.replace(/\\'/g, "'"));
            // Remove backslash from \" in double quoted values.
            else if (m2 !== undefined) a.push(m2.replace(/\\"/g, '"'));
            else if (m3 !== undefined) a.push(m3);
            return ''; // Return empty string.
        });

    // Handle special case of empty last value.
    if (/,\s*$/.test(text)) a.push('');
    return a;
};
	
	var obj = {};
	
	

	var props = item.split(",");
	
	 
	for( var i = 0; i < fields.length; i++ ) {
			var key = fields[i];
			var value = "" + props[i] + "";
			//console.log(" " + key + " :  " + value );
			var len = value.length;
			
			if( value.substring( 0, 1) == "\"" ) {
				value = value.substring(1, len );
			}
			
		 	if( value.substring(len-1, len )  ==  "\"") {
				value = value.substring( 0 , len - 1);
			}
			
			obj[key] = value;
	}
	
	//console.log("WIll Insert Item: " + JSON.stringify(obj , null , 4 ) ) ;
	return obj;
}

ImportCSVOperation.prototype.string_from_date = function ( date ) {
	var year = this.zero_pad( date.getFullYear() , 4 );
	var month = this.zero_pad(date.getMonth() + 1, 2 );
	var day  = this.zero_pad(date.getDate() , 2 );
	
	var hours  = this.zero_pad(date.getHours() , 2 );
	var minutes  = this.zero_pad(date.getMinutes() , 2 );
	var seconds  = this.zero_pad(date.getSeconds() , 2 );
	var milli  = this.zero_pad(date.getMilliseconds() , 3 );
	return "" + year  + "_" + month + "_" + day + "_" +  hours + "_" + minutes + "_" + seconds + "_" +  milli;
};

ImportCSVOperation.prototype.zero_pad = function( num, size ) {
	var s = num+"";
    while (s.length < size) s = "0" + s;
    return s;
};


module.exports = new ImportCSVOperation();
