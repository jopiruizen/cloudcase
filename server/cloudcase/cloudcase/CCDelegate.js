

exports.delegate1 = function ( obj , methodName ) {
	function func (param){
		obj[methodName] ( param ) ;
	}
	return func;
};

exports.delegate2 = function ( obj, methodName ) {
	function func ( param1, param2 ) {
		obj[methodName]( param1, param2 );
	}
	return func;
};


exports.func1= function( f ) {
	function func ( p ) {
		f(p);
	};
	return func;
}

exports.func2 = function ( f ) {
	function func ( p1, p2 ) {
		f( p1, p2 );
	}
	return func;
};
