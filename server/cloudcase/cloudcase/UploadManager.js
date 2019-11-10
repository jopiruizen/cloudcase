//var hard_settings = require("./../cloudcase-hard-settings");

var fs = require("fs");
var mkdirp = require("mkdirp");

function UploadManager() {
	
};

UploadManager.prototype.load_settings = function ( callback ) {
	function read_callback( err, settingsContent ) {
		var _settings ;
		eval( "_settings = " + settingsContent + ";");	
	 	callback( _settings );
	};
	fs.readFile ( "cloudcase-settings.json" , {encoding: "utf8"} ,  read_callback  );
}

UploadManager.prototype.manage_upload = function ( files, data, model , callback ) {
	console.log("\n\n\n\n\n ################################ \n\n\n\n\nUploadManger.manage_upload().....");
	var self = this;
	var fields = this.get_fieldnames(files);
	
	var filepath = ""; //req.files.file.path;
	var content_type = ""; //req.files.file.headers["content-type"];
	var filename = "";
	var file_extension="";
	var file_index = 0;
	var new_path = "";
	
	var collection_name = data.collection;
	var collection_field = data.collection_field;
	
	var selector = data.selector;
	var options = data.options;
	
	var file_content = null;
	
	var final_dir;// = settings.upload_public_directory + "/" + collection_name + "/" + collection_field;
	var archive_dir;
	var settings;
	 
	function settings_loaded( _settings ) {
		settings = _settings;
		final_dir =     settings.upload_public_directory + "/" + collection_name + "/" + collection_field;
		archive_dir = settings.upload_archives + "/" + collection_name + "/" + collection_field;
		rewrite_files();
	};
	  
	function read_file(file) {
		content_type = file.headers["content-type"];
		filepath = file.path;
		filename = file.name;
		
		console.log( "UPloadMnaager.manage_upload.read_file Temp Path : " + filepath + " fielName: " + file.name);
		file_extension = filename.split(".")[1];
		fs.readFile ( filepath , {encoding: "utf8"} , read_callback );
	};
	
	function read_callback(err, fileContent) {
		if( err )  {
			
		}
		file_content = fileContent;
	 
	 	if( !fs.existsSync ( "public/" + final_dir ) ) { 
	 		mkdirp(   "public/" +  final_dir ,    mkdir_callback );
		}  else {
			 
			
			mkdir_archive();
		}
	};
	
	function mkdir_callback( err ) {
		if(err )  {
			return;
		}
		//write_new_file();
		mkdir_archive();
	};
	
	function mkdir_archive() {
		console.log("UploadManager.manage_upload.mkdir_archive: " + archive_dir );
		if( !fs.existsSync ( archive_dir ) ) { 
	 		mkdirp( archive_dir ,   mkdir_archive_callback );
		}  else {
			write_new_file();
		}
	};
	
	function mkdir_archive_callback ( err ) {
		if(err )  {
			return;
		}
		write_new_file();
	};
	
	
	function write_new_file() {
 		new_path =     final_dir + "/"+ self.string_from_date( new Date() )  + "." + file_extension;
		console.log( "UPloadMnaager.manage_upload.write_new_file PATH " + new_path + " content Type: " +  content_type ); 
		
		//var base64data = file_content.replace("data:" + content_type + ";base64", "" );
		//fs.writeFile( new_path , base64data , "base64", write_callback );
		
		
		 
		
	 
		var regex = /^data:.+\/(.+);base64,(.*)$/;
	 	
		var matches = file_content.match( regex );
		
		var base64_data = file_content;
		fs.writeFileSync("public/" + final_dir + "latest_upload.txt",  new Buffer( base64_data , "binary") );
	
		if( matches ) {
			var ext = matches[1];
			base64_data = matches[2];
			
			var buffer = new Buffer( base64_data , "base64");
			fs.writeFile( "public/" + new_path ,  buffer , write_callback );
		} else {
			
			console.log( "UPloadMnaager.manage_upload.write_callback skip deleting temp: " + filepath );
			console.log("\n\n\n####UPloadManager.write_new_file moving.. " );
			var buffer = new Buffer( file_content , "binary");
			//fs.writeFile("public/" + new_path , buffer , write_callback ) ;
			fs.rename ( filepath ,  "public/" + new_path , write_callback );
		}
	
		
		 
	};
	
	function write_callback( err ) {
		console.log( "UPloadMnaager.manage_upload.write_callback skip deleting temp: " + filepath );
		//fs.unlinkSync( filepath );
		model.find(  selector , options , affected_item_found_callback );
	};
	 
	function affected_item_found_callback(  results ) {
		if( results != null && results.length > 0 ) {
			var  doc = results[0];
			var old_path = doc[collection_field];
			console.log("Collection Field  " + collection_field +  " old path " + old_path );
			if( old_path != null && old_path != "" ) {
				var parts = old_path.split("/");
				var old_name = parts [ parts.length - 1 ];
				var archive_path =   archive_dir + "/" + old_name ;
				console.log("UploadManager.manage_upload.affected_item_found: Archivign... " + archive_path );
				fs.rename ( "public/" + old_path , archive_path ,  save_path_to_collection );
			} else {
				save_path_to_collection(null);
			}
			
		}  else {
			save_path_to_collection(null);
		}
	};
	
	function save_path_to_collection(err) {
		console.log("UploadManager.manage_upload.save_path_to_collection: " + new_path );
		var item = {};
		item[collection_field] =  new_path;
		model.find_and_update( selector, item, options, update_callback );
	};
	
	function update_callback( err, results ) {
		rewrite_files();
	};
	 
	function rewrite_files() {
		if( file_index < fields.length) {
			//do rewrite
			var fieldname = fields[file_index];
			var file = files[fieldname]
			read_file( file ) ;
		} else {
			//rewrite complete
			callback("success");
			return;
		}
		file_index++;
	};
	 
	//rewrite_files();
	this.load_settings( settings_loaded );
};


UploadManager.prototype.get_fieldnames = function( files ) {
	var fields = [];
	for( var i in files) {
		fields.push(i);
	}
	return fields;
};
 
UploadManager.prototype.string_from_date = function ( date ) {
	var year = this.zero_pad( date.getFullYear() , 4 );
	var month = this.zero_pad(date.getMonth() + 1, 2 );
	var day  = this.zero_pad(date.getDate() , 2 );
	
	var hours  = this.zero_pad(date.getHours() , 2 );
	var minutes  = this.zero_pad(date.getMinutes() , 2 );
	var seconds  = this.zero_pad(date.getSeconds() , 2 );
	var milli  = this.zero_pad(date.getMilliseconds() , 3 );
	return "" + year  + "_" + month + "_" + day + "_" +  hours + "_" + minutes + "_" + seconds + "_" +  milli;
};


UploadManager.prototype.zero_pad = function( num, size ) {
	var s = num+"";
    while (s.length < size) s = "0" + s;
    return s;
};

module.exports = new UploadManager();
