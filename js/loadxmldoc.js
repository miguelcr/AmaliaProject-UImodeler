var data = null;

function loadXMLDoc(filename){
	
	
	   $.ajax({
	     type: "GET",
	     url: filename,  
	     dataType: "xml",
	     success: parseXml
	   });
/*
	if( window.XMLHttpRequest )
		xhttp = new XMLHttpRequest();	
	else // code for IE5 and IE6	
		xhttp=new ActiveXObject("Microsoft.XMLHTTP");
	xhttp.open("GET", filename, false);
	xhttp.send();
	*/
	return data;
}

function parseXml(xml)
{
  data =  xml;
}