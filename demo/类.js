var Class = function(){
	
	var _class = function(){
		this.init.apply(this, arguments)
	};
	
	_class.prototype.init = Function();
	
	//����prototype����
	_class.fn = _class.prototype;
	
	//���������
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

//��Ӿ�̬��Ա
xQuery.extend({

			  
});

//���ʵ����Ա
xQuery.fn.extend({
				 
});



