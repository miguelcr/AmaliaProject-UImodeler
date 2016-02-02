var txtNome, txtTexto, 
	txtX, txtY, txtW, txtH, txtTarget;

	//NOVO - CAP MAKER
var btnMenuBar, btnContainer, btnContainer2, btnContainer3, btnElement, btnCollection, btnNotification, btnActionOperation,
	btnCreate, btnDeleteErase, btnDuplicate, btnModify, btnModify2, btnModify3, btnMove, btnPerform, btnSelect, btnStartGoTo, btnStartGoTo2, btnStartGoTo3, btnStopEndComplete, btnStopEndComplete2, btnToggle, btnView, btnView2,
	btnActiveMaterial, btnInputAccepter, btnEditableElement,  btnEditableCollection, btnSelectableCollection, btnSelectableCollection2, btnSelectableActionSet, btnSelectableViewSet;

var meuProjecto;

var fich;

var classes = [];
var atributos = [];

$(document).ready(function(){
    meuProjecto = new myProject();
    var myCanvas = document.getElementById('canvas');
    paper.setup(myCanvas);
	
	//NOVO - CAP MAKER
	btnMenuBar = document.getElementById( 'newMenuBar' );
	
	btnContainer = document.getElementById( 'newContainer' );
	btnContainer2 = document.getElementById( 'newContainer2' );
	btnContainer3 = document.getElementById( 'newContainer3' );
	
	btnElement = document.getElementById( 'newElement' );
	btnCollection = document.getElementById( 'newCollection' );
	btnCollection2 = document.getElementById( 'newCollection2' );
	
	btnNotification = document.getElementById( 'newNotification' );
	btnActionOperation = document.getElementById( 'newActionOperation' );
	btnCreate = document.getElementById( 'newCreate' );
	btnDeleteErase = document.getElementById( 'newDeleteErase' );
	btnDuplicate = document.getElementById( 'newDuplicate' );
	
	btnModify = document.getElementById( 'newModify' );
	btnModify2 = document.getElementById( 'newModify2' );
	btnModify3 = document.getElementById( 'newModify3' );
	
	btnMove = document.getElementById( 'newMove' );
	btnPerform = document.getElementById( 'newPerform' );
	btnSelect = document.getElementById( 'newSelect' );
	
	btnStartGoTo = document.getElementById( 'newStartGoTo' );
	btnStartGoTo2 = document.getElementById( 'newStartGoTo2' );
	btnStartGoTo3 = document.getElementById( 'newStartGoTo3' );
	
	btnStopEndComplete = document.getElementById( 'newStopEndComplete' );
	btnStopEndComplete2 = document.getElementById( 'newStopEndComplete2' );
	
	btnToggle = document.getElementById( 'newToggle' );
	
	btnView = document.getElementById( 'newView' );
	btnView2 = document.getElementById( 'newView2' );
	
	btnActiveMaterial = document.getElementById( 'newActiveMaterial' );
	btnInputAccepter = document.getElementById( 'newInputAccepter' );
	btnEditableElement = document.getElementById( 'newEditableElement' );
	btnEditableCollection = document.getElementById( 'newEditableCollection' );
	btnSelectableCollection = document.getElementById( 'newSelectableCollection' );
	btnSelectableCollection2 = document.getElementById( 'newSelectableCollection2' );
	
	
	btnSelectableActionSet = document.getElementById( 'newSelectableActionSet' );
	btnSelectableViewSet = document.getElementById( 'newSelectableViewSet' );

	//MATERIALS
	
	btnMenuBar.onclick = function() {
            var aPath = new myMenuBar();
    };
	/*
	btnContainer.ondblclick = function() {
            var aPath = new myContainer();
    };
	*/
	
	btnContainer.onclick = function() {
            var aPath = new myContainer();
    };
	
	btnContainer2.onclick = function() {
            var aPath = new myContainer2();
    };
	
	btnContainer3.onclick = function() {
            var aPath = new myContainer3();
    };
	
	btnElement.onclick = function() {
            var aPath = new myElement();
    };
	
	btnCollection.onclick = function() {
            var aPath = new myCollection();
    };
	
	btnCollection2.onclick = function() {
            var aPath = new myCollection2();
    };
	
	btnNotification.onclick = function() {
            var aPath = new myNotification();
    };
	
	//TOOLS
	/*
	btnActionOperation.ondblclick = function() {
            var aPath = new myActionOperation();
    };
	*/
	btnCreate.onclick = function() {
            var aPath = new myCreate();
    };
	
	btnDeleteErase.onclick = function() {
            var aPath = new myDeleteErase();
    };
	/*
	btnDuplicate.ondblclick = function() {
            var aPath = new myDuplicate();
    };
	*/
	btnModify.onclick = function() {
            var aPath = new myModify();
    };
	
	btnModify2.onclick = function() {
            var aPath = new myModify2();
    };
	
	btnModify3.onclick = function() {
            var aPath = new myModify3();
    };
	
	/*
	btnMove.ondblclick = function() {
            var aPath = new myMove();
    };
	*/
	btnPerform.onclick = function() {
            var aPath = new myPerform();
    };
	
	btnSelect.onclick = function() {
            var aPath = new mySelect();
    };
	
	btnStartGoTo.onclick = function() {
            var aPath = new myStartGoTo();
    };
	
	btnStartGoTo2.onclick = function() {
            var aPath = new myStartGoTo2();
    };
	
	btnStartGoTo3.onclick = function() {
            var aPath = new myStartGoTo3();
    };
	
	btnStopEndComplete.onclick = function() {
            var aPath = new myStopEndComplete();
    };
	
	btnStopEndComplete2.onclick = function() {
            var aPath = new myStopEndComplete2();
    };
	/*
	btnToggle.ondblclick = function() {
            var aPath = new myToggle();
    };
	*/
	btnView.onclick = function() {
            var aPath = new myView();
    };
	
	btnView2.onclick = function() {
            var aPath = new myView2();
    };
	
	/*
	btnActiveMaterial.ondblclick = function() {
            var aPath = new myActiveMaterial();
    };
	*/
	btnInputAccepter.onclick = function() {
            var aPath = new myInputAccepter();
    };
	
	btnEditableElement.onclick = function() {
            var aPath = new myEditableElement();
    };
	/*
	btnEditableCollection.ondblclick = function() {
            var aPath = new myEditableCollection();
    };
	*/
	btnSelectableCollection.onclick = function() {
            var aPath = new mySelectableCollection();
    };
	
	btnSelectableCollection2.onclick = function() {
            var aPath = new mySelectableCollection2();
    };
	
	btnSelectableActionSet.onclick = function() {
            var aPath = new mySelectableActionSet();
    };
	/*
	btnSelectableViewSet.ondblclick = function() {
            var aPath = new mySelectableViewSet();
    };
	*/
    /* menus lateriais */                    
    var menu = new cbpHorizontalSlideOutMenu( document.getElementById( 'cbp-hsmenu-wrapper' ) );
    var menuLeft = document.getElementById( 'cbp-spmenu-s1' ),
        menuRight = document.getElementById( 'cbp-spmenu-s2' ),
        showLeft = document.getElementById( 'showLeft' ),
        showRight = document.getElementById( 'showRight' ),
        body = document.body;

    showLeft.onclick = function() {
            classie.toggle( this, 'active' );
            classie.toggle( menuLeft, 'cbp-spmenu-open' );

    };

    /* componentes do menu das propriedades*/
    txtNome = document.getElementById( 'txt_nome' );
    txtTarget = document.getElementById( 'txt_target' );
    txtTexto = document.getElementById( 'txt_texto' );

    txtX = document.getElementById( 'txt_x' );
    txtY = document.getElementById( 'txt_y' );
    txtW = document.getElementById( 'txt_width' );
    txtH = document.getElementById( 'txt_Heigth' );
	txtClasses = document.getElementById( 'ClassesList' );
	//txtCruds = document.getElementById( 'CrudOps' );
	
	/* componentes do menu das propriedades*/
    /*
    var lnkGravar = document.getElementById( 'lnkGuardar' );
    lnkGravar.onclick = function(){
        abrejanela("#gravar");
        document.getElementById( 'btnCancelarDisco' ).onclick = function(){ abrejanela("#gravar");};
        document.getElementById( 'btnGravarDisco' ).onclick = function(){ 
            var nome = document.getElementById( 'txtFileName' );
            meuProjecto.gravaCAP(nome.value);
            abrejanela("#gravar");
        };
    };
            
    var lnkAbrir = document.getElementById( 'lnkAbrir' );
    lnkAbrir.onclick = function(){
        
        abrejanela("#abrir");
        document.getElementById( 'btnCancelarAbrir' ).onclick = function(){ abrejanela("#abrir");};
    };*/
    
    document.getElementById('ficheiroCAP').addEventListener('change', readSingleFile, false);

    var lnkExport = document.getElementById( 'lnkExport' );
    lnkExport.onclick = function(){
        
       abrejanela("#exportar");
        document.getElementById( 'btnCancelarExp' ).onclick = function(){ abrejanela("#exportar");};
        document.getElementById( 'btnGravarExp' ).onclick = function(){ 
            var nome = document.getElementById( 'txtFileNameExp' );
            meuProjecto.setFicheiroDM(fich);
			//NOVO 26-05-2015
			//document.write(ficheiroDM);
			meuProjecto.gravarXML(nome.value);
			abrejanela("#exportar");
        };
    };
            
	//BOTÃO ABRIR UIM		
    var lnkImport = document.getElementById( 'lnkImport' );
    lnkImport.onclick = function(){
	   // alert("Ocorreu um erro com a execução da operação. Por favor contacte o administrador do sistema.");
        abrejanela("#importar");
        document.getElementById( 'btnCancelarImp' ).onclick = function(){ abrejanela("#importar");};
    };
	//BOTÃO ABRIR UIM
    //estava comentado???
    document.getElementById('ficheiroXML').addEventListener('change', readSingleFileXML, false);
	
	//NOVO 11-03-15
	var lnkAbrirMD = document.getElementById( 'lnkAbrirMD' );
    lnkAbrirMD.onclick = function(){
       // alert("Ocorreu um erro com a execução da operação. Por favor contacte o administrador do sistema.");
        abrejanela("#abrirMD");
        document.getElementById( 'btnCancelarMD' ).onclick = function(){ abrejanela("#abrirMD");};
    };
	
    //NOVO 11-03-15
    document.getElementById('ficheiroDM').addEventListener('change', readSingleFileDM, false);
    
	//NOVO 11-03-15
	var lnkJanelaSobre = document.getElementById( 'lnkSobre' );
    lnkJanelaSobre.onclick = function(){
       // alert("Ocorreu um erro com a execução da operação. Por favor contacte o administrador do sistema.");
        abrejanela("#sobre");
        document.getElementById( 'btnSB' ).onclick = function(){ abrejanela("#sobre");};
    };
	
	//limpa o ambiente de trabalho mas verifica 1.º se o CAP atual deve ser gravado
    var lnkLimpar = document.getElementById( 'lnkLimpar' );
    lnkLimpar.onclick = function(){
	
		var nr_elementos = meuProjecto.getContador();
		if (nr_elementos != 0){
		
			abrejanela("#confirmar");
		
			document.getElementById( 'btnSim' ).onclick = function(){ 
				abrejanela("#confirmar");
				abrejanela("#gravar");
				document.getElementById( 'btnCancelarDisco' ).onclick = function(){ abrejanela("#gravar");};
				
				document.getElementById( 'btnGravarDisco' ).onclick = function(){ 
				
					var nome = document.getElementById( 'txtFileName' );
					//NOVO 26-05-2015
					meuProjecto.setFicheiroDM(fich);
					
					meuProjecto.gravarXML(nome.value);
					//meuProjecto.gravaCAP(nome.value);
					abrejanela("#gravar");
								
					meuProjecto.limpa();
					meuProjecto.setContadorZ();
					reInicializa();
					//25-05-2015
					meuProjecto.atualizaP();
					
				};
			};
			
			document.getElementById( 'btnNao' ).onclick = function(){ 
				reInicializa();
				meuProjecto.limpa();
				abrejanela("#confirmar");
				meuProjecto.setContadorZ();
				//25-05-2015
					meuProjecto.atualizaP();
			};
		} else{
			if(nr_elementos == 0){
				meuProjecto.atualizaP();
			}
		}
    };
});

	function mudaME(grupo){
		//13-04-2015
		//27-04-2015
		
		var stroperacao = " ";
		
		try{
			var strclasse = txtClasses.options[txtClasses.selectedIndex].text;
		}catch (err){
			//NOVO 26-05-2015
			//this.abrejanela("#aviso_cl");
			//document.getElementById( 'btnOKCL' ).onclick = function(){ abrejanela("#aviso_cl");};
		}
		
		/*
		try{
			var stroperacao = txtCruds.options[txtCruds.selectedIndex].text
		}catch (err){
			stroperacao = " "
		}*/
		
		if (!strclasse){

				var dados={
					nome: txtNome.value,
					target: txtTarget.value,
					texto: txtTexto.value,
					x: parseInt( txtX.value),
					y: parseInt( txtY.value),
					w: parseInt( txtW.value),
					h: parseInt( txtH.value),
			
					//NOVO 25-05-2015
					classe: " ",
					//25-05-2015
					atributo: " ",
					operacao: stroperacao
				};
		} else {
	
			//15-04-2015
			if (strclasse.indexOf(".")==(-1))
			{
		
				var dados={
					nome: txtNome.value,
					target: txtTarget.value,
					texto: txtTexto.value,
					x: parseInt( txtX.value),
					y: parseInt( txtY.value),
					w: parseInt( txtW.value),
					h: parseInt( txtH.value),
			
					//NOVO 15-03-2015
					classe: strclasse,
					//13-04-2015
					atributo: " ",
					operacao: stroperacao
				};
			}else{
				var valores = strclasse.split(".", 2);
		
				pclasse = valores[0];
				patributo = valores[1];
		
				var dados={
					nome: txtNome.value,
					target: txtTarget.value,
					texto: txtTexto.value,
					x: parseInt( txtX.value),
					y: parseInt( txtY.value),
					w: parseInt( txtW.value),
					h: parseInt( txtH.value),
			
					//NOVO 15-03-2015
					classe: pclasse,
					//13-04-2015
					atributo: patributo,
					operacao: stroperacao
				};
		
			}
			}
			

			grupo.mudaCoisas(dados);

	}

