function setHome(a, b) {
    var f = false;
    try {
        if (window.external && window.external.twGetRunPath) {
            var r = external.twGetRunPath();
            if (r && r.toLowerCase().indexOf("360") > -1) {
                f = true
            }
        }
    } catch (e) {
        f = false
    }
    var g = navigator.appVersion;
    if (navigator.userAgent.indexOf('MSIE') >= 0 && !/(Maxthon|TheWorld|TencentTraveler|MetaSr|QQbrowser|GreenBrowser)/i.test(g) && !f) {
        a.style.behavior = 'url(#default#homepage)';
        a.setHomePage(b)
    } else {
        alert("对不起，您的浏览器不支持该功能，请手动设置")
       // window.open("/help/szsy.htm")
    }
}

function addFavor() {
    try {
        window.external.addFavorite(window.location.href, window.document.title);
    } catch (e) {
        try {
            window.sidebar.addPanel(window.document.title, window.location, "");
        } catch (e) {
            alert("加入收藏失败，请使用Ctrl+D进行添加");
        }
    }
}

//天猫精选UI
function createSelectedUI(data, item_score) {
    var html = '';
    for (var i = 0; i < data.length; i++) {
        html += '<div class="item">' +
                        '<div class="pic"><a href="' + data[i].detail_url + '"><img src="' + data[i].pic_url + '_210x1000.jpg" width="210" /></a></div>' +
                        '<div class="status">' +
                            '<span class="price">￥' + data[i].price + '</span>' +
                            '<div class="data" style=" font-size:12px; text-align:right;">' +
                            '评分：' + item_score[i].substring(0, 5) +
                            '</div>' +
                        '</div>' +
                        '<div class="comment">' +
                            '<h3><a href="/">BUYED</a> <span class="light">喜欢</span>' + data[i].title + '</h3>' +
                        '</div>' +
                    '</div>';
    }
    return html;
}

/*天猫精选数据*/
function getSelectedItems(cid, render) {
    TOP.api({
        method: 'tmall.items.discount.search',
        cid: cid
    }, function (resp) {
         console.log(resp)
        var track_iids = [];
        var item_score = [];
        var items = resp.item_list.selected_item;
        if (!items) {
            return;
        }
        //page += 1;
        for (var i = ((page++ - 1) * size), n = i + size; i < n; i++) {
            if (!items[i]) break;
            track_iids.push(items[i].track_iid);
            item_score.push(items[i].item_score);
        }

        if (track_iids.length < 1) {
            return;
        }

        TOP.api({
            method: 'taobao.items.list.get',
            track_iids: track_iids,
            fields: "num_iid,title,nick,pic_url,price,detail_url"
        }, function (resp) {
            var list = resp.items.item; // resp.items.item;
            render(list, item_score);
        });

    });

}

//天猫子类数据
function loadSubCidItems(cid, name, restore) {
    var div = document.createElement("div");
    var elem = tool.get("Waterfall");
    var frist = elem.children[0] && (elem.children[0].className.indexOf("sidenav") > 0) && elem.children[0].offsetHeight;
    var title = (!!name) ? name + " - " + pageTitle : document.title;
    selectedCid = cid;
    !restore && (page = 1);
    if (frist) {
        div.appendChild(elem.children[0]);
    }
	
	saveState();
	
    getTmallItems(selectedCid, function (data, item_score) {
        var html = '';
        html = createItemUI(data, item_score);
        elem.innerHTML = div.innerHTML;
        iload(html, Function(), function (doc) {
            watferfall.reset(doc.body, frist)
         });
    });
}

//折扣数据
function getCouponItems(cid, render) {

    TOP.api({
        method: 'taobao.taobaoke.items.coupon.get',
        cid: cid,
        fields: 'pic_url,click_url,price,coupon_price,title,num_iid,volume',
        shop_type: "b",
        page_no: page,
        page_size: size,
        start_volume: 3,
        end_volume: 99999,
        sort: window["sortBy"] || "volume_desc"
    }, function (resp) {
        // console.log(resp)
        var items = resp.taobaoke_items.taobaoke_item;
        if (!items) {
            return;
        }
        page += 1;
        render(items);
    });

}
//折扣UI
function createCouponItem(data) {

    var html = '';
    for (var i = 0; i < data.length; i++) {
        html += '<div class="item">' +
                        '<div class="pic"><a href="' + data[i].click_url + '" target="_blank"><img src="' + data[i].pic_url + '_210x1000.jpg" width="210" /></a></div>' +
                        '<div class="status">' +
                            '<div  class="price"><span>￥' + data[i].coupon_price + '</span> <del>￥' + data[i].price + '</del></div>' +
                            '<div class="data">' +
                            '销量：' + data[i].volume +
                            '</div>' +
                        '</div>' +
                        '<div class="comment">' +
                            '<h3>' + data[i].title + '</h3>' +
                        '</div>' +
                    '</div>';
    }
    return html;
}


