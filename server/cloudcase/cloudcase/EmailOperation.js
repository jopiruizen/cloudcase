var crypto = require('crypto');
var ModelOperation = require("./../cloudcase/ModelOperation");
var nodemailer = require('nodemailer');

function EmailOperation() {
	
	
	
};

EmailOperation.prototype = new ModelOperation();
EmailOperation.prototype.execute = function ( model, settings, mongodb , callback , params ) {
	 var self = this;
	this.init( model, settings, mongodb, callback, params );
 
	var mailOpts , smtpConfig;
 	var mailAuth =   { user: params.email , pass:  params.pass };
	
	var mailOpts = {
		from: params.email,
		to: params.mailto,
		subject: params.subject,
		text: params.message
	};
	/*
	console.log("Mail opts "+  JSON.stringify( mailOpts , null, 4 ) );
	console.log("Mail Auth "+  JSON.stringify( mailAuth , null, 4 ) );
	*/
	
	function email_callback( err, response ) {
		if( err ) {
			self.callback( err );
			 
		} else {
			self.callback( null);	
		}
		
	};
	
	smtpConfig = nodemailer.createTransport( params.transport , {  service: params.server   , "auth": mailAuth   } );
	smtpConfig.sendMail ( mailOpts , email_callback);
 
};

module.exports = EmailOperation;