function preencheValores(grupo){
	reInicializa();	
	if(grupo.getType() == TYPES.MENU_ITEM || grupo.getType() == TYPES.ACTION_AIO_TARGET){		
		txtTarget.value = grupo.getTarget();
	}else
		txtTarget.disabled = true;
	
	if(grupo.data["nome"]){
		txtNome.value = grupo.children[0].name;
	}else{
		txtNome.disabled = true;
	}
	
	//26-05-2015
	var nome_elemento = txtNome.value;
	//INTERACTION SPACES
	var elemspace = nome_elemento.search("interaction");
	var elementity = nome_elemento.search("entity");
	var elemlist = nome_elemento.search("list");
	var elemmenu = nome_elemento.search("menu");
	//DATA AIOS
	var eleminput = nome_elemento.search("inputo");
	var elemedit = nome_elemento.search("edit");
	var elemoutput = nome_elemento.search("output");
	
	//ACTION AIOS
	var elemcancel = nome_elemento.search("cancel");
	var elemclose = nome_elemento.search("close");
	var elemselect = nome_elemento.search("select");
	var elemtoc = nome_elemento.search("toc");
	var elemtou = nome_elemento.search("tou");
	var elemtov = nome_elemento.search("tov");
	var elemcall = nome_elemento.search("call");
	
	var selelem = document.getElementById('ClassesList');
	
	if (elemspace != (-1) || elementity != (-1) || elemlist != (-1) || elemmenu != (-1) || elemcall != (-1)){

		preencheClasses();
	}
	
	if (eleminput != (-1) || elemedit != (-1) || elemoutput != (-1)){

		preencheAtributos();
	}
	
	if (elemcancel != (-1) || elemclose !=(-1) || elemselect != (-1) || elemtoc != (-1) || elemtou != (-1) || elemtov != (-1)){
		bloqueiaClasses();
	}
	
	
	if(grupo.data["texto"]){
		if(grupo.children.length >= 2){
			txtTexto.value = grupo.children[1].content;
		}else{
			txtTexto.value = grupo.children[0].content;
		}
	}else{
		txtTexto.disabled = true;
	}
	
	txtX.value = grupo.children[0].bounds.x;
	txtY.value = grupo.children[0].bounds.y;
	
	switch(grupo.data["size"]) {
	    case 0:
	        txtW.value = grupo.children[0].bounds.width;
			txtH.value = grupo.children[0].bounds.height;
	        break;
	    case 1:
	        txtW.value = grupo.children[0].bounds.width;
			txtH.disabled = true;
	        break;
	    case 2:
		
	        txtW.disabled = true;
			txtH.value = grupo.children[0].bounds.height;
	        break;
	}
		
	//NOVO 15-03-2015
	if(grupo.data["classe"]){
		if(grupo.propriedades["atributo"]==" "){
			setSelectedValue(txtClasses, grupo.propriedades["classe"]);
		}else{
			setSelectedValue(txtClasses, grupo.propriedades["classe"] + "." + grupo.propriedades["atributo"]);
		}
	}else{
		txtClasses.disabled = true;
	}
	//25/04/2015
	/*
	if(grupo.propriedades["operacao"]){
			setSelectedValue(txtCruds, grupo.propriedades["operacao"]);
	}*/
}

