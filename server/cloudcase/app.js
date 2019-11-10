
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
 
var http = require('http');
var path = require('path');
var mongodb = require('mongodb');
var app = express();

var MongoStore = require('connect-mongo')(express);
var settings = require('./cloudcase-hard-settings');

var authapp = require('./cloudcase/AppAuthenticate');
 
// all environments 
function configure_app () {
	 
	console.log("Configuring App..");
	app.set('port', process.env.PORT || settings.port );
	app.set('views', __dirname + '/views');
	app.set('view engine', 'jade');
	/* code you clever boy  and remember  cookieParser and session middleware should just after jade */
	app.use(express.cookieParser());
	
	var session_settings = {
		secret: "cloudcase session" ,
		store: new MongoStore({  db:  settings.db, username: settings.db_username, password: settings.db_password } ) 
	}; 
	
	
	app.use(express.session(  session_settings ));
	
	app.use(express.favicon());
	app.use(express.logger('dev'));
	
	app.use(express.bodyParser({ keepExtensions: true, uploadDir: settings.upload_tmp_directory }));  
	app.use(express.limit( settings.request_limit ));
	
	//app.use( authapp.domain_check );
	 
	app.use(express.methodOverride());
	app.use(app.router);
	app.use(express.static(path.join(__dirname, 'public')));
	
	//app.all("*", authapp.authenticate_app);
	 
	// development only
	if ('development' == app.get('env')) {
	  app.use(express.errorHandler());
	}
};


app.configure( configure_app );

app.get('/', routes.index);
 

/*
 * routes controller
 */

var  CCController = require("./cloudcase/Controller");



var cloudcase = new CCController();


var middleware  = [authapp.attach_settings , authapp.authenticate_access , authapp.authenticate_app    ];
 
app.all('/', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  next();
});


app.post('/api/admin_login', middleware , authapp.admin_login );

app.post('/api/signup', middleware  , cloudcase.signup );
app.post('/api/login' ,  middleware  , cloudcase.login);



 
app.post('/api/sync', middleware  , cloudcase.sync );
app.post('/api/update', middleware  , cloudcase.update );
app.post('/api/create' , middleware  , cloudcase.create ) ;
app.post('/api/find' , middleware  , cloudcase.find ) ;

app.post('/api/count' , middleware  , cloudcase.count ) ;


app.post('/api/email' , middleware  , cloudcase.email ) ;
app.post('/api/forgot_password' , middleware  , cloudcase.forgot_password ) ;
 
app.post('/api/delete' , middleware  , cloudcase.remove );
app.post('/api/upload' , middleware  , cloudcase.upload );
app.post('/api/find_and_update' , middleware  , cloudcase.find_and_update ) ;
app.post('/api/import_csv' , middleware  , cloudcase.import_csv ) ;

app.post('/api/join', middleware , cloudcase.join );

app.post('/api/session_save', middleware , cloudcase.save_session_data );
app.post('/api/session_load', middleware , cloudcase.load_session_data );


app.post('/api/admin_logout', middleware , authapp.admin_logout );
app.post('/api/logout' ,  middleware  , authapp.admin_logout);

//get
app.get('/api/get/list', cloudcase.get_list );

// air21 branches
app.get('/api/get/branches', cloudcase.get_air21branches );


var adminManager = require("./cloudcase/AdminManager");
app.post('/api/admin/change_password' ,  middleware  , adminManager.change_password);
app.post('/api/admin/add_admin' ,  middleware  , adminManager.add_admin);



http.createServer(app).listen(app.get('port'), function(){
  
  console.log('Air21: cloudcase server listening on port ' + app.get('port'));
});
