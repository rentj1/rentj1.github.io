// JavaScript Document
var sideList = document.getElementById("aside");
//https://developer.mozilla.org/en-US/docs/HTML_in_XMLHttpRequest
//http://stackoverflow.com/questions/5447928/ajax-response-as-dom-object
//http://seo.911web.org/xmlhttprequest-responsexml-not-working-in-internet-explorer-for-xml-file-using-javascript
ajax.get("index.html", function(content){
   var iframe = document.createElement("iframe"),
   		doc;
   iframe.style.display="none";	
   document.body.appendChild(iframe)
   doc = iframe.contentWindow.document;
   doc.open();
   doc.write(content);
   doc.close();
   sideList.innerHTML = doc.getElementById("list").innerHTML;
	//sideList.innerHTML = ;
});