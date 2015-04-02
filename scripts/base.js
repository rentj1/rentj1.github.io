//读/写DOM元素属性
var attribute = {
	
	get: function(elem, attr){
		var val;
		if(elem.currentStyle){
			val = elem.currentStyle[attr];
		}
		else{
			val = getComputedStyle(elem)[attr];
		}
		if(attr === "opacity") {
			val = 100 *  val;
		}
		return val;
	},
	
	set: function(elem, attr, val){
		
		if(attr=='opacity'){
			elem.style.filter = 'alpha(opacity='+ (val) +')';
			elem.style.opacity = (val)/100;
		}
		else{
			elem.style[attr] = val + 'px';
		}
	}
};
var k = 599,i=10;
//动画对象
var effect = {
	
	animate: function(elem, params, fps){
		var fnEnd = params.complete;
		clearTimeout(elem.timer);
		fps = fps || 25;

		setTimeout(function(){					  
			effect.change(elem, params, fnEnd);
			elem.timer = setTimeout(arguments.callee, 1000/fps);
			
		}, 1000/fps );
	},
	
	stop: function(elem){
		clearTimeout(elem.timer);
	},
	
	change: function(elem, params, fnEnd){
		
		var i = 0;
		var attr = null;
		var complete = false;
		var speed = 0;
		for(attr in params){
			
			i = parseFloat(attribute.get(elem, attr)) || 0;
			if(i == params[attr]){
				complete = true;
				break;
			}
			speed = (params[attr] - i)/8;
			speed = ( speed > 0 ) ? Math.ceil(speed) : Math.floor(speed);
			//console.log("i=" + i + "; speed="+ speed+"; s="+s+"; k="+k);
			i += speed;
			
			//console.log(i);
			
			attribute.set(elem, attr, i);
		}
		
		if(complete){
			effect.stop(elem);
			if(fnEnd){
				fnEnd.call(elem);
			}
		}
	}
};
 