function setSelectedValue(selectObj, valueToSet) {
	if (valueToSet == "")
		return;
    for (var i = 0; i < selectObj.options.length; i++) {
        if (selectObj.options[i].text== valueToSet) {
            selectObj.options[i].selected = true;
            return;
        }
    }
}

function bloqueiaClasses(){
	document.getElementById("ClassesList").disabled = true;
}

function preencheClasses(){
	var selelem = document.getElementById('ClassesList');
	selelem.options.length = 0;
		for(j = 0; j < classes.length; j++) {
		
				if (classes[j] != undefined){
					var opt = document.createElement('option');
				
					opt.innerHTML = classes[j];
					opt.value = classes[j];
					selelem.appendChild(opt);
				}
		}
		document.getElementById("ClassesList").disabled = false;
}

function preencheAtributos(){
	var sel = document.getElementById('ClassesList');
	sel.options.length = 0;
		for(j = 0; j < atributos.length; j++) {
		
				if (atributos[j] != undefined){
					var opt = document.createElement('option');
				
					opt.innerHTML = atributos[j];
					opt.value = atributos[j];
					sel.appendChild(opt);
				}
		}
		document.getElementById("ClassesList").disabled = false;
}

function preencheCLAT(){
	var sel = document.getElementById('ClassesList');
	sel.options.length = 0;
	for(j = 0; j < classes.length; j++) {
		
				if (classes[j] != undefined){
					var opt = document.createElement('option');
				
					opt.innerHTML = classes[j];
					opt.value = classes[j];
					sel.appendChild(opt);
				
					for(l = 0; l < atributos.length; l++) {
		
						if (atributos[l] != undefined){
					
							if(atributos[l].search(classes[j])!= (-1)){
								var opt = document.createElement('option');
				
								opt.innerHTML = atributos[l];
								opt.value = atributos[l];
								sel.appendChild(opt);
							}
						}
					}	
					
				}
			}
				document.getElementById("ClassesList").disabled = false;
}


function reInicializa(){
	txtNome.value = txtTexto.value = txtTarget.value = txtX.value =  txtY.value =  txtW.value =  txtH.value = txtClasses.value = /*txtCruds.value =*/ "";
	txtNome.disabled = txtTarget.disabled = txtTexto.disabled = txtX.disabled =  txtY.disabled =  txtW.disabled =  txtH.disabled = false;
}

function apagaME(grupo){
	grupo.remove();
	meuProjecto.subContador();
}

function abrejanela(nomeJanela){
    if ($(nomeJanela).css("visibility") == "visible"){
            $(nomeJanela).css("visibility","hidden");
    }else{
            $(nomeJanela).css("visibility","visible");
    }
}

