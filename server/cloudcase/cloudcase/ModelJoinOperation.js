var ModelOperation = require("./../cloudcase/ModelOperation");

function ModelJoinOperation() {
	
};
 
ModelJoinOperation.prototype.execute = function ( model, items , join_collections , callback ) {
	console.log("ModelJoinOperation.execute " );

	var join_index = 0;
	var item_index = 0;
	 var active_item;
	 var main_collection = model.collection_name;
	 var current_collection;
	 
	function next () {
		if( item_index < items.length ) {
			//console.log("ModelJoinOperation.execute.fetch_join.next() " + item_index );
			active_item = items[item_index];
			join_index = 0;
			fetch_join( active_item );		
		} else {
			joining_complete();
		}
	};
	 
	function fetch_join( item ) {
		
		// console.log("ModelJoinOperation.execute.fetch_join :  item: " + JSON.stringify(item , null, 4) ) ;
		if( join_index < join_collections.length ) {
			var join_item =  current_join_item(item);
			current_collection = join_item.collection;
			model.collection_name = join_item.collection;
			model.find(  join_item.find_selector , join_item.options , join_find_callback );
		} else {
			item_index++;
			next();
		}
	};
	
	function current_join_item ( item ) {
		var join_item = join_collections[join_index];
		
		 
		current_collection = join_item.collection;
		//console.log("ModelJoinOperation.execute.current_join_item " + JSON.stringify( join_item ) + " Join Index: " + join_index  );
		join_item.find_selector = create_join_selector( item , join_item.selector );
		return join_item;
	};
	 
	function create_join_selector( item, selector ) {
		var join_selector = {};
		for( var i in selector ) {
			
			
			var field_name = selector[i];
			var value = item [field_name];
			join_selector[i] = value;
			
		 
		}
		
		//console.log("ModelJoinOperation.execute.create Selector " + JSON.stringify( join_selector ) ) ;
		return join_selector;
	};
	 
	function join_find_callback (  results ) {
		//console.log("ModelJoinOperation.execute.join_find_callback copy Results: " + results ) ;
	 	if( results != null && results.length > 0 ) {
	 		//console.log("ModelJoinOperation.execute.join_find_callback copy properties...");
	 		var result_item  = results[0];
	 		copy_properties( active_item , result_item );
	 	 
	 	}
	 	join_index++;
		fetch_join( active_item );
	};
	
	
	function copy_properties(target, source ) {
		for(var i in source ) {
			
			var field_name = current_collection + "_" + i;
			if( i == "_id" ) {
				field_name = current_collection + i;
			}
			 
			if( target[field_name] == null) {
				target[field_name] = source[i];
			}
		}	
	};
	 
	function joining_complete () {
		callback ( items );
	}
	next();
};


module.exports = ModelJoinOperation;