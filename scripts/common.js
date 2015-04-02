/*libirary*/
var doc = document,
    MILLISECONDS_OF_DAY = 24 * 60 * 60 * 1000,
    encode = encodeURIComponent,
    decode = decodeURIComponent;

function isNotEmptyString(val) {
    return (typeof val == 'string') && val !== '';
}

var cookie = {

    /**
    * 读取cookie
    * 
    * @param {String} name cookie名
    * @return {String}     获取到的cookie值
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
    * 设置cookie
    * 
    * @param {String}      name     cookie名
    * @param {String}      val      cookie值
    * @param {Number|Date} expires  过期时间。单位为天。
    * @param {String}      domain   域
    * @param {String}      path     路径
    * @param {Boolean}     secure   安全传输
    */
    set: function (name, val, expires, domain, path, secure) {
        var text = String(encode(val)), date = expires;

        // 从当前时间开始，多少天后过期
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
    * 删除cookie
    * @param {String} name    cookie名
    * @param {String} domain  域
    * @param {String} path    路径
    * @param {String} secure  安全传输
    */
    remove: function (name, domain, path, secure) {
        cookie.set(name, '', -1, domain, path, secure);
    }
};

function iload(html, onload, onwrite) {
    var iframe = document.createElement("iframe");
    iframe.style.cssText = "position:absolute; display:none;";
    document.body.appendChild(iframe);

    if (iframe.attachEvent) {
        iframe.attachEvent("onload", function () {
            iframe.parentNode.removeChild(iframe);
            onload();
        });
    } else {
        iframe.onload = function () {
            iframe.parentNode.removeChild(iframe);
            onload();
        };
    }

    iframe.contentWindow.document.open();
    iframe.contentWindow.document.write(html);
    if (onwrite) {
        onwrite(iframe.contentWindow.document);
    }
    iframe.contentWindow.document.close();

}

var tool = {
    //此方法为了避免在 ms 段时间内，多次执行func。常用 resize、scoll、mousemove等连续性事件中
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

    /*读取或设置元素的透明度*/
    opacity: function (elem, val) {
        var setting = arguments.length > 1;
        if ("opacity" in elem.style) {//elem.style["opacity"] 读取不到CSS class中的值
            return setting ? elem.style["opacity"] = val : elem.style["opacity"];
        } else {
            if (elem.filters && elem.filters.alpha) {
                return setting ? elem.filters.alpha["opacity"] = val * 100 : elem.filters.alpha["opacity"] / 100;
            }
        }
    },

    //获取或设置文档对象的scrollTop
    //function([val])
    documentScrollTop: function (val) {
        var elem = document;
        return (val !== undefined) ?
            elem.documentElement.scrollTop = elem.body.scrollTop = val :
            Math.max(elem.documentElement.scrollTop, elem.body.scrollTop);

    },

    //function (elem) 获取elem在页面中的坐标
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


/*公用组件*/

(function (ns) {

    //JS分页导航
    /*
    var pagenav = new PageNavigation("container", 6);
    pagenav.onchange = function(i){
    alert(i)
    }
    pagenav.nav(1)
    pagenav.render();
    */

    function PageNavigation(container, pagecount) {

        var get = function (id) {
            return document.getElementById(id);
        };

        var _this = this;

        _this.container = get(container);
        _this.nextpage = get("nextpage");
        _this.prepage = get("prepage");
        _this.pagecount = pagecount || 0;
        _this.container.onclick = function (event) {

            event = event || window.event;
            var target = event.target || event.srcElement;
            var page = target.getAttribute("data-page");
            var controlid = target.getAttribute("data-get");
            var property = target.getAttribute("data-property");

            if (controlid && property) {//转到

                page = get(controlid)[property];
            }

            if (page !== null && !isNaN(page)) {
                _this.change(page);
            }
        };

    }
    //根据UI 设置config
    PageNavigation.prototype.config = {

        itemscount: 5,
        disable: "<span>{$text}</span>",
        nextpage: " <span><a href=\"javascript:void(null)\"  data-page='{$nextpage}' >下一页</a></span> ",
        prepage: " <span><a href=\"javascript:void(null)\" data-page='{$prepage}'>上一页</a></span> ",
        pageitem: " <a href=\"javascript:void(null)\" data-page='{$num}'>{$num}</a> ",
        current: "<span class='current'>{$num}</span>",
        firstpage: "<a data-page='1'>1</a><span class='page-break'>...</span>",
        lastpage: "<span class='page-break'>...</span><a data-page='{$pagecount}'>{$pagecount}</a>",
        gopage: '转到<input type="text" value="{$num}" id="pagenum"/>页 ' +
                    '<input type="button" data-get="pagenum" data-property="value" value="Go"/>'
    };

    PageNavigation.prototype.change = function (num) {
        var _this = this;
        if (!isNaN(num)) {
            _this.listitems = [];
            _this.nav(parseInt(num));
            _this.render();
        }
        _this.onchange(num);
        _this.pageChange(num); /*?*/

    };

    PageNavigation.prototype.reset = function () {
        this.listitems = [];
        this.prepage = false;
        this.firstpage = false;
        this.nextpage = false;
        this.lastpage = false;
    };

    //回调函数
    PageNavigation.prototype.onchange = new Function();
    PageNavigation.prototype.pageChange = new Function(); /*?*/

    //分页逻辑
    PageNavigation.prototype.nav = function (n) {
        var startpagenum = 1, endpagenum = this.pagecount, length = (this.config.itemscount - 1) / 2;
        this.reset();
        if (n < 1) n = 1;
        if (n > this.pagecount) n = this.pagecount;
        if (n !== 1) {
            this.prepage = this.config.prepage;
            if (n - length > 1) {
                startpagenum = n - length;
                this.firstpage = this.config.firstpage;
            }

            for (var i = startpagenum; i < n; i++) {
                this.listitems.push(this.createPageItem(i));
            }
        }
        this.listitems.push(this.createCurrentItem(n));
        if (n !== this.pagecount) {
            this.nextpage = this.config.nextpage;
            length = this.config.itemscount - this.listitems.length;
            if (n + length < this.pagecount) {
                endpagenum = n + length;
                this.lastpage = this.config.lastpage;
            }

            for (var i = n + 1; i <= endpagenum; i++) {
                this.listitems.push(this.createPageItem(i));
            }
        }
        this.page = n;
    };

    PageNavigation.prototype.render = function () {

        var listitems = this.listitems.join("");
        var nextpage = this.nextpage;
        var prepage = this.prepage;
        var gopage = this.config.gopage || "";

        var html = [];

        if (!prepage) {
            prepage = this.config.disable.replace(/\{\$text\}/g, "上一页");
        }
        html.push(prepage.replace(/\{\$prepage\}/g, this.page - 1));

        if (this.firstpage) {
            html.push(this.firstpage);
        }

        html.push(listitems);

        if (this.lastpage) {
            html.push(this.lastpage.replace(/\{\$pagecount\}/g, this.pagecount));
        }

        if (!nextpage) {
            nextpage = this.config.disable.replace(/\{\$text\}/g, "下一页");
        }

        html.push(nextpage.replace(/\{\$nextpage\}/g, this.page + 1));

        html.push(gopage.replace(/\{\$num\}/g, this.page));

        if (this.container) {
            this.container.innerHTML = html.join("");
        }
        return html.join("");

    };

    PageNavigation.prototype.createPageItem = function (i) {
        return this.config.pageitem.replace(/\{\$num\}/g, i);
    };

    PageNavigation.prototype.createCurrentItem = function (i) {
        return this.config.current.replace(/\{\$num\}/g, i);
    };

    ns.PageNavigation = PageNavigation;
} (this));


//Waterfall
(function (ns, dom) {//dom:DomWrap
    //静态私有成员
    var viewportHeight = document.documentElement.clientHeight;
    var minHeight = 0;
    var columnCount = 4;
    var columnWidth = 225 + 20;
    var cloumns = [];
    var waterfall = "";
    var staticElems = [];
    var baseTop = 0;
    var appendCount = 0;
    var marginBottom = 10;
    var data = {};

    //初始化
    function init(container, callback) {
        waterfall = tool.get(container);
        staticElems = waterfall.children;
        baseTop = tool.offset(waterfall).top;
        for (var i = 0; i < columnCount; i++) {
            cloumns[i] = { index: i, height: 0 };
        }
        data.get = callback;
		
		if(staticElems[0].className.indexOf("sidenav") > -1){
        	staticElems[0].style.display = "block";
			cloumns[0].height = staticElems[0].offsetHeight + marginBottom;
		}
        minHeight = cloumns[0].height;
        waterfall.style.height = cloumns[0].height + "px";
        waterfall.style.width = ((columnWidth * columnCount) - 20) + "px";
        dom(window).on("scroll", tool.buffer(onscroll, 500));
        //position(staticElems);
    }

    function reset(elem, frist) {
        for (var i = 0; i < columnCount; i++) {
            cloumns[i] = { index: i, height: 0 };
        }

        if (frist) {
            cloumns[0].height = frist + marginBottom;
        }
       
        imgload(elem, true);
    }

    //设置元素位置
    function position(elems, append) {
        var left, top, cssText;
        var appedElem = null;
        var sortedCloumns = [];
        for (var i = 0, n = elems.length; i < n; ) {
            if (!(elems[i] && elems[i].nodeType === 1)) continue;
            cloumns.sort(function (x, y) { return x.height - y.height });
            index = cloumns[0].index;
            left = index * columnWidth
            top = cloumns[0].height;
            cssText = "display:block; position:absolute; left:" + left + "px; top:" + top + "px";
            elems[i].style.cssText = cssText;

            if (append) {
                apendItem = elems[i];
                waterfall.appendChild(apendItem);
                cloumns[0].height += apendItem.offsetHeight + marginBottom;
                console.log(cloumns[0].height)
                n--;

            } else {
                cloumns[0].height += elems[i].offsetHeight + marginBottom;
                i++;
            }
        }
        cloumns.sort(function (x, y) { return x.height - y.height });
        minHeight = cloumns[0].height;
        waterfall.style.height = cloumns[cloumns.length - 1].height + "px";
    }

    function appendItem() {

        data.get(function (html) {
            iload(html, Function(), function (doc) {
                imgload(doc.body, true);
            });
        });

    }

    function onscroll() {
        var scrollTop = tool.documentScrollTop();
        if (scrollTop + viewportHeight > baseTop + minHeight) {
            //console.log("loading");
            appendItem();
        }
    }

    function getItemByImg(img) {
        var elem = img;
        while (elem && (elem = elem.parentNode)) {
            if (elem.className.indexOf("item") !== -1) {
                return elem;
            }
        }
        return null;
    }


    function LoadQueue() {

        this.queue = [];

        this.add = function (elem) {

            var _this = this;
            var item_ = getItemByImg(elem);
            if (!item_) return;

            elem.index = this.queue.length;
            waterfall.appendChild(item_);


            this.queue[this.queue.length] = function () {

                if (elem.complete) {
                    _this.position(item_);
                    //_this.queue.splice(elem.index, 1);
                    return;
                }

                elem.onload = function () {

                    _this.position(item_);

                };
            };
        };

        this.exe = function () {

            var loadItem = Function();

            while (loadItem = this.queue.shift()) {
                loadItem();
            }
        };
    }

    LoadQueue.prototype = {

        //设置元素位置
        position: function (elem) {
            var left, top, cssText, index;
            var sortedCloumns = [];
            if (!(elem && elem.nodeType === 1)) return;

            cloumns.sort(function (x, y) { return x.height - y.height });
            index = cloumns[0].index;
            left = index * columnWidth;
            top = cloumns[0].height;
            cssText = "display:block; position:absolute; left:" + left + "px; top:" + top + "px";
            elem.style.cssText = cssText;
            cloumns[0].height += elem.offsetHeight + marginBottom;
            cloumns.sort(function (x, y) { return x.height - y.height });
            minHeight = cloumns[0].height;
            waterfall.style.height = cloumns[cloumns.length - 1].height + "px";
        }
    };

    function imgload(container, append) {
        var elems = (container || waterfall).getElementsByTagName("img");
        var queue = new LoadQueue();
        for (var i = 0; i < elems.length;) {
            if (append) {
                queue.add(elems[i]);
                continue;
            }
            if (elems[i].complete) {
                position([getItemByImg(elems[i])]);
                 i++;
                continue;
            }

            elems[i].onload = function () {
                position([getItemByImg(this)]);
            }
            i++;
        }
        queue.exe();

    }

    ns.watferfall = init;
    ns.watferfall.reset = reset;
    ns.watferfall.load = imgload;

} (window, wrap));


//返回顶部
(function (ns, dom) {

    //gotop
    var visible = false, elem, animate = false;

    function init(id) {
        elem = document.getElementById(id);
        elem.onclick = onclick;
        dom(window).on("scroll", tool.buffer(onscroll, 300, this));
    }

    function complete(){
        animate = false;
    
    }

    function onscroll() {
        var scrollTop = tool.documentScrollTop();
        if (animate) return;

        if (scrollTop > 10) {
            if (!visible) {
                visible = true;
                animate = true;
                effect.animate(elem, { opacity: 100 }, 300, "easeIn",complete)

            }
        } else {
            if (visible) {
                visible = false;
                animate = true;
                effect.animate(elem, { opacity: 0 }, 300, "easeIn",complete )
            }
        }

    }

    function onclick() {
        animate = true;
        attribute.set(document,"scrollTop", 0);
        animate = false;;
       // effect.animate(document, { scrollTop: 0 },1000, "easeOut", complete);
    }

    ns.gotop = init;

})(window, wrap);

(function (ns, dom) {

    function navbar(id) {

        var element = document.getElementById(id);
        var more = document.getElementById('more');
        var dorpdown = document.getElementById('dorpdown');
        var visible = false;

        more.onmouseover = function () {
            dorpdown.style.display = 'block';
        };

        dorpdown.onmouseover = function () {
            dorpdown.style.display = 'block';
        };

        more.onmouseout = function () {
            dorpdown.style.display = 'none';
        };
        dorpdown.onmouseout = function () {
            dorpdown.style.display = 'none';
        };

        function onscroll() {
            var scrollTop = tool.documentScrollTop();
            if (scrollTop > 548) {
                if (!visible) {
                    effect.fadein(element);
                    visible = true;
                }
            } else {
                if (visible) {
                    effect.fadeout(element);
                    visible = false;
                }
            }
        }

        dom(window).on("scroll", tool.buffer(onscroll, 200, this));
    }
    ns.navbar = navbar;
})(window, wrap);

var pageNavTemplate = {

    itemscount: 5,

    firstpage: '<a data-page="1">1</a>...',

    lastpage: '...<a data-page="{$pagecount}">{$pagecount}</a>',

    disable: '<span class="disable">{$text}</span>',

    nextpage: '<a data-page="{$nextpage}" >下一页</a>',

    prepage: '<a data-page="{$prepage}">上一页</a>',

    pageitem: '<a data-page="{$num}">{$num}</a>',

    current: '<span class="current">{$num}</span>'

    //gopage: ' 转到 <input type="text" value="{$num}" class="num" id="pagenum"/> 页 ' +
    //'<b type="button" data-get="pagenum" data-property="value" class="go" id="page-go"></b>'
};
PageNavigation.prototype.config = pageNavTemplate;


function getStyle(obj, attr) {
    if (obj.currentStyle) {
        return obj.currentStyle[attr];
    }
    else {
        return getComputedStyle(obj)[attr];
    }
}

//焦点图切换控件
(function (ns) {
    //rentj1@163.com	  
    var left = 0;
    var width = 715;
    var active = 0;
    var slide, options, timer, length;

    //绑定事件
    var onchange = function (index) {
        //动画代码

        (index === undefined) ? left -= width : left = -(index * width);
        if (Math.abs(left) > (options.length - 1) * width) {
            left = 0;
        }

        effect.animate(slide, { left: left }, 300, "easeIn", function () {

            options[active].className = "";
            active = Math.abs(left / width);
            options[active].className = "select";

        });
    }


    function slide() {
        slide = document.getElementById("slide-content");
        options = document.getElementById("slide-options").getElementsByTagName("li");
        length = options.length;
        slide.style.width = (width * options.length) + "px";
        timer = setInterval(onchange, 3000);
        for (var i = 0; i < length; i++) {

            (function (i) {

                options[i].onmouseover = function () {
                    //alert(i)
                    clearInterval(timer);
                    onchange(i);
                };

                options[i].onmouseleave = function () {
                    timer = setInterval(onchange, 3000);

                };

            })(i);
        }
    }
    ns.slide = slide;
} (window));


//工具条
(function () {

    var toolbar = tool.get("toolbar");
	var number = tool.get("number");
    var extend = false;
    var text = {
        close: "<",
        extend: ">"
    };
	
    var controls = {

        "side": function (elem) {
            if (extend) {
                effect.animate(toolbar, { right: -165 });
                elem.innerHTML = text.close;
            } else {
                effect.animate(toolbar, { right: 0 });
                elem.innerHTML = text.extend;
            }
            extend = !extend;
        },

        "top": function () {

            window.scrollTo(0, 0);
        },

        pre: function () {
            history.go(-1);
            setTimeout(function(){
               
				setNumber();
            },500);
           
        },

        next: function () {
            history.go(1);
            setTimeout(function(){
				setNumber();
            },500);
        }
    };

    toolbar && (toolbar.onclick = function (e) {
        var action;
        e = e || window.event;
        action = e.target || e.srcElement;
        // alert(action.getAttribute("data-action"))
        controls[action.getAttribute("data-action")] && controls[action.getAttribute("data-action")](action);

    });
	
	function setNumber(){
		if(!number) return;
		number.innerHTML = location.hash.split("/")[2];
	}

	window.onhashchange = setNumber;
} ());