//获取子类目
function loadTmallSubCids(parent_cid, callback) {
    TOP.api('rest', 'get', {
        method: 'taobao.itemcats.get',
        fields: 'cid,name',
        parent_cid: parent_cid
    }, function (resp) {
        var subCids = "";
        var tags = tool.get("tags");
        try {
            var itemCat = resp.item_cats.item_cat;
        } catch (e) {
            tags.style.display = "none";
            if (callback) {
                callback();
            }
            return;
        }

        tags.style.display = "block";
        for (var i = 0; i < itemCat.length; i++) {
            subCids += "<a onclick='loadSubCidItems(" + itemCat[i].cid + ",\"" + itemCat[i].name + "\");'>" + itemCat[i].name + "</a> ";
        }

        tool.get('tmallSubCids').innerHTML = subCids;
        if (callback) {
            callback();
        }
    });
}

function restoreSortState(){
    var sort = tool.get("sort");
    var items = sort && sort.getElementsByTagName("li");
	
	for(var i=0; i<items.length; i++){
		if(items[i].getAttribute("data-sort") === sortBy){
			items[i].className = "select";
		}else {
			items[i].className="";
		}
	}
}

function restoreView(){
	
	//页面状态恢复selectedCid， page ， sortBy
	//#/排序/类目id/页数
	var state = location.hash.split("/");
	if( location.hash.length < 1 || state.length < 1) {
		return false;
	}
	
	sortBy = state[0].slice(1) ||  window["sortBy"];
	selectedCid = state[1] || window["selectedCid"];
	page = parseInt( String(state[2]) ) || parseInt( window["page"] );
	restoreSortState();
	factory.restore();
	
	return true;
}

function saveState(){
    var number;
    location.hash = "#" + sortBy + "/" + selectedCid + "/" + page;
   (number = tool.get("number")) && (number.innerHTML = page);
}

//排序导航初始化
function sortNav(){

    var sort = tool.get("sort");
    var items = sort && sort.getElementsByTagName("li");
	
	for(var i=0; i<items.length; i++){
		if(items[i].getAttribute("data-sort") === sortBy){
			items[i].className = "select";
		}else {
			items[i].className="";
		}
	}
	
    sort.onclick = function (e) {
		
        var e = e || window.event;
        var target = e.target || e.srcElement;
        for (var i = 0; i < items.length; i++) {

            items[i].className = "";
        }
        target.className = "select";
        
        sortBy = target.getAttribute("data-sort");
        if (sortBy == "selected") {
            if (factory.instrance === "coupon") {
                factory.create("selected");
            }
        } else {
            if (factory.instrance === "selected") {
                factory.create("coupon");
            }
        }
		
        loadSubCidItems(selectedCid);

    };
	
}

//左侧导航菜单初始化
function sideNav(){
	
	var delegate = tool.get("Waterfall");

	delegate.onclick = function(e){
		//return
		var target;
		var pathname = location.pathname;
		var url = [];
		e = e || window.event;
		target = e.srcElement || e.target;
	
		if( target.tagName.toLowerCase() !== "a" || 
		    target.href.length < 1 ||
			target.href.indexOf(pathname) > -1 || 
			target.href.indexOf("taobao.com") > -1 ) {
			
			
			return;
		}
		
		url = target.href.split("#");
		url[1] = location.hash.split("/")[0];
		
		if( url[1].length > 1 ){
			target.href = url.join("");
		}
	};

}

//页面初始化
function feed(top) {
    if (top == "coupon") {
        factory.create(top);
        page++;
    }

	sortNav();
	
	sideNav();
	
	gotop("gotop");
	
    loadTmallSubCids(selectedCid, function () {
		
        watferfall("Waterfall", function (callback) {
			
			saveState();
            getTmallItems(selectedCid, function (data, item_score) {
                var html = '';
                html = createItemUI(data, item_score);
                callback(html);
            });
        });

		if( restoreView() ){
			loadSubCidItems( window["selectedCid"], null, true );
			return ;	
		}
		
        watferfall.load();
		saveState();
    });
}

var factory = {
    
    instrance: "selected",

    create: function(tmall) {
        if (tmall === "coupon") {
            createItemUI = createCouponItem;
            getTmallItems = getCouponItems;
            factory.instrance = "coupon";
        } else {
            createItemUI = createSelectedUI;
            getTmallItems = getSelectedItems;
            factory.instrance = "selected";
        }
    }, 
	
	restore: function(){
		
        if (sortBy == "selected") {
            if (factory.instrance === "coupon") {
                factory.create("selected");
            }
        } else {
            if (factory.instrance === "selected") {
                factory.create("coupon");
            }
        }
	
	}
};

var sortBy = "selected";
var createItemUI = createSelectedUI;
var getTmallItems = getSelectedItems;
var timestamp = (+new Date());
var pageTitle = document.title;
var sign;

message = message.replace("{$timestamp}", timestamp)
sign = hex_hmac_md5(secret, message).toUpperCase();
cookie.set('timestamp', timestamp);
cookie.set('sign', sign);


