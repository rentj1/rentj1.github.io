//http://xtao.aliapp.com/demo/assets/tmalljpk.js?t=120625.js

var itemsArray;
var itemsSocArray;
var curPage = 0;
var allpage = 0;
var curCid = 16;
var curSubCid;

function getTmallItem(itemtype) {
    var apimethod = {};
    if (itemtype == "s") {

        apimethod.method = 'tmall.selected.items.search';
        apimethod.cid = curSubCid;
    }
    else if (itemtype == "t") {

        apimethod.method = 'tmall.temai.items.search';
        apimethod.cat = 50100982;
    }
    if (!curSubCid) curSubCid = curCid;
    itemsArray = new Array();
    //tmall.temai.items.search
    TOP.api('rest', 'get', apimethod, function (resp) {
        if (itemtype == "t") alert(resp.tmall_temai_items_search_response);
        if (resp.error_response) {
            alert(apimethod + '接口获取商城商品失败!' + resp.error_response.msg);
            return false;
        }


        if (resp.item_list.selected_item) {

            var items = resp.item_list.selected_item;
            itemsArray = new Array();
            itemsSocArray = new Array();
            //alert('taobao.favorite.search success!='+items.length);

            var ina = -1;

            for (var i = 0; i < items.length; i++) {

                var yu = i % 18;
                //alert("yu"+yu);
                if (yu == 0) {
                    ina++;
                    //alert("ina="+ina+",yu="+yu);
                }

                //alert(ina+"-"+yu)

                if (!itemsArray[ina]) { itemsArray[ina] = new Array(); }
                if (!itemsSocArray[ina]) { itemsSocArray[ina] = new Array(); }

                allpage = itemsArray.length;

                itemsArray[ina].push(items[i].track_iid);
                itemsSocArray[ina].push(items[i].item_score);



            }

            //alert(temphtml);

            //alert(itemsArray[0].length);
            //alert(itemsArray[1].join(","));
            curPage = 0;

            getItemImg(itemsArray[0].join(","), 0);

        } else {
            alert("此类目下无精选商品！");
        }
    });
}

/*
({"items":{"item":[{"num_iid":14311898375,"pic_url":
*/

function getCids(parent_cid) {
    if (!parent_cid) parent_cid = 0;

    TOP.api('rest', 'get', {
        method: 'taobao.itemcats.get',
        fields: 'cid,name',
        parent_cid: parent_cid
    }, function (resp) {
        var tempO = "";
        //alert(resp.item_cats);
        var tempCats = resp.item_cats.item_cat;

        for (var i = 0; i < tempCats.length; i++) {
            if (tempCats[i].cid == '16') {
                tempO += "<option value='" + tempCats[i].cid + "' selected>" + tempCats[i].name + "</option>";
            }
            else {
                tempO += "<option value='" + tempCats[i].cid + "'>" + tempCats[i].name + "</option>";
            }
        }

        $('#tmallCids').html(tempO);

        getSubCids(16);




    })

}
function getSubCids(parent_cid) {
    TOP.api('rest', 'get', {
        method: 'taobao.itemcats.get',
        fields: 'cid,name',
        parent_cid: parent_cid
    }, function (resp) {
        var tempO = "";
        //alert(resp.item_cats);

        try {
            var tempCats = resp.item_cats.item_cat;
        } catch (e) {
            return;
        }

        //alert(tempCats);
        for (var i = 0; i < tempCats.length; i++) {
            if (i == 2) {
                tempO += "<option value='" + tempCats[i].cid + "' selected>" + tempCats[i].name + "</option>";
            }
            else {
                tempO += "<option value='" + tempCats[i].cid + "'>" + tempCats[i].name + "</option>";
            }
        }


        $('#tmallSubCids').html(tempO);

        //alert($('#tmallSubCids').attr("value"));

        curSubCid = $('#tmallSubCids').attr("value");
        getTmallItem("s");

    })


}

//getTmallItem();

function getTaokeInfo(track_iids) {

    TOP.api('rest', 'get', {
        method: 'taobao.taobaoke.widget.items.convert',
       // nick: 'img_test',
        track_iids: track_iids,
        fields: 'num_iid,click_url,commission_rate'
    }, function (resp) {
        if (resp.error_response) {
            alert('taobao.taobaoke.widget.items.convert接口获取商信息品失败!' + resp.error_response.msg);
            return false;
        }

        var respItem = resp.taobaoke_items.taobaoke_item;
        for (var i = 0; i < respItem.length; i++) {
            $("#r" + respItem[i].num_iid).html("佣金：" + Number(respItem[i].commission_rate) / 100 + "%");
            $("#a" + respItem[i].num_iid).attr("href", respItem[i].click_url);
        }
    })
}

