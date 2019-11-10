var crypto = require('crypto');
var ModelOperation = require("./../cloudcase/ModelOperation");
var randomUtil = require("./../cloudcase/CloudcaseUtil");
var nodemailer = require('nodemailer');

function ForgotPasswordOperation() {
	
};

ForgotPasswordOperation.prototype = new ModelOperation();

ForgotPasswordOperation.prototype.execute = function ( model, settings, mongodb , callback , params ) {
	var self = this;
	this.init( model, settings, mongodb, callback, params );
	
	var mail_settings = this.settings.emails.forgot_password;
	var mailOpts , smtpConfig;
 	var mailAuth =   { user:  mail_settings.user , pass:  mail_settings.pass};
 	
 	this.model.collection_name = settings.signup_collection;
 	 
 	var new_password = randomUtil.random_password(8,10);
 	
 	var account;
 	mailOpts  = {
 		from: mail_settings.user,
 		to: params.email,
 		subject: mail_settings.subject
 	};
 	
 	smtpConfig = nodemailer.createTransport( mail_settings.transport, {  service:  mail_settings.server , "auth": mailAuth   } );
 	
 	function connect_callback() {
 		self.collection.find( { email: params.email } ).toArray( find_callback ) ;
 	};
 	
 	function find_callback(err, results ) {
 	 
 		if ( results != null &&  results[0] != null  ) {
 			//update password
 			account = results[0];
 			var enc_pass = encrypt( new_password ) ;
 			var item = {};
 		 	item[mail_settings.password_field]= enc_pass;
 		 	console.log("ForgotPasswordOperation.find_callback() " + account._id + " emaiL: " + account.email )
 		 	console.log("New Password is "  + new_password + " encoded: " + enc_pass );
 		 	
 		 	self.collection.update( account, {$set:item}, password_updated ) ;
 		 	
 		} else {
 			
 			 self.model.errorStack.forgotPasswordNoEmail();
 			callback(  false);
 		}
 	};
 	 
 	function password_updated( err, results ) {
 		if(err == null ) {
 			email_password();
 		} else {
 			 self.model.errorStack.forgotPasswordCannotBeUpdated();
 			callback(  false);
 		}
 	};
 	
 	function greet_name(){
 		var name = "";
 		var fields = mail_settings.name_fields;
 		for( var i = 0 ; i <  fields.length ; i++ ) {
 			var field = fields[i];
 			name += "" + account[field] + " ";
 		};
 		return name;
 	};
 	
 	
 	function email_password() {
 		console.log("ForgotPasswordOperation.email_password()");
 		var name = greet_name();
 		var mail = mail_settings;
 		mailOpts.text =  "" + mail.body_greetings + " " + greet_name() + "\n\n" + mail.body_header + "\n\n" + new_password + "\n\n" + mail.body_footer  + "\n\n" + mail.body_closing  ; 
 	    smtpConfig.sendMail ( mailOpts , email_callback);
 	};
 	
 	function email_callback(error, response) {
 	
 		if (error) {
			 self.model.errorStack.forgotPasswordMailServer();
			 callback(  false);
			 
			console.log("sending email error "+ error );
		} else {
			callback( true );
		}
		
 	}
 	
 	function encrypt( password ) {
 		return  crypto.createHash('md5').update( password ).digest("hex");
 	};
	
	
	function random_length() {
		
	};
 	
 	this.operation = connect_callback;
	this.callback = callback;
	this.connect();
 	
};

module.exports = ForgotPasswordOperation;