var crypto = require('crypto');

function CloudcaseUtil() {
	
};


CloudcaseUtil.prototype.random_string = function () {
	var num1  =  Math.floor( Math.random() * 10000000 + 1);
	var num2 =  Math.floor( Math.random() *  10000000  + 1);
	return crypto.createHash("md5").update("" + num1 + "" + num2).digest("hex");

};


CloudcaseUtil.prototype.random = function ( size ) {
	return Math.round( Math.random() * size );
};

CloudcaseUtil.prototype.random_range = function( min , max ) {
	var r = this.random( max  - min)  ;
    return Math.round( r ) + min;
};
 

CloudcaseUtil.prototype.random_password = function (min , max ) {
 	var len = this.random_range( min, max );
 	var pass = "";
 	for( var i = 0 ; i < len ; i++ ) {
 		pass += "" + this.random_valid_char() ;
 	};
 	return pass;
};

CloudcaseUtil.prototype.random_valid_char = function() {
	//48 - 57 is 0 - 9
	//97 - 122
	var ranNum = this.random_range( 0, 9);
	var ranChar =this.random_range( 97, 122);
	var ranUChar = this.random_range(65, 90 );
	var choose = this.random_range( 1, 3);
	if( choose == 1) {
		return  "" + ranNum;
	} else if(choose == 2) {
		return String.fromCharCode ( ranChar);
	}
	
	return  String.fromCharCode ( ranUChar);
};


module.exports = new  CloudcaseUtil();
