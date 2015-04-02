(function (ns) {
	/*
		//tagName
		console.log(dom.get("p"));
		
		//#id
		console.log(dom.get("#div"));
		
		//.class
		console.log(dom.get(".span", document.body));
		
		//tag.class
		console.log(dom.get("div.span"));
		
		//#id .class
		console.log(dom.get("#div .span"));
	
		//.class .class
		console.log(dom.get(".ul .li-test"));
	*/
	
	var doc = document;

    var Factory = {
		
		//根据查询选择符创建相应选择器对象
        create: function (query) {
			
			var selector;
			
            if (IDSelector.test(query)) {
                selector = new IDSelector(query);
            } else if (ClassSelector.test(query)) {
                selector = new ClassSelector(query);
            } else {
                selector = new TagSelector(query);
            }
			
			return selector;
        },
		
		singleton: function(){
			
			return ns.dom || ( ns.dom = {});
			
		}
    };
	
	var api = Factory.singleton(); 
	api.get = function (query, context) {
		
		var simple = /^(?:#|\.)?([\w-_]+)/;
		
		context = context || doc;
		
		//调用原生选择器
		if(!simple.test(query) && context.querySelectorAll){
			return context.querySelectorAll(query);
		}else {
			//调用自定义选择器
			return interpret(query, context);
		}
		
    };
	
	//解释执行dom选择符
	function interpret(query, context){
		
        var parts = query.replace(/\s+/, " ").split(" ");
        var part = parts.pop();
        var selector = Factory.create(part);
    	var ret = selector.find(context);
		
		return (parts[0] && ret[0]) ? filter(parts, ret) : ret;
	}
    
	//ID选择器
    function IDSelector(id) {
		this.id = id.substring(1);
    }
    IDSelector.prototype = {
		
        find: function (context) {
            return document.getElementById(this.id);
        },
		
		match: function(element){
			return element.id == this.id;
		}
	
	};
    IDSelector.test = function (selector) {
		
	   var regex = /^#([\w\-_]+)/;   
	   
       return regex.test(selector);
	   
    };
   	
	//元素选择器
    function TagSelector(tagName) {
		this.tagName = tagName.toUpperCase();
    }
	TagSelector.prototype = {
		
        find: function (context) {
            return context.getElementsByTagName(this.tagName);
			
        },
		
		match: function(element){
			return this.tagName == element.tagName.toUpperCase() || this.tagName === "*";
		}
	};
    TagSelector.test = function (selector) {
		var regex = /^([\w\*\-_]+)/;
        return regex.test(selector);
    };
	
	//类选择器
    function ClassSelector(className) {
		var splits = className.split('.');
		
		this.tagName = splits[0] || undefined ;
		this.className = splits[1];
    }
	ClassSelector.prototype = {
		
		find: function (context) {
			var elements;
			var ret = [];
			var tagName = this.tagName;
			var className = this.className;
			var selector = new TagSelector((tagName || "*"));
			
			//支持原生getElementsByClassName
            if (context.getElementsByClassName) {
                elements = context.getElementsByClassName(className);
				if(!tagName){
					return elements;
				}
				for(var i=0,n=elements.length; i<n; i++){
					if( selector.match(elements[i]) ){
						ret.push(elements[i]);
					} 
				}

			} else {
				elements = selector.find(context);
				for(var i=0, n=elements.length; i<n; i++){
					if( this.match(elements[i]) ) {
						ret.push(elements[i]);
					}
				}
		  }
		  
		  return ret;
			
        },
		
		match: function(element){
			var className = this.className;
			var regex = new RegExp("^|\\s" + className + "$|\\s");
			return regex.test(element.className);
		}
	
	};
    ClassSelector.test = function (selector) {
		var regex = /^([\w\-_]+)?\.([\w\-_]+)/;
		
        return regex.test(selector);
    };
	
	//TODO:属性选择器
	function AttributeSelector(attr){
		
		this.find = function(context){
		
		};
		
		this.match = function(element){
		
		};
		
	}
	
	AttributeSelector.test = function (selector){
		var regex = /\[([\w\-_]+)(?:=([\w\-_]+))?\]/;
		return regex.test(selector);	
	};
	
	//根据父级元素过滤
	function filter(parts, nodeList){
		var part = parts.pop();
		var selector = Factory.create(part);
		var ret = [];
		var parent;
		
		for(var i=0, n=nodeList.length; i<n; i++){
			parent = nodeList[i].parentNode;
			while(parent && parent !== doc){	
				if(selector.match(parent)){
					ret.push(nodeList[i]);
					break;
				}
				parent = parent.parentNode;
			}
		}
		
		return parts[0] && ret[0] ? filter(parts, ret) : ret;
	}

	

}(this));
