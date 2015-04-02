// JavaScript Document

define(function(require, exports, module){
	var base = require("base-cmd");
	var Event = base.Event;
	
	
	function position(elem){
	
		var boundingClientRect= elem.getBoundingClientRect();
		var scrollLeft = document.body.scrollLeft || document.documentElement.scrollLeft;
		var scrollTop = document.body.scrollTop || document.documentElement.scrollTop;
		
		return {
			left: boundingClientRect.left + scrollLeft,
			top: boundingClientRect.top + scrollTop
		};
	}
	
	function isLoad( img){
		var top = img.getAttribute("data-top");
		var scrollTop = document.body.scrollTop || document.documentElement.scrollTop;
		return top >= scrollTop && top <= scrollTop + document.body.clientHeight;
	}
	
	function _init(img){
		var src = img.getAttribute("data-src");
		if(!src) return;
		
		var p = position(img);
		img.setAttribute("data-top", p.top);
		
		if(isLoad(img)){
			img.src = src;
		}else{
			this.lazyImages.push(img);
		}
	}
	
	function ImgLzay(container){
		
		var container = container || document
		var images = container.getElementsByTagName("img");
		var _this = this;
		_this.lazyImages = [];
		
		for(var i=0,n=images.length; i<n; i++){
			_init.call(_this, images[i]);
		}
		
		Event.addListener(window, "scroll", function(){
			_this.loadImages();										 
		});

	}
	
	
	ImgLzay.prototype = {
		
		loadImages: function(){
			var images = this.lazyImages;
			var img;
			for(var i=0; i<images.length; i++){
				img = images[i];
				if( isLoad(img) ){
					img.src = img.getAttribute("data-src");
					images.splice(i--, 1);
				}
			}
			
		
		}
	};
	
	
	function lazyLoadImages(container){
		return new ImgLzay(container);
	}

	module.exports = lazyLoadImages;
	
})


