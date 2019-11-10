
function ErrorStacks() {
	this.errors = [];
	this.warnings = [];
};


ErrorStacks.prototype.connectionError = function( connection   ) {
	var msg = "Cannot connect  to database name " + connection + ". Please verify connection by checking the path if any typo errors occur. Or you can verify mongodb database is running."  ;
	this.errors.push ( { code: "datbase_connection_error",  msg:msg   } );
};


ErrorStacks.prototype.authenticateError = function( connection   ) {
	var msg = "Cannot connect  to database name " + connection + " because the databse user and/or password was incorrect."  ;
	this.errors.push ( { code: "datbase_authenticate_error",  msg:msg   } );
};

ErrorStacks.prototype.collectionNameError = function ( collection_name ) {
	var msg = "Collection Name '" + collection_name + "' is not listed on the predefined schema. Please check 'cloudcase_settings.js' to verify schema. And possible collections that you can include on the query."  ;
	this.errors.push ( {  code:"illegal_collection_name", msg:msg   } );
}

ErrorStacks.prototype.dbQueryError = function ( action ,  faultItems , native_errors ) {
	var msg = "It seems like there's a problem during '" + action + "' process for the  items listed on the 'fault_items'. You can also check 'native_errors' for the list of errors that occured during the process.'" ;
	this.errors.push ( {  code:"db_query_error", msg:msg , fault_items: faultItems , native_errors: native_errors  } );
};

ErrorStacks.prototype.deleteWarning = function ( ) {
	var msg = "Warning: 'Delete' action requires a selector.";
	this.warnings.push ( {code : "delete_missing_selector" , msg: msg } );
};

ErrorStacks.prototype.fieldWarning = function ( collection_name , field_name ) {
	var msg = "Warning: The field '" + field_name +  "' is not included on '" + collection_name + "' schema, the field has been removed and has not been included during the insert/update process. Please check the schema to validate the field if it exist or now.";
	this.warnings.push ( {code : "illegal_field" , msg: msg } );
};


ErrorStacks.prototype.signupRequiredFieldsError = function( missing_fields , required_fields ) {
	var msg = "Error: The following field/s '" + missing_fields.join() +  "' is/are needed on the signup process to be successful. The required fields are '" + required_fields.join() + "'.  Or you can check cloudcase-settings.json for the list of required fields and modify it.";
	this.errors.push ( {  code:"signup_missing_fields", msg:msg  , missing_fields : missing_fields, required_fields: required_fields } );
};


ErrorStacks.prototype.signupUniqueFieldsError = function ( fields, fieldsValue , unique_fields ) {
	var msg = "Error: The following field/s '" + fields.join() +  "' is unique and already exist in the database. The unique fields for signup are '" + unique_fields.join() + "'.  Or you can check cloudcase-settings.json for the list of unique fields and modify it.";
	this.errors.push ( {  code:"signup_unique_fields", msg:msg  ,  failed_fields :  fieldsValue , unique_fields: unique_fields } );
};

ErrorStacks.prototype.loginRequiredFieldsError = function( missing_fields , required_fields ) {
	var msg = "Error: The following field/s '" + missing_fields.join() +  "' is/are needed for login/authentication process to be successful. The required fields are '" + required_fields.join() + "'.  Or you can check cloudcase-settings.json for the list of required fields and modify it.";
	this.errors.push ( {  code:"login_missing_fields", msg:msg  , missing_fields : missing_fields, required_fields: required_fields } );
};

ErrorStacks.prototype.loginFailedError = function( login_data   ) { 
	var msg = "Error:  Login Failed, Please verify login credentials.";
	this.errors.push ( {  code:"login_failed", msg:msg  , login_data  : login_data   } );
}

ErrorStacks.prototype.authenticateError = function ( type  ) {
	var reason = "";
	if( type == 1 ) {
		reason = "Reason: Required parameters app_key or app_id is not included on the request.";
	} else if( type == 2 ) {
		reason = "Reason: app_id is not regsitered.";
	} else if(  type == 3 ) {
		reason = "Reason: Incorrect api_key.";
	}
	var msg = "Error: Authentication failed, please verify your app_key and  app_id, if you lost your app_key please create a new one, using the apppkey-create.js.";
	this.errors.push ( {  code:"app_authenticate_failed", msg:msg , reason: reason  } );
};


ErrorStacks.prototype.adminLoginError = function ( type ) {
	var msg = "Error: Admin Login failed, please verify the following reasons. ";
	var reasons = [];
	reasons.push("1. Admin page was hosted on a secure domain or the domain that host the admin page is added on the cloudcase-registry.");
	reasons.push("2. Admin  credential is incorrect, it might be the admin name, password or the admin key. For security reasons we will not tell you what the fault is, just verify the registry .");
	this.errors.push ( {  code:"admin_login_failed", msg:msg , reasons: reasons  } );
};
 
 
ErrorStacks.prototype.guestAccessError = function () {
	var msg = "Error: Illegal guest access. ";
	var reasons = [];
	reasons.push("1. Guest credentials might be incorrect, check the guest_access on cloudcase-settings.js");
	reasons.push("2. Guest might not be allowed to access a particular route, check the guest_allowed_routes on cloudcase-settings.js.");
	reasons.push("3. Guest might not be allowed to access a particular collection, check the guest_allowed_collections on cloudcase-settings.js.");
	this.errors.push ( {  code:"illegal_guest_access", msg:msg , reasons: reasons  } );
};


ErrorStacks.prototype.forgotPasswordNoEmail = function() {
	var msg = "Error: Email is not o not registered in the system.";
	this.errors.push ( {  code:"forgot_password_email_error", msg:msg } );
};

ErrorStacks.prototype.forgotPasswordCannotBeUpdated = function() {
	var msg = "Error: The System cannot create new password at the moment.";
	this.errors.push ( {  code:"forgot_password_failed_update_error", msg:msg } );
};


ErrorStacks.prototype.forgotPasswordMailServer = function() {
	var msg = "Error: The System encountered a mail server error, please retry creating the forgot password process again..";
	this.errors.push ( {  code:"forgot_password_mail_server_error", msg:msg } );
};



module.exports = ErrorStacks;