function getItemImg(track_iids, ai) {
    console.log(track_iids)
    //$("#numiidBox").html("[本次共请求"+num_iids.split(",").length+"个宝贝]");
    $("#tmallbox").empty();
    //alert(num_iids);
    TOP.api('rest', 'get', {
        method: 'taobao.items.list.get',
        //method:'taobao.taobaoke.widget.items.convert',
        //taobao.items.list.get			
        track_iids: track_iids,
        fields: 'pic_url,num_iid,title,price,detail_url'
    }, function (resp) {
        //alert(num_iids);
        //var tempArray=num_iids.split(",");

        if (resp.error_response) {
            alert('taobao.items.list.get接口获取商信息品失败!' + resp.error_response.msg);
            return false;
        }

        var temphtml = $("<ul class='tmall-items'></ul>");
        $("#tmallbox").append(temphtml);
        var respItem = resp.items.item;
        $("#numiidBox").html("[本页共" + respItem.length + "个宝贝]");
        //alert(itemsSocArray[ai]);
        for (var i = 0; i < respItem.length; i++) {
            var tempURl = respItem[i].pic_url;
            //alert(tempURl);
            //$("#ii"+respItem[i].num_iid).attr('src',tempURl+"_160x160.jpg");

            //temphtml+="<li><a href='"+respItem[i].click_url+"' target='_blank'><img id='ii"+respItem[i].num_iid +"' src='"+tempURl+"_200x200.jpg' /></a></li>";	
            tempLi = $("<li  id='li" + respItem[i].num_iid + "'><span>商品评分：" + itemsSocArray[ai][i] + "</span><a  id='a" + respItem[i].num_iid + "' href='" + respItem[i].detail_url + "' target='_blank'><img src='" + tempURl + "_200x200.jpg' /><div><strong class='tmall-price'>" + respItem[i].price + "</strong><strong class='taokerate' id='r" + respItem[i].num_iid + "'></strong><span>" + respItem[i].title + "</span></div></a><span class='favBtu' id='" + respItem[i].num_iid + "'>收藏</span><div class='cartDiv' id='cart" + respItem[i].num_iid + "'> </div></li>");
            //tempLi=$("<li  id='li"+respItem[i].num_iid +"'><img src='"+tempURl+"_200x200.jpg' /><div><strong class='tmall-price'>"+respItem[i].price+"</strong><strong class='taokerate' id='r"+respItem[i].num_iid +"'></strong><span>"+respItem[i].title+"</span></div><div class='cartDiv' id='cart"+respItem[i].num_iid+"'> </div></li>");
            temphtml.append(tempLi);
            try {
                TOP.ui('sku', {
                    container: '#cart' + respItem[i].num_iid, //指定容器
                    text: '加入购物车', //设置按钮文字
                    itemId: respItem[i].num_iid, //设置目标商品ID
                    //type: 'mini',/*type控制sku面板类型，mini为不显示主图*/
                    callback: {
                        addCartSuccess: function (e) {
                            console && console.log(e);
                            //alert(e instanceof Object);//true  
                            //for(var o in e){alert(o+' '+e[o]);}

                        },
                        error: function (e) { console && console.log(e); } /*添加失败回调*/
                    }
                });
            } catch (e) {
                //alert($('#cart'+respItem[i].num_iid));
                //console.log($('#cart'+respItem[i].num_iid))
            };



        }



        $('.favBtu').click(function () {
            //http://eco.taobao.com/widget/rest?callback=TOP.io.jsonpCbs.t37e7e7239ab374&app_key=12587965&collect_type=ITEM&item_numid=17083532466&method=taobao.favorite.add&session=6100e057e3060146e6503ca454814bbf786084a9cfef0fc11691841&shared=false&sign=EC5F4B8F3A0855E626FEFC62C6410439&timestamp=1340879116208
            TOP.api('rest', 'get', {
                method: 'taobao.favorite.add',
                item_numid: this.id,
                collect_type: 'ITEM',
                shared: false
            },
												 function (e) {

												     if (e.error_response) {
												         alert(e.error_response.msg + ":" + e.error_response.sub_msg);
												     }
												     if (e.success) {
												         alert("收藏成功!");
												     }
												     // alert(e)
												 })

            //alert(this.id);


        })


        $('#curPage').html("当前第" + Number(curPage + 1) + "/" + Number(allpage) + "页");
        //alert(resp.items.item[0].item_imgs.item_img[0].url);
        getTaokeInfo(track_iids);

    }, true)



    //taobao.item.get 
}



