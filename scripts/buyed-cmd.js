define(function (require, exports) {

//adapter
var base = require("base-cmd");
var attribute = base.attribute;
var effect = base.effect;
var tool = base.tool;
var wrap = base.wrap;

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



//exports
exports.slide = slide;
exports.gotop = gotop;

});