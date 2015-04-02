//辅助对象，读/写DOM元素属性
var attribute = {
    _: {
        "scrollTop": {
            get: function (elem) {

                if (elem == document) {
                    return Math.max(elem.documentElement.scrollTop, elem.body.scrollTop);
                }

                return elem.scrollTop;
            },

            set: function (elem, val) {
                if (elem == document) {
                    elem.documentElement.scrollTop = elem.body.scrollTop = val;
                } else {
                    elem.scrollTop = val;
                }

            }
        }
    },

    get: function (elem, attr) {
        var val;

        if (attribute._[attr]) {
            return attribute._[attr].get(elem);
        }

        if (elem.currentStyle) {
            if (attr === "opacity") {
                val = elem.filters.alpha[attr];
            } else {
                val = elem.currentStyle[attr];
            }
        }
        else {
            val = getComputedStyle(elem)[attr];
            if (attr === "opacity") {
                val = 100 * val;
            }
        }

        return val;
    },

    set: function (elem, attr, val) {
        if (attribute._[attr]) {
            attribute._[attr].set(elem, val);
            return;
        }

        if (attr == 'opacity') {
            elem.style.filter = 'alpha(opacity=' + (val) + ')';
            elem.style.opacity = (val) / 100;
        }
        else {
            elem.style[attr] = val + 'px';
        }
    }
};

var ajax = {
	
	createXHR: function(){
		
		var xhr = null;
		var iexhr = ["MSXML2.XMLHttp.6.0","MSXML2.XMLHttp.3.0","MSXML2.XMLHttp"];
		if(window.XMLHttpRequest !== undefined){
			xhr = new XMLHttpRequest();
			
		} else if(ActiveXObject !== undefined) {
			
			if(arguments.callee.activeXString) {
				xhr = new ActiveXObject(arguments.callee.activeXString);
			}else {
			
				for(i=0; i<iexhr.length; i++) {
					try{
						xhr = new ActiveXObject(iexhr[i]);
						arguments.callee.activeXString = iexhr[i];
					}catch(ex){
					}
				}
			}
			
		}
		
		return xhr;
	},
	
	get: function(url,callback){
		var xhr = ajax.createXHR();
		callback = callback || new Function;
		xhr.onreadystatechange = function(){
			if(xhr.readyState === 4 ){
				if((xhr.status>=200 && xhr.status<300) || xhr.status == 304){
					//alert(xhr.responseText)
					//alert( xhr.responseXML)
					//alert(xhr.responseType) 
					callback(xhr.responseText);
				} 
			}
		};
		
		xhr.open("get",url, true);
	//	xhr.responseType = "document";
		xhr.send(null);
	}
};

/*
 * 描述: tween动画算法。
 * @param Number t: 动画已经执行的时间（实际上时执行多少次/帧数）
 * @param Number b: 起始位置
 * @param Number c: 终止位置
 * @param Number d: 从起始位置到终止位置的经过时间（实际上时执行多少次/帧数）
 */
var tween = {
	
	//缓入
	easeIn: function (t, b, c, d){
		return c * (t/=d) * t + b;
	},
	
	//缓出
	easeOut: function (t,b,c,d){
		return -c * (t/=d) * (t-2) + b;
	}
	
};

//动画对象
var effect = {
	
	animate: function(elem, params, duration, easing, callback){
		
		var dt = new Date().getTime(),
			b = 0,
			c = 0,
			d = duration || 500,
			fps = 1000/60;
			
		var changes = [];
		
		for(var attr in params){
			b = parseFloat(attribute.get(elem, attr)) || 0;
			c = params[attr] - b;
			
			changes.push({
			    
				attr: attr,
				
				b: b,
				
				c: c
			});
		}
		
		easing = easing || "easeOut";
		callback = callback || new Function;
		setTimeout(function(){			
			var t = new Date().getTime() - dt;
			var b, c, attr;
			for(var i=0; i<changes.length; i++){
				b = changes[i].b;
				c = changes[i].c;
				attr = changes[i].attr;
				//console.log(t,b,c,d)
				attribute.set(elem, attr, tween[easing](t, b, c, d));

				if(d <= t){
					attribute.set(elem, attr, params[attr]);
					callback();
					return;
				}
			}
			
			setTimeout(arguments.callee, fps);
		}, fps);
	}
};
 
