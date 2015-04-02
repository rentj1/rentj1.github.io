
(function(){
		  
	function run(code){
		var newWin = window.open("", "_blank", "");
		newWin.opener = null; // 防止代码对页面修改
		newWin.document.open();
		newWin.document.write(code);
		newWin.document.close();
	}
	
	//遍历页面中运行代码按钮
	var  executes = document.getElementsByName("run");
	for(var i=0; i<executes.length; i++){
		executes[i].onclick = function(){
			var code = this.form.codearea.value;
			run(code);
		};
	}
	
}());