function getYouItem() {
    //taobao.userrecommend.items.get 
    TOP.api('rest', 'get', {
        method: 'taobao.userrecommend.items.get',
        count: 18,
        recommend_type: 1
    }, function (resp) {
        if (resp.error_response) {
            //alert('接口获取信息失败!'+resp.error_response.msg);

            $("#myItemsDiv").html("接口获取信息失败!,请先点击登录按钮！");
            return false;
        }
        if (resp.favorite_items) {
            var titleHtml = "<h3 class='itemsBoxH3'>(<a href='http://api.taobao.com/apidoc/api.htm?path=cid:10218-apiId:11052' target='_blank'>关联推荐API</a>)</h3>";
            $("#myItemsDiv").append(titleHtml);
            var temphtml = $("<ul class='tmall-items'></ul>");
            $("#myItemsDiv").append(temphtml);
            var respItem = resp.favorite_items.favorite_item;
            for (var i = 0; i < respItem.length; i++) {
                var tempURl = respItem[i].item_pictrue;
                tempLi = $("<li  id='li" + respItem[i].item_id + "'><a  id='a" + respItem[i].item_id + "' href='" + respItem[i].item_url + "' target='_blank'><img src='" + tempURl + "_200x200.jpg' /><div><strong class='tmall-price'>" + respItem[i].item_price + "</strong><strong class='taokerate' id='r" + respItem[i].item_id + "'></strong><span>" + respItem[i].item_name + "</span></div></a><span class='favBtu' id='" + respItem[i].item_id + "'>收藏</span><div class='cartDiv' id='cart" + respItem[i].item_id + "'> </div></li>");
                //tempLi=$("<li  id='li"+respItem[i].num_iid +"'><img src='"+tempURl+"_200x200.jpg' /><div><strong class='tmall-price'>"+respItem[i].price+"</strong><strong class='taokerate' id='r"+respItem[i].num_iid +"'></strong><span>"+respItem[i].title+"</span></div><div class='cartDiv' id='cart"+respItem[i].num_iid+"'> </div></li>");
                temphtml.append(tempLi);
                try {
                    TOP.ui('sku', {
                        container: '#cart' + respItem[i].item_id, //指定容器
                        text: '加入购物车', //设置按钮文字
                        itemId: respItem[i].item_id, //设置目标商品ID
                        //type: 'mini',/*type控制sku面板类型，mini为不显示主图*/
                        callback: {
                            addCartSuccess: function (e) { console && console.log(e); }, /*添加成功回调*/
                            error: function (e) { console && console.log(e); } /*添加失败回调*/
                        }
                    });
                } catch (e) {
                    //alert($('#cart'+respItem[i].item_id));
                    //console.log($('#cart'+respItem[i].num_iid))
                };

            }


        }
        //alert("");

    })

}


$('#perPage').click(function () {
    if (curPage >= 1) {
        //getItemImg(curPage-1);
        curPage = curPage - 1;
        getItemImg(itemsArray[curPage].join(","), curPage);
        $('#curPage').html("当前第" + Number(curPage + 1) + "/" + Number(allpage) + "页");
    }
    else {
        //alert( "已经是第一页");
    }
});

$('#nextPage').click(function () {
    // alert("curPage="+curPage);
    if (curPage < allpage) {
        curPage = curPage + 1;
        getItemImg(itemsArray[curPage].join(","), curPage);
        $('#curPage').html("当前第" + Number(curPage + 1) + "/" + Number(allpage) + "页");
    }
})

$('#tmallCids').change(function () {
    curCid = this.value;
    getSubCids(curCid);
});

$('#tmallSubCids').change(function () {
    curSubCid = this.value;
    getTmallItem("s");
});

$('#tmallSelectedItemsLi').click(function () {
    $('#tmallDiv').attr("style", "display:block;");
    $('#myItemsDiv').attr("style", "display:none;");
    $('#tmallSelectedItemsLi').attr("class", "selected");
    $('#userrecommendItemsLi').attr("class", "");
    //$('#tmallTeimai').attr("class","");
    //alert("ok");
});

$('#userrecommendItemsLi').click(function () {
    $('#myItemsDiv').attr("style", "display:block;");
    $('#tmallDiv').attr("style", "display:none;");
    $('#userrecommendItemsLi').attr("class", "selected");
    $('#tmallSelectedItemsLi').attr("class", "");
    $('#tmallTeimai').attr("class", "");

    TOP.auth.isLogin(function (e) {
        if (!e) {
            TOP.login();
        }
    })
});


$(function () {

    TOP.ui("login-btn", {
        container: "#taobao-login",
        type: "4,4",
        callback: {
            login: function (e) {
                getYouItem();
            }, logout: function (e) { }
        }
    });
    TOP.ui('minicart', {
        container: '.mini-cart',
        position: 'top'//默认为top; top为横向购物车，right为纵向购物车
    });

    getCids(0);

    //getYouItem();

})



// getTmallItem();

