define(function (require, exports) {
var doc = document,
    MILLISECONDS_OF_DAY = 24 * 60 * 60 * 1000,
    encode = encodeURIComponent,
    decode = decodeURIComponent;		 
				 
function isNotEmptyString(val) {
    return (typeof val == 'string') && val !== '';
}				 
				 
//�������󣬶�/дDOMԪ������
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
 * ����: tween�����㷨��
 * @param Number t: �����Ѿ�ִ�е�ʱ�䣨ʵ����ʱִ�ж��ٴ�/֡����
 * @param Number b: ��ʼλ��
 * @param Number c: ��ֹλ��
 * @param Number d: ����ʼλ�õ���ֹλ�õľ���ʱ�䣨ʵ����ʱִ�ж��ٴ�/֡����
 */
var tween = {
	
	//����
	easeIn: function (t, b, c, d){
		return c * (t/=d) * t + b;
	},
	
	//����
	easeOut: function (t,b,c,d){
		return -c * (t/=d) * (t-2) + b;
	}
	
};

//��������
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

var cookie = {

    /**
    * ��ȡcookie
    * 
    * @param {String} name cookie��
    * @return {String}     ��ȡ����cookieֵ
    */
    get: function (name) {
        var ret, m;

        if (isNotEmptyString(name)) {
            if ((m = String(doc.cookie).match(
                      new RegExp('(?:^| )' + name + '(?:(?:=([^;]*))|;|$)')))) {
                ret = m[1] ? decode(m[1]) : '';
            }
        }
        return ret;
    },

    /**
    * ����cookie
    * 
    * @param {String}      name     cookie��
    * @param {String}      val      cookieֵ
    * @param {Number|Date} expires  ����ʱ�䡣��λΪ�졣
    * @param {String}      domain   ��
    * @param {String}      path     ·��
    * @param {Boolean}     secure   ��ȫ����
    */
    set: function (name, val, expires, domain, path, secure) {
        var text = String(encode(val)), date = expires;

        // �ӵ�ǰʱ�俪ʼ������������
        if (typeof date === 'number') {
            date = new Date();
            date.setTime(date.getTime() + expires * MILLISECONDS_OF_DAY);
        }
        // expiration date
        if (date instanceof Date) {
            text += '; expires=' + date.toUTCString();
        }

        // domain
        if (isNotEmptyString(domain)) {
            text += '; domain=' + domain;
        }

        // path
        if (isNotEmptyString(path)) {
            text += '; path=' + path;
        }

        // secure
        if (secure) {
            text += '; secure';
        }

        doc.cookie = name + '=' + text;
    },

    /**
    * ɾ��cookie
    * @param {String} name    cookie��
    * @param {String} domain  ��
    * @param {String} path    ·��
    * @param {String} secure  ��ȫ����
    */
    remove: function (name, domain, path, secure) {
        cookie.set(name, '', -1, domain, path, secure);
    }
};


var tool = {
	
    //�˷���Ϊ�˱����� ms ��ʱ���ڣ����ִ��func������ resize��scoll��mousemove���������¼���
    buffer: function (func, ms, context) {
        var buffer;
        return function () {
            if (buffer) return;

            buffer = setTimeout(function () {
                func.call(this)
                buffer = undefined;
            }, ms);
        };
    },

    /*��ȡ������Ԫ�ص�͸����*/
    opacity: function (elem, val) {
        var setting = arguments.length > 1;
        if ("opacity" in elem.style) {//elem.style["opacity"] ��ȡ����CSS class�е�ֵ
            return setting ? elem.style["opacity"] = val : elem.style["opacity"];
        } else {
            if (elem.filters && elem.filters.alpha) {
                return setting ? elem.filters.alpha["opacity"] = val * 100 : elem.filters.alpha["opacity"] / 100;
            }
        }
    },

    //��ȡ�������ĵ������scrollTop
    //function([val])
    documentScrollTop: function (val) {
        var elem = document;
        return (val !== undefined) ?
            elem.documentElement.scrollTop = elem.body.scrollTop = val :
            Math.max(elem.documentElement.scrollTop, elem.body.scrollTop);

    },

    //function (elem) ��ȡelem��ҳ���е�����
    //return {top:xxx,left:xxx}

    offset: function (elem) {
        var top, left;
        if (!(elem && elem.offsetTop)) return null;

        top = elem.offsetTop;
        left = elem.offsetLeft;
        while (elem = elem.offsetParent) {

            top += elem.offsetTop;
            left += elem.offsetLeft;
        }

        return { top: top, left: left };
    },

    get: function (id) {
        return document.getElementById(id);
    },

    addEventListener: function (elem, type, handel) {
        if (elem.addEventListener) {
            elem.addEventListener(type, handel, false);
        } else {
            elem.attachEvent("on" + type, function () {
                handel.call(elem, window.event);
            });
        }
    }
};

 var Event = function(){

	function contains(a, b){
		try{
			return a.contains ? a != b && a.contains(b) : !!(a.compareDocumentPosition(b) & 16);
		}catch(e){}
		 
	}
	
    function addListener(elem, type, listener){
		
        function fun(e){
            var currentTarget = e.currentTarget, 
				relatedTarget = e.relatedTarget;
				
            if(!contains(currentTarget, relatedTarget) && currentTarget != relatedTarget){
                listener.call(currentTarget, e);
            }   
        } 
		
        if(elem.addEventListener){
            if(type == 'mouseenter'){                 
                elem.addEventListener('mouseover', fun, false);                   
            }else if(type == 'mouseleave'){
                elem.addEventListener('mouseout', fun, false);
            }else{
                elem.addEventListener(type, listener, false);
            }
        }else{
            elem.attachEvent('on' + type, listener);
        }
    }   
	
	
    return { 
	
		addListener: addListener 
				
	};
	
}();

//selector
(function () {

    var factory = {

        create: function (selector) {
            var simple = /^[\w\-_#]+$/;
            if (simple.test(selector)) {
                return new simple(selector);
            }
        }
    };
    function realArray(c) {

        /**
        * Transforms a node collection into
        * a real array
        */

        try {
            return Array.prototype.slice.call(c);
        } catch (e) {
            var ret = [], i = 0, len = c.length;
            for (; i < len; ++i) {
                ret[i] = c[i];
            }
            return ret;
        }

    }

    function filterByAttr(collection, attr, regex) {

        /**
        * Filters a collection by an attribute.
        */

        var i = -1, node, r = -1, ret = [];

        while ((node = collection[++i])) {
            if (regex.test(node[attr])) {
                ret[++r] = node;
            }
        }

        return ret;
    }

    function SimpleSelector(selector) {
        this.selector = selector;
    }

    SimpleSelector.prototype = {

        query: function (context) {

            var pattern = {
                className: /^(?:[\w\-_]+)?\.([\w\-_]+)/,
                id: /^(?:[\w\-_]+)?#([\w\-_]+)/,
                tag: /^([\w\*\-_]+)/
            };
            var selector = this.selector,
				id = selector.macth(pattern["id"])[1],
				className = !id && selector.macth(pattern["className"])[1],
				tag = !id && selector.macth(pattern["tag"])[1],
				collection = [];

            context = context || document;
            if (id) {
                return context.getElementById(id);
            } else if (className && context.getElementsByClassName) {
                collection = realArray(context.getElementsByClassName(className));
            } else {
                collection = realArray(context.getElementsByTagName(tag || "*"));
                if (className) {
                    collection = filterByAttr(collection, 'className', RegExp('(^|\\s)' + className + '(\\s|$)'));
                }
            }
            return collection;
        }
    };

    var dom = {

        get: function (selector, context) {
            var dom = factory.create(selector)
            return dom.query(context);
        }
    };

})();

function wrap(elem) {
    return new DomWrap(elem);
}

function DomWrap(elem) {
    this.core = tool;
    this.dom = elem;
}

DomWrap.prototype = {
    on: function (type, handel) {
        this.core.addEventListener(this.dom, type, handel);
    }
};

 //cmd
 exports.attribute = attribute;
 exports.ajax = ajax;
 exports.effect = effect;
 exports.cookie = cookie;
 exports.tool = tool;
 exports.Event = Event;
 exports.wrap = wrap;	  
});