//Função para ler ficheiros exp obtida de http://www.htmlgoodies.com/beyond/javascript/read-text-files-using-the-javascript-filereader.html#fbid=nRJ-e_eoFaY
function readSingleFile(evt) {
    //Retrieve the first (and only!) File from the FileList object
    var f = evt.target.files[0]; 

    if (f) {
        var r = new FileReader();
        r.onload = function(e) { 
            var desenho = e.target.result;
            if ((f.name).split(".").pop()=="cap"){
                meuProjecto.lerCAP(desenho); 
				
                abrejanela("#abrir");
            }else{
              alert("Ficheiro inválido");
                abrejanela("#abrir");
            }
        };
        r.readAsText(f);
    } else { 
        alert("Não foi possível abrir o ficheiro");
    }
}

//NOVO 21-03-2015
function readSingleFileXML(evt) {
	
	//Retrieve the first (and only!) File from the FileList object
    var f = evt.target.files[0]; 

    
	if (f) {
        var r = new FileReader();
        r.onload = function(e) { 
            //??
			var cap = e.target.result;
			
			var idMB, textoMB, classeMB, atributoMB, operacaoMB, xMB, yMB, wMB, hMB;
			var idC, textoC, classeC, atributoC, operacaoC, xC, yC, wC, hC, dmCAP, idE, textoE, classeE, atributoE, operacaoE, xE, yE, wE, hE; 
			var idCL, textoCL, classeCL, atributoCL, operacaoCL, xCL, yCL, wCL, hCL, idN, textoN, classeN, atributoN, operacaoN, xN, yN, wN, hN, idAO, textoAO, classeAO, xAO, yAO, wAO, hAO;
			var idCR, textoCR, classeCR, atributoCR, operacaoCR, xCR, yCR, wCR, hCR, idDE, textoDE, classeDE, atributoDE, operacaoDE, xDE, yDE, wDE, hDE, idD, textoD, classeD, xD, yD, wD, hD;
			var idM, textoM, classeM, atributoM, operacaoM, xM, yM, wM, hM, idMV, textoMV, classeMV, xMV, yMV, wMV, hMV, idP, textoP, classeP, atributoP, operacaoP, xP, yP, wP, hP;
			var idS, textoS, classeS, atributoS, operacaoS, xS, yS, wS, hS, idSGT, textoSGT, classeSGT, atributoSGT, operacaoSGT, xSGT, ySGT, wSGT, hSGT, idSEC, textoSEC, classeSEC, atributoSEC, operacaoSEC, xSEC, ySEC, wSEC, hSEC;
			var idT, textoT, classeT, xT, yT, wT, hT, idV, textoV, classeV, atributoV, operacaoV, xV, yV, wV, hV, idAM, textoAM, classeAM, xAM, yAM, wAM, hAM;
			var idIA, textoIA, classeIA, atributoIA, operacaoIA, xIA, yIA, wIA, hIA, idEE, textoEE, classeEE, atributoEE, operacaoEE, xEE, yEE, wEE, hEE, idEC, textoEC, classeEC, xEC, yEC, wEC, hEC;
			var idSC, textoSC, classeSC, atributoSC, operacaoSC, xSC, ySC, wSC, hSC, idSAS, textoSAS, classeSAS, atributoSAS, operacaoSAS, xSAS, ySAS, wSAS, hSAS, idSVS, textoSVS, classeSVS, xSVS, ySVS, wSVS, hSVS;
			
            if ((f.name).split(".").pop()=="xml"){				
				//try{						
					//Procura MenuBar no XML
					var xmlDoc = loadXMLDoc("caps/" + f.name);
					
					cont=xmlDoc.getElementsByTagName("MenuBar");
					
					for (i=0;i<cont.length;i++)
					{
						idMB = cont[i].getAttribute('id');
						textoMB = cont[i].getAttribute('text');
						classeMB = cont[i].getAttribute('classe');
						atributoMB = cont[i].getAttribute('atributo');
						xMB = Number(cont[i].getAttribute('x'));
						yMB = Number(cont[i].getAttribute('y'));
						wMB = Number(cont[i].getAttribute('w'));
						hMB = Number(cont[i].getAttribute('h'));
						
						impMenuBar(idMB, textoMB, classeMB, atributoMB, xMB, yMB, wMB, hMB);
					}
							
					//Procura InteractionSpace no XML
					var xmlDoc=loadXMLDoc("caps/" + f.name);
					cont=xmlDoc.getElementsByTagName("InteractionSpace");
					
					for (i=0;i<cont.length;i++)
					{
						idC = cont[i].getAttribute('id');
						textoC = cont[i].getAttribute('text');
						classeC = cont[i].getAttribute('classe');
						atributoC = cont[i].getAttribute('atributo');
						xC = Number(cont[i].getAttribute('x'));
						yC = Number(cont[i].getAttribute('y'));
						wC = Number(cont[i].getAttribute('w'));
						hC = Number(cont[i].getAttribute('h'));
						
						impContainer(idC, textoC, classeC, atributoC, xC, yC, wC, hC);
					}
				
					//Procura ViewEntity no XML
					var xmlDoc=loadXMLDoc("caps/" + f.name);
					cont=xmlDoc.getElementsByTagName("ViewEntity");
					
					for (i=0;i<cont.length;i++)
					{
						idC = cont[i].getAttribute('id');
						textoC = cont[i].getAttribute('text');
						classeC = cont[i].getAttribute('classe');
						atributoC = cont[i].getAttribute('atributo');
						xC = Number(cont[i].getAttribute('x'));
						yC = Number(cont[i].getAttribute('y'));
						wC = Number(cont[i].getAttribute('w'));
						hC = Number(cont[i].getAttribute('h'));
						
						impContainer2(idC, textoC, classeC, atributoC, xC, yC, wC, hC);
					}
					
					//Procura ViewRelatedEntity no XML
					var xmlDoc=loadXMLDoc("caps/" + f.name);
					cont=xmlDoc.getElementsByTagName("ViewRelatedEntity");
					
					for (i=0;i<cont.length;i++)
					{
						idC = cont[i].getAttribute('id');
						textoC = cont[i].getAttribute('text');
						classeC = cont[i].getAttribute('classe');
						atributoC = cont[i].getAttribute('atributo');
						xC = Number(cont[i].getAttribute('x'));
						yC = Number(cont[i].getAttribute('y'));
						wC = Number(cont[i].getAttribute('w'));
						hC = Number(cont[i].getAttribute('h'));
						
						impContainer3(idC, textoC, classeC, atributoC, xC, yC, wC, hC);
					}
				
					//document.write(idC + " " + textoC + " " + classeC + " " + xC + " " + yC + " " + wC + " " + hC);
								
					//Procura Elements no XML
					elem=xmlDoc.getElementsByTagName("OutputOnly");
					
					for (i=0;i<elem.length;i++)
					{
						idE = elem[i].getAttribute('id');
						textoE = elem[i].getAttribute('text');
						classeE = elem[i].getAttribute('classe');
						atributoE = elem[i].getAttribute('atributo');
						xE = Number(elem[i].getAttribute('x'));
						yE = Number(elem[i].getAttribute('y'));
						wE = Number(elem[i].getAttribute('w'));
						hE = Number(elem[i].getAttribute('h'));
						
						impElement(idE, textoE, classeE, atributoE, xE, yE, wE, hE);
					}
						
					//Procura ViewList no XML
					col=xmlDoc.getElementsByTagName("ViewList");
					
					for (i=0;i<col.length;i++)
					{
						idCL = col[i].getAttribute('id');
						textoCL = col[i].getAttribute('text');
						classeCL = col[i].getAttribute('classe');
						atributoCL = col[i].getAttribute('atributo');
						xCL = Number(col[i].getAttribute('x'));
						yCL = Number(col[i].getAttribute('y'));
						wCL = Number(col[i].getAttribute('w'));
						hCL = Number(col[i].getAttribute('h'));
						
						impCollection(idCL, textoCL, classeCL, atributoCL, xCL, yCL, wCL, hCL);
					}
				
					//Procura ViewRelatedList no XML
					col=xmlDoc.getElementsByTagName("ViewRelatedList");
					
					for (i=0;i<col.length;i++)
					{
						idCL = col[i].getAttribute('id');
						textoCL = col[i].getAttribute('text');
						classeCL = col[i].getAttribute('classe');
						atributoCL = col[i].getAttribute('atributo');
						xCL = Number(col[i].getAttribute('x'));
						yCL = Number(col[i].getAttribute('y'));
						wCL = Number(col[i].getAttribute('w'));
						hCL = Number(col[i].getAttribute('h'));
						
						impCollection2(idCL, textoCL, classeCL, atributoCL, xCL, yCL, wCL, hCL);
					}
				
					//Procura SystemOutputSpace no XML
					not=xmlDoc.getElementsByTagName("OutputResultSpace");
					
					for (i=0;i<not.length;i++)
					{
						idN = not[i].getAttribute('id');
						textoN = not[i].getAttribute('text');
						classeN = not[i].getAttribute('classe');
						atributoN = not[i].getAttribute('atributo');
						xN = Number(not[i].getAttribute('x'));
						yN = Number(not[i].getAttribute('y'));
						wN = Number(not[i].getAttribute('w'));
						hN = Number(not[i].getAttribute('h'));
						
						impNotification(idN, textoN, classeN, atributoN, xN, yN, wN, hN);
					}
				  
					//Procura ActionOperation no XML
					ao=xmlDoc.getElementsByTagName("ActionOperation");
					
					for (i=0;i<ao.length;i++)
					{
						idAO = ao[i].getAttribute('id');
						textoAO = ao[i].getAttribute('text');
						classeAO = ao[i].getAttribute('classe');
						xAO = Number(ao[i].getAttribute('x'));
						yAO = Number(ao[i].getAttribute('y'));
						wAO = Number(ao[i].getAttribute('w'));
						hAO = Number(ao[i].getAttribute('h'));
						
						impActionOperation(idAO, textoAO, classeAO, xAO, yAO, wAO, hAO);
					}
				
					//Procura CallCreateOp no XML
					cr=xmlDoc.getElementsByTagName("CallCreateOp");
					
					for (i=0;i<cr.length;i++)
					{
						idCR = cr[i].getAttribute('id');
						textoCR = cr[i].getAttribute('text');
						classeCR = cr[i].getAttribute('classe');
						atributoCR = cr[i].getAttribute('atributo');
						operacaoCR = cr[i].getAttribute('operacao');
						xCR = Number(cr[i].getAttribute('x'));
						yCR = Number(cr[i].getAttribute('y'));
						wCR = Number(cr[i].getAttribute('w'));
						hCR = Number(cr[i].getAttribute('h'));
						
						impCreate(idCR, textoCR, classeCR, atributoCR, operacaoCR, xCR, yCR, wCR, hCR);
					}
					
					//Procura CallDeleteOp no XML
					del=xmlDoc.getElementsByTagName("CallDeleteOp");
					
					for (i=0;i<del.length;i++)
					{
						idDE = del[i].getAttribute('id');
						textoDE = del[i].getAttribute('text');
						classeDE = del[i].getAttribute('classe');
						atributoDE = del[i].getAttribute('atributo');
						operacaoDE = del[i].getAttribute('operacao');
						xDE = Number(del[i].getAttribute('x'));
						yDE = Number(del[i].getAttribute('y'));
						wDE = Number(del[i].getAttribute('w'));
						hDE = Number(del[i].getAttribute('h'));
						
						impDeleteErase(idDE, textoDE, classeDE, atributoDE, operacaoDE, xDE, yDE, wDE, hDE);
					}
				
					//Procura Duplicate no XML
					dup=xmlDoc.getElementsByTagName("Duplicate");
					
					for (i=0;i<dup.length;i++)
					{
						idD = dup[i].getAttribute('id');
						textoD = dup[i].getAttribute('text');
						classeD = dup[i].getAttribute('classe');
						xD = Number(dup[i].getAttribute('x'));
						yD = Number(dup[i].getAttribute('y'));
						wD = Number(dup[i].getAttribute('w'));
						hD = Number(dup[i].getAttribute('h'));
						
						impDuplicate(idD, textoD, classeD, xD, yD, wD, hD);
					}
				
					//Procura CallUpdateOp no XML
					mod=xmlDoc.getElementsByTagName("CallUpdateOp");
					
					for (i=0;i<mod.length;i++)
					{
						idM = mod[i].getAttribute('id');
						textoM = mod[i].getAttribute('text');
						classeM = mod[i].getAttribute('classe');
						atributoM = mod[i].getAttribute('atributo');
						operacaoM = mod[i].getAttribute('operacao');
						xM = Number(mod[i].getAttribute('x'));
						yM = Number(mod[i].getAttribute('y'));
						wM = Number(mod[i].getAttribute('w'));
						hM = Number(mod[i].getAttribute('h'));
						
						impModify(idM, textoM, classeM, atributoM, operacaoM, xM, yM, wM, hM);
					}
				
					//Procura CallLinkOp no XML
					mod=xmlDoc.getElementsByTagName("CallLinkOp");
					
					for (i=0;i<mod.length;i++)
					{
						idM = mod[i].getAttribute('id');
						textoM = mod[i].getAttribute('text');
						classeM = mod[i].getAttribute('classe');
						atributoM = mod[i].getAttribute('atributo');
						operacaoM = mod[i].getAttribute('operacao');
						xM = Number(mod[i].getAttribute('x'));
						yM = Number(mod[i].getAttribute('y'));
						wM = Number(mod[i].getAttribute('w'));
						hM = Number(mod[i].getAttribute('h'));
						
						impModify2(idM, textoM, classeM, atributoM, operacaoM, xM, yM, wM, hM);
					};
				
				
					//Procura CallUnlinkOp no XML
					mod = xmlDoc.getElementsByTagName("CallUnlinkOp");
					
					for (i=0;i<mod.length;i++)
					{
						idM = mod[i].getAttribute('id');
						textoM = mod[i].getAttribute('text');
						classeM = mod[i].getAttribute('classe');
						atributoM = mod[i].getAttribute('atributo');
						operacaoM = mod[i].getAttribute('operacao');
						xM = Number(mod[i].getAttribute('x'));
						yM = Number(mod[i].getAttribute('y'));
						wM = Number(mod[i].getAttribute('w'));
						hM = Number(mod[i].getAttribute('h'));
						
						impModify3(idM, textoM, classeM, atributoM, operacaoM, xM, yM, wM, hM);
					};
					
					//Procura Move no XML
					mov=xmlDoc.getElementsByTagName("Move");
					
					for (i=0;i<mov.length;i++)
					{
						idMV = mov[i].getAttribute('id');
						textoMV = mov[i].getAttribute('text');
						classeMV = mov[i].getAttribute('classe');
						xMV = Number(mov[i].getAttribute('x'));
						yMV = Number(mov[i].getAttribute('y'));
						wMV = Number(mov[i].getAttribute('w'));
						hMV = Number(mov[i].getAttribute('h'));
						
						impMove(idMV, textoMV, classeMV, xMV, yMV, wMV, hMV);
					}
					
					//Procura CallOp no XML
					per=xmlDoc.getElementsByTagName("CallOp");
					
					for (i=0;i<per.length;i++)
					{
						idP = per[i].getAttribute('id');
						textoP = per[i].getAttribute('text');
						classeP = per[i].getAttribute('classe');
						atributoP = per[i].getAttribute('atributo');
						operacaoP = per[i].getAttribute('operacao');
						xP = Number(per[i].getAttribute('x'));
						yP = Number(per[i].getAttribute('y'));
						wP = Number(per[i].getAttribute('w'));
						hP = Number(per[i].getAttribute('h'));
						
						impPerform(idP, textoP, classeP, atributoP, operacaoP, xP, yP, wP, hP);
					}
				
					//Procura SelectOKOp no XML
					sel=xmlDoc.getElementsByTagName("SelectOKOp");
					
					for (i=0;i<sel.length;i++)
					{
						idS = sel[i].getAttribute('id');
						textoS = sel[i].getAttribute('text');
						classeS = sel[i].getAttribute('classe');
						atributoS = sel[i].getAttribute('atributo');
						xS = Number(sel[i].getAttribute('x'));
						yS = Number(sel[i].getAttribute('y'));
						wS = Number(sel[i].getAttribute('w'));
						hS = Number(sel[i].getAttribute('h'));
						
						impSelect(idS, textoS, classeS, atributoS, xS, yS, wS, hS);
					}
					
					//Procura MenuItem no XML
					str = xmlDoc.getElementsByTagName("MenuItem");
					
					for (i=0;i<str.length;i++){
						
						idSGT = str[i].getAttribute('id');
						textoSGT = str[i].getAttribute('text');
						classeSGT = str[i].getAttribute('classe');
						atributoSGT = str[i].getAttribute('atributo');
						xSGT = Number(str[i].getAttribute('x'));
						ySGT = Number(str[i].getAttribute('y'));
						wSGT = Number(str[i].getAttribute('w'));
						hSGT = Number(str[i].getAttribute('h'));
						target = str[i].getAttribute('target');
						
						impStartGoTo(idSGT, textoSGT, classeSGT, atributoSGT, xSGT, ySGT, wSGT, hSGT, target);
					}
					
					//Procura ToCreateInstance no XML
					str = xmlDoc.getElementsByTagName("ToCreateInstance");
					
					for (i=0;i<str.length;i++)
					{
						idSGT = str[i].getAttribute('id');
						textoSGT = str[i].getAttribute('text');
						classeSGT = str[i].getAttribute('classe');
						atributoSGT = str[i].getAttribute('atributo');
						xSGT = Number(str[i].getAttribute('x'));
						ySGT = Number(str[i].getAttribute('y'));
						wSGT = Number(str[i].getAttribute('w'));
						hSGT = Number(str[i].getAttribute('h'));
						target = str[i].getAttribute('target');
						
						impStartGoTo2(idSGT, textoSGT, classeSGT, atributoSGT, xSGT, ySGT, wSGT, hSGT, target);
					}
					
					//Procura ToUpdateInstance no XML
					str=xmlDoc.getElementsByTagName("ToUpdateInstance");
					
					for (i=0;i<str.length;i++)
					{
						idSGT = str[i].getAttribute('id');
						textoSGT = str[i].getAttribute('text');
						classeSGT = str[i].getAttribute('classe');
						atributoSGT = str[i].getAttribute('atributo');
						xSGT = Number(str[i].getAttribute('x'));
						ySGT = Number(str[i].getAttribute('y'));
						wSGT = Number(str[i].getAttribute('w'));
						hSGT = Number(str[i].getAttribute('h'));
						target = str[i].getAttribute('target');
						
						impStartGoTo3(idSGT, textoSGT, classeSGT, atributoSGT, xSGT, ySGT, wSGT, hSGT, target);
					}
					
					//Procura CancelOp no XML
					sec=xmlDoc.getElementsByTagName("CancelOp");
					
					for (i=0;i<sec.length;i++)
					{
						idSEC = sec[i].getAttribute('id');
						textoSEC = sec[i].getAttribute('text');
						classeSEC = sec[i].getAttribute('classe');
						atributoSEC = sec[i].getAttribute('atributo');
						operacaoSEC = sec[i].getAttribute('operacao');
						xSEC = Number(sec[i].getAttribute('x'));
						ySEC = Number(sec[i].getAttribute('y'));
						wSEC = Number(sec[i].getAttribute('w'));
						hSEC = Number(sec[i].getAttribute('h'));
						
						impStopEndComplete(idSEC, textoSEC, classeSEC, atributoSEC, operacaoSEC, xSEC, ySEC, wSEC, hSEC);
					}
					
					//Procura CloseOp no XML
					sec=xmlDoc.getElementsByTagName("CloseOp");
					
					for (i=0;i<sec.length;i++)
					{
						idSEC = sec[i].getAttribute('id');
						textoSEC = sec[i].getAttribute('text');
						classeSEC = sec[i].getAttribute('classe');
						atributoSEC = sec[i].getAttribute('atributo');
						operacaoSEC = sec[i].getAttribute('operacao');
						xSEC = Number(sec[i].getAttribute('x'));
						ySEC = Number(sec[i].getAttribute('y'));
						wSEC = Number(sec[i].getAttribute('w'));
						hSEC = Number(sec[i].getAttribute('h'));
						
						impStopEndComplete2(idSEC, textoSEC, classeSEC, atributoSEC, operacaoSEC, xSEC, ySEC, wSEC, hSEC);
					}
					
					//Procura Toggle no XML
					tog=xmlDoc.getElementsByTagName("Toggle");
					
					for (i=0;i<tog.length;i++)
					{
						idT = tog[i].getAttribute('id');
						textoT = tog[i].getAttribute('text');
						classeT = tog[i].getAttribute('classe');
						xT = Number(tog[i].getAttribute('x'));
						yT = Number(tog[i].getAttribute('y'));
						wT = Number(tog[i].getAttribute('w'));
						hT = Number(tog[i].getAttribute('h'));
						
						impToggle(idT, textoT, classeT, xT, yT, wT, hT);
					}
					
					//Procura ToViewInstance no XML
					vw=xmlDoc.getElementsByTagName("ToViewInstance");
					
					for (i=0;i<vw.length;i++)
					{
						idV = vw[i].getAttribute('id');
						textoV = vw[i].getAttribute('text');
						classeV = vw[i].getAttribute('classe');
						atributoV = vw[i].getAttribute('atributo');
						xV = Number(vw[i].getAttribute('x'));
						yV = Number(vw[i].getAttribute('y'));
						wV = Number(vw[i].getAttribute('w'));
						hV = Number(vw[i].getAttribute('h'));
						target = vw[i].getAttribute('target');
						
						impView(idV, textoV, classeV, atributoV, xV, yV, wV, hV, target);
					}
					
					//Procura CallRetrieveOp no XML
					vw=xmlDoc.getElementsByTagName("CallRetrieveOp");
					
					for (i=0;i<vw.length;i++)
					{
						idV = vw[i].getAttribute('id');
						textoV = vw[i].getAttribute('text');
						classeV = vw[i].getAttribute('classe');
						atributoV = vw[i].getAttribute('atributo');
						operacaoV = vw[i].getAttribute('operacao');
						xV = Number(vw[i].getAttribute('x'));
						yV = Number(vw[i].getAttribute('y'));
						wV = Number(vw[i].getAttribute('w'));
						hV = Number(vw[i].getAttribute('h'));
						
						impView2(idV, textoV, classeV, atributoV, operacaoV, xV, yV, wV, hV);
					}
					
					//Procura ActiveMaterial no XML
					am=xmlDoc.getElementsByTagName("ActiveMaterial");
					
					for (i=0;i<am.length;i++)
					{
						idAM = am[i].getAttribute('id');
						textoAM = am[i].getAttribute('text');
						classeAM = am[i].getAttribute('classe');
						xAM = Number(am[i].getAttribute('x'));
						yAM = Number(am[i].getAttribute('y'));
						wAM = Number(am[i].getAttribute('w'));
						hAM = Number(am[i].getAttribute('h'));
						
						impActiveMaterial(idAM, textoAM, classeAM, xAM, yAM, wAM, hAM);
					}
					
					//Procura InputOnly no XML
					ia=xmlDoc.getElementsByTagName("InputOnly");
					
					for (i=0;i<ia.length;i++)
					{
						idIA = ia[i].getAttribute('id');
						textoIA = ia[i].getAttribute('text');
						classeIA = ia[i].getAttribute('classe');
						atributoIA = ia[i].getAttribute('atributo');
						xIA = Number(ia[i].getAttribute('x'));
						yIA = Number(ia[i].getAttribute('y'));
						wIA = Number(ia[i].getAttribute('w'));
						hIA = Number(ia[i].getAttribute('h'));
						
						impInputAccepter(idIA, textoIA, classeIA, atributoIA, xIA, yIA, wIA, hIA);
					}
					
					//Procura Editting no XML
					ee=xmlDoc.getElementsByTagName("Editting");
					
					for (i=0;i<ee.length;i++)
					{
						idEE = ee[i].getAttribute('id');
						textoEE = ee[i].getAttribute('text');
						classeEE = ee[i].getAttribute('classe');
						atributoEE = ee[i].getAttribute('atributo');
						xEE = Number(ee[i].getAttribute('x'));
						yEE = Number(ee[i].getAttribute('y'));
						wEE = Number(ee[i].getAttribute('w'));
						hEE = Number(ee[i].getAttribute('h'));
						
						impEditableElement(idEE, textoEE, classeEE, atributoEE, xEE, yEE, wEE, hEE);
					}
					
					//Procura EditableCollection no XML
					ec=xmlDoc.getElementsByTagName("EditableCollection");
					
					for (i=0;i<ec.length;i++)
					{
						idEC = ec[i].getAttribute('id');
						textoEC = ec[i].getAttribute('text');
						classeEC = ec[i].getAttribute('classe');
						xEC = Number(ec[i].getAttribute('x'));
						yEC = Number(ec[i].getAttribute('y'));
						wEC = Number(ec[i].getAttribute('w'));
						hEC = Number(ec[i].getAttribute('h'));
						
						impEditableCollection(idEC, textoEC, classeEC, xEC, yEC, wEC, hEC);
					}
				  
					//Procura ViewList no XML (selectable)
					sc=xmlDoc.getElementsByTagName("ViewListS");
					
					for (i=0;i<sc.length;i++)
					{
						idSC = sc[i].getAttribute('id');
						textoSC = sc[i].getAttribute('text');
						classeSC = sc[i].getAttribute('classe');
						atributoSC = sc[i].getAttribute('atributo');
						xSC = Number(sc[i].getAttribute('x'));
						ySC = Number(sc[i].getAttribute('y'));
						wSC = Number(sc[i].getAttribute('w'));
						hSC = Number(sc[i].getAttribute('h'));
						
						impSelectableCollection(idSC, textoSC, classeSC, atributoSC, xSC, ySC, wSC, hSC);
					}
					
					//Procura ViewRelatedList no XML (selectable)
					sc=xmlDoc.getElementsByTagName("ViewRelatedListS");
					
					for (i=0;i<sc.length;i++)
					{
						idSC = sc[i].getAttribute('id');
						textoSC = sc[i].getAttribute('text');
						classeSC = sc[i].getAttribute('classe');
						atributoSC = sc[i].getAttribute('atributo');
						xSC = Number(sc[i].getAttribute('x'));
						ySC = Number(sc[i].getAttribute('y'));
						wSC = Number(sc[i].getAttribute('w'));
						hSC = Number(sc[i].getAttribute('h'));
						
						impSelectableCollection2(idSC, textoSC, classeSC, atributoSC, xSC, ySC, wSC, hSC);
					}
					
					//Procura Menu no XML
					sas=xmlDoc.getElementsByTagName("Menu");
					
					for (i=0;i<sas.length;i++)
					{
						idSAS = sas[i].getAttribute('id');
						textoSAS = sas[i].getAttribute('text');
						classeSAS = sas[i].getAttribute('classe');
						atributoSAS = sas[i].getAttribute('atributo');
						xSAS = Number(sas[i].getAttribute('x'));
						ySAS = Number(sas[i].getAttribute('y'));
						wSAS = Number(sas[i].getAttribute('w'));
						hSAS = Number(sas[i].getAttribute('h'));
						
						impSelectableActionSet(idSAS, textoSAS, classeSAS, atributoSAS, xSAS, ySAS, wSAS, hSAS);
					}
					
					//Procura SelectableViewSet no XML
					svs=xmlDoc.getElementsByTagName("SelectableViewSet");
					
					for (i=0;i<svs.length;i++)
					{
						idSVS = svs[i].getAttribute('id');
						textoSVS = svs[i].getAttribute('text');
						classeSVS = svs[i].getAttribute('classe');
						xSVS = Number(svs[i].getAttribute('x'));
						ySVS = Number(svs[i].getAttribute('y'));
						wSVS = Number(svs[i].getAttribute('w'));
						hSVS = Number(svs[i].getAttribute('h'));
						
						impSelectableViewSet(idSVS, textoSVS, classeSVS, xSVS, ySVS, wSVS, hSVS);
					}
					
	
					//Procura Domain Model associado ao UIM
					capp=xmlDoc.getElementsByTagName("UIM");
					
					for (i=0;i<capp.length;i++)
					{
						dmCAP = capp[i].getAttribute('dm');		
						
					}
					
	
					
					fich = dmCAP;
					//document.write(fich);
					//AQUI
					//var classes = [];
					//var atributos = [];
					
					var tatrb = 0;
				
				try{
					var sel = document.getElementById('ClassesList');
			
					//PREENCHE COMBOBOX - CLASSES
					var xmlDoc2=loadXMLDoc("domain_model/" + dmCAP);
					x=xmlDoc2.getElementsByTagName("element");
			
					for (i=0;i<x.length;i++){ 	
						if (x[i].getElementsByTagName("type")[0].childNodes[0].nodeValue == "class"){
			
							classes[i] = x[i].getElementsByTagName("name")[0].childNodes[0].nodeValue;
							
							//12-04-2015
							var atr = x[i].getElementsByTagName("attributes");
	
							for(k=0;k<atr.length;k++){
	
								var natr = atr[k].children.length; 
								//alert(natr);
							
								for(m=0;m<natr;m++){
									var nomeatributos = atr[k].getElementsByTagName("attribute")[m].childNodes[0].nodeValue;
									atributos[m+tatrb] = classes[i] + "." + nomeatributos;
								}
							
								tatrb = tatrb + natr;
		
							}
							
						}	
					}
				}catch (err){
					abrejanela("#addDM");
					document.getElementById( 'btnOKDM' ).onclick = function(){ abrejanela("#addDM");};
				}
				

				
				//12-04-2015
				for(j = 0; j < classes.length; j++) {		
					if (classes[j] != undefined){
						var opt = document.createElement('option');
					
						opt.innerHTML = classes[j];
						opt.value = classes[j];
						sel.appendChild(opt);
					
						for(l = 0; l < atributos.length; l++) {
							if (atributos[l] != undefined){
								if(atributos[l].search(classes[j])!= (-1)){
									var opt = document.createElement('option');
									opt.innerHTML = atributos[l];
									opt.value = atributos[l];
									sel.appendChild(opt);
								}
							}
						}	
						
					}
				}	

				//ATÉ AQUI
				/*}catch (err){
					//alert(err.message);
			abrejanela("#form_invalido");
			document.getElementById( 'btnOKFI' ).onclick = function(){ abrejanela("#form_invalido");};				
			}	*/	           
            abrejanela("#importar");
    }else{
        abrejanela("#form_invalido");
		document.getElementById( 'btnOKFI' ).onclick = function(){ abrejanela("#form_invalido");};
		
		//alert("Ficheiro inválido");
        abrejanela("#importar");
    }
		
    };
        r.readAsText(f);
    } else { 
        //alert("Não foi possível abrir o ficheiro");
		abrejanela("#form_invalido");
    }
	
}


