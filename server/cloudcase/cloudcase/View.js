function View() {
	
}

View.prototype.render = function ( res, obj ) {
	if( obj.success != false ) {
		obj.success = true;
	}
	res.end ( JSON.stringify( obj , null, 4 ) );
	
};

View.prototype.will_render_create = function ( res , obj ) {
	this.render ( res, obj)
}

View.prototype.will_render_find = function ( res,  obj ) {
	this.render( res, obj);
};
 
View.prototype.will_render_update = function( res , obj ) {
	this.render( res, obj );
}; 
 
View.prototype.will_render_remove = function ( res, obj ) {
	this.render ( res, obj );
};

 
View.prototype.will_render_sync = function ( res, obj ) {
	this.render( res, obj );
};
 



module.exports = View;
