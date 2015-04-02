var Class = function(){
	
	var _class = function(){
		this.init.apply(this, arguments)
	};
	
	_class.prototype.init = Function();
	
	//定义prototype别名
	_class.fn = _class.prototype;
	
	//定义类别名
	_class.fn.parent = _class;
	_class.extend = _class.fn.extend = function(obj){
		var extended = obj.extended;
		for(var i in obj){
			this[i] = obj[i];
		}
		if(extended) extended(_class);
	}
	
	return _class;
	
}


var xQuery = new Class;
//======================================

//添加静态成员
xQuery.extend({

			  
});

//添加实例成员
xQuery.fn.extend({
				 
});