//NOVO 15-03-2015
function loadXMLDoc(filename){	

	if (window.XMLHttpRequest)
	{
		xhttp=new XMLHttpRequest();
	}
	else // code for IE5 and IE6
	{
		xhttp=new ActiveXObject("Microsoft.XMLHTTP");
	}
		xhttp.open("GET",filename,false);
		xhttp.send();
		return xhttp.responseXML;
}

//NOVO 11-03-15
function readSingleFileDM(evt) {
    //Retrieve the first (and only!) File from the FileList object
	
    document.getElementById('ClassesList').options.length = 0;
	var f = evt.target.files[0]; 

    if (f) {

        var r = new FileReader();
        r.onload = function(e) { 
		
            
			var cap = e.target.result;
            if ((f.name).split(".").pop()=="xml"){
            
			try{
				fich = f.name;
				
				var tatrb = 0;
				
				var sel = document.getElementById('ClassesList');
		
				var xmlDoc=loadXMLDoc("domain_model/" + f.name);
				x=xmlDoc.getElementsByTagName("element");
		
				for (i=0;i<x.length;i++)
				{ 	
					if (x[i].getElementsByTagName("type")[0].childNodes[0].nodeValue == "class"){

					classes[i] = x[i].getElementsByTagName("name")[0].childNodes[0].nodeValue;
					
					//12-04-2015
					var atr = x[i].getElementsByTagName("attributes");

					for(k=0;k<atr.length;k++){

						var natr = atr[k].children.length; 
						//alert(natr);
						
						for(m=0;m<natr;m++){
							var nomeatributos = atr[k].getElementsByTagName("attribute")[m].childNodes[0].nodeValue;
							atributos[m+tatrb] = classes[i] + "." + nomeatributos;
						}
						
						tatrb = tatrb + natr;
	
					}
				}	
			}
			
			
			
			//12-04-2015
			for(j = 0; j < classes.length; j++) {
		
				if (classes[j] != undefined){
					var opt = document.createElement('option');
				
					opt.innerHTML = classes[j];
					opt.value = classes[j];
					sel.appendChild(opt);
				
				for(l = 0; l < atributos.length; l++) {
		
					if (atributos[l] != undefined){
					
						if(atributos[l].search(classes[j])!= (-1)){
							var opt = document.createElement('option');
				
							opt.innerHTML = atributos[l];
							opt.value = atributos[l];
							sel.appendChild(opt);
						}
					}
				}	
					
				}
			}	
                abrejanela("#abrirMD");
				//NOVO 26-05-2015 20:38
				//document.write(fich);
				}catch (err){
				 abrejanela("#form_invalido");
		document.getElementById( 'btnOKFI' ).onclick = function(){ abrejanela("#form_invalido");};
		abrejanela("#abrirMD");
			}
    }else{
        //alert("Ficheiro inválido");
		abrejanela("#form_invalido");
		document.getElementById( 'btnOKFI' ).onclick = function(){ abrejanela("#form_invalido");};
        abrejanela("#abrirMD");
    }
			
    };
        r.readAsText(f);
    } else { 
        abrejanela("#form_invalido");
		document.getElementById( 'btnOKFI' ).onclick = function(){ abrejanela("#form_invalido");};
		abrejanela("#abrirMD");
    }
	
	

}