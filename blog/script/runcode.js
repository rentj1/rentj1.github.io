
(function(){
		  
	function run(code){
		var newWin = window.open("", "_blank", "");
		newWin.opener = null; // ��ֹ�����ҳ���޸�
		newWin.document.open();
		newWin.document.write(code);
		newWin.document.close();
	}
	
	//����ҳ�������д��밴ť
	var  executes = document.getElementsByName("run");
	for(var i=0; i<executes.length; i++){
		executes[i].onclick = function(){
			var code = this.form.codearea.value;
			run(code);
		};
	}
	
}());