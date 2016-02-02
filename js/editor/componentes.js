var TYPES = {
  INTERACTION_SPACE : {value: 0, name: "Interaction Space", code: "IS"},
  ACTION_AIO : {value: 8, name: "Action AIO", code: "AAIO"},
  ACTION_AIO_TARGET : {value: 8, name: "Action AIO with Target", code: "AAIOWT"},
  DATA_AIO : {value: 9, name: "Data AIO", code: "DAIO"}, 
  // Interaction Blocks
  INTERACTION_BLOCK : {value: 12, name: "Interaction Block", code: "IB"},
  VIEW_ENTITY: {value: 1, name: "View Entity", code: "VE"}, 
  VIEW_LIST : {value: 2, name: "View List", code: "VL"},
  VIEW_RELATED_LIST : {value: 3, name: "View Related List", code: "VRL"},
  VIEW_RELATED_ENTITY : {value: 4, name: "View Related Entity", code: "VRE"},
  VIEW_LIST_SELECTABLE : {value: 10, name: "View List Selectable", code: "VLS"},
  VIEW_RELATED_LIST_SELECTABLE : {value: 11, name: "View Related List Selectable", code: "VRLS"},  
  // Menus
  MENU_BAR : {value: 5, name: "Menu Bar", code: "MB"},
  MENU : {value: 6, name: "Menu", code: "M"},
  MENU_ITEM : {value: 7, name: "Menu Item", code: "MI"},  
};

var myProject = function(){
    this.nome = "user interface model";
	 
	this.gravarXML = function(myName){
		if(myName) this.nome = myName;
		
		// creates a Document object with root "<UIM>"
		var doc = document.implementation.createDocument(null, "UIM", null);
		// Add the attributes to the root element
		doc.getElementsByTagName("UIM")[0].setAttribute("nome", this.nome);
		doc.getElementsByTagName("UIM")[0].setAttribute("dm", ficheiroDM);
		
		var allLayers = paper.project.activeLayer.children; // Has all the layers in the interface		
		var allElements = []; // Has all the elements		
		for (i = 0; i < allLayers.length; i++)
			allElements[i] = allLayers[i].getElement(doc);		
		
		var layers = paper.project.activeLayer.children; // Has all the objects available to analyze
		var layersInDocument = []; // Layer already in the document		
		var layersRemaining = []; // Temporary variable that saves the layers remaining, that are not in the document xml
		var error = ""; // Saves the error message
		var interactionSpaceElement = null; // Reference to the interactionSpace Element
		var interactionSpaceLayer = null; // Reference to the interactionSpace layer
		
		while(1){
			// INTERACTION SPACE VALIDATION
			var numberOfInteractionSpaces = 0; // Number of interaction spaces found			
			for (i = 0; i < layers.length; i++){				
				if(layers[i].getType() == TYPES.INTERACTION_SPACE){			
					if(numberOfInteractionSpaces == 0){
						numberOfInteractionSpaces ++;
						interactionSpaceElement = layers[i].getElement(doc);
		            	doc.documentElement.appendChild(interactionSpaceElement);
		            	interactionSpaceLayer = layers[i];		            	
		            	layersInDocument.push(layers[i]);
		            }else{
		            	error = "There can only be one interaction space per UI model";
		            	break; // Breaks the for loop
		            }
				} else 
					layersRemaining.push(layers[i]);
			}						
			
			if(error != "")
				break; 
			else if(numberOfInteractionSpaces == 0){
				error = "The model needs one Interaction Space";
				break;
			}
			
			// MENU BAR VALIDATION
			error = checkMenuBarAndMenus(layersRemaining, layersInDocument, interactionSpaceElement, doc);
				
			if(error != "")	break; 

			// INTERACTION BLOCKS VALIDATION checkInteractionBlocks(layersRemaining, layersInDocument, interactionSpaceElement, doc)		
			error = checkInteractionBlocks(layersRemaining, layersInDocument, interactionSpaceElement, interactionSpaceLayer, doc);
			
			if(error != "")	break; 
			
			//alert(layersRemaining.length);
			
			// ACTION AIO IN INTERACTION SPACE VALIDATION
			layers = cloneArray(layersRemaining);		
			var actionAIOsLayers = [];
			var removed = []; // Layers added to file
			for (i = 0; i < layers.length; i++){
				if(layers[i].getType() == TYPES.ACTION_AIO || layers[i].getType() == TYPES.ACTION_AIO_TARGET){					
					layersInDocument.push(layers[i]);
					actionAIOsLayers.push(layers[i]);				
					removed.push(i);				
					if(checkLayerPosition(interactionSpaceLayer, layers[i]))
						interactionSpaceElement.appendChild(layers[i].getElement(doc));
					else{
						error = "The Action AIO must be inside an Interaction Space or Interaction Block";
						break;
					}					
				}else{
					error = "UPS! I wasn't expecting this...";
					break;
				}
			}						
						
			break;
		}
		
		if(error != "")
			alert(error);
		else{
			// used to convert DOM subtree or DOM document into text
			var xmlText = new XMLSerializer().serializeToString(doc);
			
			// Save the XML as a file
			var blob = new Blob([xmlText], {type: "text/xml;charset=utf-8"});
			saveAs(blob, this.nome + ".xml");		
		}
	};
	
	
	this.setFicheiroDM = function(fich){
		ficheiroDM = fich;
	
	};
   
    this.gravaCAP = function(myName){
        if(myName) this.nome = myName;
        var nomeFicheiro = this.nome + ".cap";
        var blob = new Blob([paper.project.exportJSON()],{type: "text/plain;charset=utf-8"});
        saveAs (blob,nomeFicheiro);
   };
   
   //limpa a ?rea do projeto
   this.limpa = function(){
       paper.project.clear();
   };
   
   this.lerCAP = function(ficheiro){
		this.limpa();
		paper.project.importJSON(ficheiro);
	   //NOVO
		//var newGroup = new paper.Group();
		//newGroup.importJSON(ficheiro);    
   };
   
      this.lerXML = function(ficheiro){
       this.limpa();
       paper.project.importSVG(ficheiro);
   };
   
   //novo GET Contador - GERAL
	this.getContador = function(){
			return contador;
	};
	
	//novo SET Contador - GERAL = 0
	this.setContadorZ = function(){
			contador = 0;
	};
	
    //novo SUB Contador - GERAL - 1
	this.subContador = function(){
			contador = contador - 1;
	};
	
	this.atualizaP = function(){
		location.reload();
	};
};

function checkInteractionBlocks(layersRemaining, layersInDocument, interactionSpaceElement, interactionSpaceLayer, doc){
	var error = "";
	var layers = cloneArray(layersRemaining);
	var removed = []; // Removed indexes
	var interactionBlocksLayers = [];
	var interactionBlocksElements = [];
	
	while(1){
		// Search for the Interaction blocks and add them to the interactionBlock node
		for (i = 0; i < layers.length; i++){
			if(layers[i].getType() == TYPES.INTERACTION_BLOCK){
				layersInDocument.push(layers[i]);
				interactionBlockLayer = layers[i];
				interactionBlockElement = interactionBlockLayer.getElement(doc); 
				interactionBlocksLayers.push(interactionBlockLayer);
				interactionBlocksElements.push(interactionBlockElement);
				removed.push(i);
				if(checkLayerPosition(interactionSpaceLayer, layers[i]))
					interactionSpaceElement.appendChild(interactionBlockElement);		
				else{
					error = "The InteractionBlock layer must be inside the InteractionSpace layer";						
					break; // Breaks the loop
				}
			}
		}
		
		// Remove the layers already used		
		removeUsedIndexes(removed, layersRemaining);		
		//alert("Interaction Blocks Found: " + interactionBlocksLayers.length);
		
		if(error != "") break;
		
		// Search for DATA AIO
		layers = cloneArray(layersRemaining);		
		var dataAIOsLayers = [];
		removed = [];
		var added = false; 
		for (i = 0; i < layers.length; i++){
			if(layers[i].getType() == TYPES.DATA_AIO){
				added = false;
				layersInDocument.push(layers[i]);
				dataAIOsLayers.push(layers[i]);				
				removed.push(i);
				for (j = 0; j < interactionBlocksLayers.length; j++){					
					if(checkLayerPosition(interactionBlocksLayers[j], layers[i])){
						interactionBlocksElements[j].appendChild(layers[i].getElement(doc));
						added = true;
						break;
					}
				}
				
				if(!added){ // Check if the DATA AIO was added to some Interaction Block
					error = "The DATA AIO must be inside a Interaction Block";
					break;
				}
			}
		}
		
		if(error != "") break;
		
		// Remove the layers already used		
		removeUsedIndexes(removed, layersRemaining);
		
		// Search for ACTION AIO		
		layers = cloneArray(layersRemaining);		
		var actionAIOLayers = [];
		removed = [];		
		for (i = 0; i < layers.length; i++){			
			if(layers[i].getType() == TYPES.ACTION_AIO || layers[i].getType() == TYPES.ACTION_AIO_TARGET){
				actionAIOLayers.push(layers[i]);
				for (j = 0; j < interactionBlocksLayers.length; j++){					
					if(checkLayerPosition(interactionBlocksLayers[j], layers[i])){
						interactionBlocksElements[j].appendChild(layers[i].getElement(doc));
						layersInDocument.push(layers[i]);
						removed.push(i);
						break;
					}
				}
			}
		}
		
		// Remove the layers already used		
		removeUsedIndexes(removed, layersRemaining);
				
		break;
	}	
	return error;
}

// Check the layers of the MenuBar and childs
function checkMenuBarAndMenus(layersRemaining, layersInDocument, interactionSpaceElement, doc){
	var error = "";
	var layers = cloneArray(layersRemaining);
	var numberOfMenuBar = 0; // Number of menu bars found
	var menuBarElement = null; // Reference to the menu bar element in document
	var menuBarLayer = null; // Reference to the menu bar layer
	var removed = []; // Removed indexes
	
	while(1){
		// Search for the MenuBar
		for (i = 0; i < layers.length; i++){
			if(layers[i].getType() == TYPES.MENU_BAR){
				if(numberOfMenuBar == 0){
					numberOfMenuBar++;
					menuBarLayer = layers[i];
					layersInDocument.push(layers[i]);
					menuBarElement = layers[i].getElement(doc);
					removed.push(i);					
				}else{
	            	error = "There can only be one MenuBar";
	            	break; // Breaks the for loop						
				}
			}
		}		

		if(error != "" || numberOfMenuBar == 0) break;
		
		// Remove the layers already used		
		removeUsedIndexes(removed, layersRemaining);
		
		// Check if menubar is inside the interaction space
		if(numberOfMenuBar == 1){
			for (i = 0; i < layersInDocument.length; i++){
				if(layersInDocument[i].getType() == TYPES.INTERACTION_SPACE){					
					if(checkLayerPosition(layersInDocument[i], menuBarLayer))
						interactionSpaceElement.appendChild(menuBarElement);		
					else 
						error = "The MenuBar layer must be inside the InteractionSpace layer";						
					break; // Breaks the loop
				}
			}				
		}
		
		if(error != "") break;
		
		// Search for Menus		
		layers = cloneArray(layersRemaining);				
		var menus = [];
		var menusElements = [];
		removed = [];
		for (i = 0; i < layers.length; i++){
			if(layers[i].getType() == TYPES.MENU){
				menus.push(layers[i]);
				layersInDocument.push(layers[i]);				
				removed.push(i);
				if(checkLayerPosition(menuBarLayer, layers[i])){
					menuElement = layers[i].getElement(doc); 					
					menuBarElement.appendChild(menuElement);
					menusElements.push(menuElement);
				}else{
					error = "The Menu must be inside the MenuBar";
					break;
				}
			}
		}
		
		if(error != "") break;
		else if(menus.length == 0){
			error = "The MenuBar must have at least one menu";
			break;
		}
		
		// Remove the layers already used		
		removeUsedIndexes(removed, layersRemaining);			
			
					
		// Search for MenuItems
		var menusWithMenuItems = [];
		layers = cloneArray(layersRemaining);
		var menuItems = [];
		var added = false; 	
		removed = [];	
		for (i = 0; i < layers.length; i++){			
			if(layers[i].getType() == TYPES.MENU_ITEM){	
				added = false;			
				menuItems.push(layers[i]);
				layersInDocument.push(layers[i]);
				removed.push(i);				
				for (j = 0; j < menus.length; j++){					
					if(checkLayerPosition(menus[j], layers[i])){
						menusElements[j].appendChild(layers[i].getElement(doc));
						menusWithMenuItems.push(j);
						added = true;
						break;
					}
				}
				
				if(!added){
					error = "The MenuItem must be inside a menu";
					break;
				}
			}
		}
		
		// Remove the layers already used
		removeUsedIndexes(removed, layersRemaining);
		
		if(error != "") break;
		
		// Check if every menu has at least one menu item
		for (i = 0; i < menus.length; i++){
			found = false;
			for( j = 0; j < menusWithMenuItems.length; j++){
				if(menusWithMenuItems[j] == i){
					found = true;
					break;
				} 
			}
			if(!found){
				error = "Every Menu must have an MenuItem";
				break;
			}
		}		
		
		break;
	}
	
	return error;		
}
// Remove the layers already used
function removeUsedIndexes (indexes, array) {
	for(i = indexes.length - 1; i >= 0; i--){
		array.splice(indexes[i],1);
	}
}
function cloneArray(arrayToDuplicate){
	newArray = new Array(arrayToDuplicate.length);
	var i = arrayToDuplicate.length;
	while(i--) { newArray[i] = arrayToDuplicate[i]; }
	return newArray;
}

/*
 * Check if a layer is inside another layer
 * return true is layer B is inside layer A
 */
function checkLayerPosition(layerA, layerB){
	// getX, getY, getHeight, getWidth
	console.log("A: X" + layerA.getX() + " Y" + layerA.getY() + " WIDTH" + layerA.getWidth() + " WIDTH" + layerA.getHeight());
	console.log("B: X" + layerB.getX() + " Y" + layerB.getY() + " WIDTH" + layerB.getWidth() + " WIDTH" + layerB.getHeight());
	if(layerA.getX() <= layerB.getX() &&
		layerA.getY() <= layerB.getY() &&
		layerA.getWidth() + layerA.getX()  >= layerB.getWidth() + layerB.getX() &&
		layerA.getHeight() + layerA.getY()  >= layerB.getHeight() + layerB.getY()){
			return true;
		}
	return false;
};

//CAP MAKER

//contador de elementos - GERAL
var contador = 0;

//contadores de n?mero do n?mero de objetos de cada tipo
var contContainer = 0;
var contElement = 0;
var contCollection = 0;
var contNotification = 0;
var contActionOperation = 0;
var contCreate = 0;
var contDeleteErase = 0;
var contDuplicate = 0;
var contModify = 0;
var contMove = 0;
var contPerform = 0;
var contSelect = 0;
var contStartGoTo = 0;
var contStopEndComplete = 0;
var contToggle = 0;
var contView = 0;
var contActiveMaterial = 0;
var contInputAccepter = 0;
var contEditableElement = 0;
var contEditableCollection = 0;
var contSelectableCollection = 0;
var contSelectableActionSet = 0;
var contSelectableViewSet = 0;

var ficheiroDM;

//OBJETOS
//MATERIALS

// MenuBar
var myMenuBar = function(){ 
	contador = contador + 1;
    contContainer = contContainer + 1;
	
	//rectangulo principal 
	this.p1 = new paper.Path.Rectangle(new paper.Point(200, 100), new paper.Size(200, 60));
    this.p1.strokeColor = "black";
    this.p1.name = "menubar" + contContainer;
	this.p1.dashArray = [8, 10];
	this.p1.strokeWidth = 2;

    this.p2 = new paper.PointText({		//texto e cor do texto
        content: 'MenuBar',		
        fillColor: 'black',
		fontSize: 15
    });
	
	        
	this.p2.point = leftTextos(			//alinhar texto ? esquerda
            this.p1.bounds.width-90, 20,
            this.p1.bounds.x, this.p1.bounds.y,
            this.p2.bounds.width, this.p2.bounds.height
    );
	
    this.component = new paper.Group([this.p1, this.p2]);
    this.component.data ={
            nome:true,
            texto:true,
            size:0,
			classe: true
    };

	this.component.propriedades={
        classe : "",
		atributo : ""
        
    };

	this.component.mudaCoisas = function(dados){
        this.p1 = this.children[0];
        this.p2 = this.children[1];
        
        if(dados["nome"]) this.p1.name = dados["nome"];
        if(dados["texto"]) this.p2.content = dados["texto"];

        if(dados["x"]) this.p1.bounds.x = dados["x"];
        if(dados["y"]) this.p1.bounds.y = dados["y"];

        if(dados["w"]) this.p1.bounds.width = dados["w"];
        if(dados["h"]) this.p1.bounds.height = dados["h"];
		
		if(dados["classe"]) this.propriedades["classe"] = dados["classe"]; 
		if(dados["atributo"]) this.propriedades["atributo"] = dados["atributo"]; 
		
    };
	
	//NOVO 29-06-2015
	this.component.mudaTAM = function(dados){
        this.p1 = this.children[0];

        if(dados["w"]) this.p1.bounds.width = dados["w"];
        if(dados["h"]) this.p1.bounds.height = dados["h"];
    };
	
    this.component.getXML = function(){
        this.p1 = this.children[0];
        this.p2 = this.children[1];
      xml = "<MenuBar id='"+ this.p1.name +"' text='" + this.p2.content + "' x='"+ this.p1.bounds.x +"' y='"+ this.p1.bounds.y + "' w='" + this.p1.bounds.width + "' h='" +this.p1.bounds.height + "' classe='" + this.propriedades["classe"] + /*"' atributo='" + this.propriedades["atributo"] + */"'>\n" +
                "</MenuBar> \n";
        return xml;
    };
	
    this.component.getElement = function(doc){    	
        this.p1 = this.children[0];
        this.p2 = this.children[1];
		var element = doc.createElement("MenuBar");
		element.setAttribute("id", this.p1.name);
		element.setAttribute("text", this.p2.content);
		element.setAttribute("x", this.p1.bounds.x);
		element.setAttribute("y", this.p1.bounds.y);
		element.setAttribute("w", this.p1.bounds.width);
		element.setAttribute("h", this.p1.bounds.height);
		element.setAttribute("classe", this.propriedades["classe"]);		
        return element;
    };	
	
    var type = TYPES.MENU_BAR;
	this.component.getType = function(){		
		return type;
	};
	
	//novo GETs
	this.component.getX = function(){
		var x = this.p1.bounds.x;
		
		return x;
	};
	
	this.component.getY = function(){
		var y = this.p1.bounds.y;
		
		return y;
	};
	
	this.component.getWidth = function(){
		var w = this.p1.bounds.width;
		
		return w;
	};
	
	this.component.getHeight = function(){
		var h = this.p1.bounds.height;
		
		return h;
	};
	
	//NOVO 08-04-2015
	this.component.getClasse = function(){
		var cl = this.propriedades.classe;
		
		return cl;
	};   
	
    this.posicionaMenu = function(){
		var dados={
			y: 20,
			w: 300,
			h: 100
		};
		this.component.mudaCoisas(dados);
	};
};


// ACTION AIO - CallOp
var myPerform = function(){
	contador = contador + 1;
	contPerform = contPerform +1;

	//rectangulo principal 
	this.p1 = new paper.Path.Rectangle(new paper.Point(200, 100), new paper.Size(200, 60));
    this.p1.strokeColor = "black";
    this.p1.name = "callop" + contPerform;

	this.p3 = new paper.PointText({		//texto e cor do texto
        content: 'CallOp',		
        fillColor: 'black',
		fontSize: 15
    });

	// linha da seta "/"
	this.p2 = new paper.Path();  
	this.p2.add(new paper.Point(this.p1.bounds.x + 10, this.p1.bounds.y + 45));
	this.p2.add(new paper.Point(this.p1.bounds.x + 43.5, this.p1.bounds.y + 15));
	this.p2.strokeColor = "black";
	this.p2.strokeWidth = 2;

	this.p3.point = leftTextos(			//alinhar texto ? esquerda
            this.p1.bounds.width-90, 20,
            this.p1.bounds.x, this.p1.bounds.y,
            this.p3.bounds.width, this.p3.bounds.height
            );
			
	//tri?ngulo - ponta da seta		
	var center = new paper.Point(this.p1.bounds.x + 45, this.p1.bounds.y + 15);
	var sides = 3;
	var radius = 7;
	this.p4 = new paper.Path.RegularPolygon(center, sides, radius);
	this.p4.fillColor = 'black';	
	this.p4.rotate(45);	
	this.p4.name = "perform_symbol";
	
	//tri?ngulo - ponta da seta 2
	var center2 = new paper.Point(this.p1.bounds.x + 11, this.p1.bounds.y + 47);
	var sides2 = 3;
	var radius2 = 7;
	this.p5 = new paper.Path.RegularPolygon(center2, sides2, radius2);
	this.p5.fillColor = 'black';	
	this.p5.rotate(117);
	
    this.component = new paper.Group([this.p1, this.p3, this.p2, this.p4, this.p5]);
    this.component.data ={
            nome:true,
            texto:true,
            size:0,
			classe: true
    };
	
	this.component.propriedades={
        classe : "",
		atributo : "",
		operacao : ""
        
    };
	
		this.component.mudaCoisas = function(dados){
        this.p1 = this.children[0];
        this.p3 = this.children[1];
		this.p2 = this.children[2];
        this.p4 = this.children[3];
		this.p5 = this.children[4];
				
        if(dados["nome"]) this.p1.name = dados["nome"];
        if(dados["texto"]) this.p3.content = dados["texto"];

        if(dados["x"]) this.p1.bounds.x = dados["x"];
        if(dados["y"]) this.p1.bounds.y = dados["y"];

        if(dados["w"]) this.p1.bounds.width = dados["w"];
        if(dados["h"]) this.p1.bounds.height = dados["h"];
		
		if(dados["classe"]) this.propriedades["classe"] = dados["classe"]; 
		if(dados["atributo"]) this.propriedades["atributo"] = dados["atributo"];
		if(dados["operacao"]) this.propriedades["operacao"] = dados["operacao"];
		}; 
		
	this.component.getXML = function(){
        this.p1 = this.children[0];
        this.p3 = this.children[1];
		this.p2 = this.children[2];
        this.p4 = this.children[3];
		this.p5 = this.children[4];
			
		xml = "<CallOp id='"+ this.p1.name +"' text='" + this.p3.content + "' x='"+ this.p1.bounds.x +"' y='"+ this.p1.bounds.y + "' w='" + this.p1.bounds.width + "' h='" +this.p1.bounds.height + "' classe='" + this.propriedades["classe"] + "' operacao='User Defined" + /*this.propriedades["operacao"] +*/ "'>\n" +
                "</CallOp> \n";
        return xml;
    };
	
    this.component.getElement = function(doc){    	
        this.p1 = this.children[0];
        this.p3 = this.children[1];
		this.p2 = this.children[2];
        this.p4 = this.children[3];
		this.p5 = this.children[4];
		
		var element = doc.createElement("CallOp");
		element.setAttribute("id", this.p1.name);
		element.setAttribute("text", this.p3.content);
		element.setAttribute("x", this.p1.bounds.x);
		element.setAttribute("y", this.p1.bounds.y);
		element.setAttribute("w", this.p1.bounds.width);
		element.setAttribute("h", this.p1.bounds.height);
		element.setAttribute("classe", this.propriedades["classe"]);
		element.setAttribute("operacao", "User Defined");
        return element;
    };	
	
    var type = TYPES.ACTION_AIO;
	this.component.getType = function(){		
		return type;
	}; 
		
	//novo GETs
	this.component.getX = function(){
		var x = this.p1.bounds.x;
		
		return x;
	};
	
	this.component.getY = function(){
		var y = this.p1.bounds.y;
		
		return y;
	};
	
	this.component.getWidth = function(){
		var w = this.p1.bounds.width;
		
		return w;
	};
	
	this.component.getHeight = function(){
		var h = this.p1.bounds.height;
		
		return h;
	};
	
	//NOVO 08-04-2015
	this.component.getTipo = function(){
		var t = this.p4.name;
		
		return t;
	};
    
    this.posicionaMenu = function(){
		var dados={
			y: 20,
			w: 300,
			h: 100
		};
		this.component.mudaCoisas(dados);
	};
};

var myProjectOld = function(){
    this.nome = "user interface model";
	 
	this.gravarXML = function(myName){

		if(myName) this.nome = myName;
        console.log(paper.project);
		
		//if (!ficheiroDM){
        var xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
        xml += "<UIM nome ='"+this.nome+"' dm ='" + ficheiroDM + "'>\n";
		
		
		//21-04-2015
		/*
		var Xm, Ym, Wm, Hm; //variáveis para guardar dados do maior elemento
		var Xi, Yi, Wi, Hi; //variáveis para guardar dados do elemento atual
		
		var tamanho, controlo;
		
		tamanho = paper.project.activeLayer.children.length;
		document.write("Tamanho = " + tamanho);
		
		Xm, Ym, Wm, Hm = 0;
		Xi, Yi, Wi, Hi = 0;
		*/
		//while (tamanho != 0){
			for (i=0; i < paper.project.activeLayer.children.length; i++){
				/*
				Xi = paper.project.activeLayer.children[i].getX();
				Yi = paper.project.activeLayer.children[i].getY();
			
				Wi =  paper.project.activeLayer.children[i].getWidth();
				Hi =  paper.project.activeLayer.children[i].getHeight();
				
				var XWi = Xi + Wi;
				var YHi = Yi + Hi;
				
				document.write("Xi = " + Xi + "<br>");
				document.write("Yi = " + Yi + "<br>");
				document.write("Wi = " + Wi + "<br>");
				document.write("Hi = " + Hi + "<br>");
			
				if(i == 0){
					Xm = Xi;
					Ym = Yi;
				
					Wm =  Wi;
					Hm =  Hi;
				
					var XWm = Xm + Wm;
					var YHm = Ym + Hm;
				
					controlo = i;
					
					document.write("Xm " + i + " = " + Xm + "<br>");
					document.write("Ym " + i + " = " + Ym + "<br>");
					document.write("Wm " + i + " = " + Wm + "<br>");
					document.write("Hm " + i + " = " + Hm + "<br>");
				}else{
					if((Xm > Xi) && (Ym > Yi)){
						if((XWm < XWi) && (YHm < YHi)){
							Xm = Xi;
							Ym = Yi;
				
							Wm =  Wi;
							Hm =  Hi;
					
							controlo = i;
						
							document.write("Xm " + i + " = " + Xm + "<br>");
							document.write("Ym " + i + " = " + Ym + "<br>");
							document.write("Wm " + i + " = " + Wm + "<br>");
							document.write("Hm " + i + " = " + Hm + "<br>");
						}
					}
				}*/
	
				 xml += paper.project.activeLayer.children[i].getXML();
			}
		
			//xml += paper.project.activeLayer.children[controlo].getXML();
			
			//vai guardando a TAG de fechar e depois escreve em reverse!!!
			
			//paper.project.activeLayer.children.splice(controlo, 1);
		
			//tamanho = tamanho - 1;
		//}
		
        
		
        xml += "</UIM>";

        var blob = new Blob([xml], {type: "text/plain;charset=utf-8"});
        saveAs(blob, this.nome + ".xml");
	//	} else {
		//	abrejanela("#addDM");
		//	document.getElementById( 'btnOKDM' ).onclick = function(){ abrejanela("#addDM");};
		//}
	
	};
	
	
	this.setFicheiroDM = function(fich){
		ficheiroDM = fich;
	
	};
   
    this.gravaCAP = function(myName){
        if(myName) this.nome = myName;
        var nomeFicheiro = this.nome + ".cap";
        var blob = new Blob([paper.project.exportJSON()],{type: "text/plain;charset=utf-8"});
        saveAs (blob,nomeFicheiro);
   };
   
   //limpa a área do projeto
   this.limpa = function(){
       paper.project.clear();
   };
   
   this.lerCAP = function(ficheiro){
		this.limpa();
		paper.project.importJSON(ficheiro);
	   //NOVO
		//var newGroup = new paper.Group();
		//newGroup.importJSON(ficheiro);    
   };
   
      this.lerXML = function(ficheiro){
       this.limpa();
       paper.project.importSVG(ficheiro);
        
   };
   
   //novo GET Contador - GERAL
	this.getContador = function(){
			return contador;
	};
	
	//novo SET Contador - GERAL = 0
	this.setContadorZ = function(){
			contador = 0;
	};
	
    //novo SUB Contador - GERAL - 1
	this.subContador = function(){
			contador = contador - 1;
	};
	
	this.atualizaP = function(){
		location.reload();
	};
};

// ACTION AIO - CallUnlinkOp
var myModify3 = function(){
	contador = contador + 1;
	contModify = contModify + 1;

	//rectangulo principal 
	this.p1 = new paper.Path.Rectangle(new paper.Point(200, 100), new paper.Size(200, 60));
    this.p1.strokeColor = "black";
    this.p1.name = "callunlinkop" + contModify;

	this.p3 = new paper.PointText({		//texto e cor do texto
        content: 'CallUnlinkOp',		
        fillColor: 'black',
		fontSize: 15
    });
	
	// linha da seta "/"
	this.p2 = new paper.Path();  
	this.p2.add(new paper.Point(this.p1.bounds.x + 10, this.p1.bounds.y + 45));
	this.p2.add(new paper.Point(this.p1.bounds.x + 43.5, this.p1.bounds.y + 15));
	this.p2.strokeColor = "black";
	this.p2.strokeWidth = 2;

	this.p3.point = leftTextos(			//alinhar texto ? esquerda
            this.p1.bounds.width-90, 20,
            this.p1.bounds.x, this.p1.bounds.y,
            this.p3.bounds.width, this.p3.bounds.height
            );
	//tri?ngulo - ponta da seta		
	var center = new paper.Point(this.p1.bounds.x + 45, this.p1.bounds.y + 15);
	var sides = 3;
	var radius = 7;
	this.p4 = new paper.Path.RegularPolygon(center, sides, radius);
	this.p4.fillColor = 'black';	
	this.p4.rotate(45);	
	this.p4.name = "modify_symbol";
	
	//s?mbolo "~"
	this.p5 = new paper.PointText(new paper.Point(this.p1.bounds.x + 50, this.p1.bounds.y + 20));		
    this.p5.content = '~';		
    this.p5.fillColor = 'black';
	this.p5.fontSize = 30;
    			
	this.component = new paper.Group([this.p1, this.p3, this.p2, this.p4, this.p5]);
    this.component.data ={
            nome:true,
            texto:true,
            accao:false,
            valores:false,
            selected:false,
            size:0,
			classe: true
    };
	
	this.component.propriedades={
        classe : "",
		atributo : "",
		operacao : ""
        
    };
	
		this.component.mudaCoisas = function(dados){
        this.p1 = this.children[0];
        this.p3 = this.children[1];
		this.p2 = this.children[2];
        this.p4 = this.children[3];
		this.p5 = this.children[4];
				
        if(dados["nome"]) this.p1.name = dados["nome"];
        if(dados["texto"]) this.p3.content = dados["texto"];

        if(dados["x"]) this.p1.bounds.x = dados["x"];
        if(dados["y"]) this.p1.bounds.y = dados["y"];

        if(dados["w"]) this.p1.bounds.width = dados["w"];
        if(dados["h"]) this.p1.bounds.height = dados["h"];
		
		if(dados["classe"]) this.propriedades["classe"] = dados["classe"]; 
		if(dados["atributo"]) this.propriedades["atributo"] = dados["atributo"]; 
		if(dados["operacao"]) this.propriedades["operacao"] = dados["operacao"];
		}; 
		
	this.component.getXML = function(){
        this.p1 = this.children[0];
        this.p3 = this.children[1];
		this.p2 = this.children[2];
        this.p4 = this.children[3];
		this.p5 = this.children[4];
			
		xml = "<CallUnlinkOp id='"+ this.p1.name +"' text='" + this.p3.content + "' x='"+ this.p1.bounds.x +"' y='"+ this.p1.bounds.y + "' w='" + this.p1.bounds.width + "' h='" +this.p1.bounds.height + "' classe='" + this.propriedades["classe"] + "' operacao='Unlink" + /*this.propriedades["operacao"] + */"'>\n" +
                "</CallUnlinkOp> \n";
        return xml;
    };
    
    this.component.getElement = function(doc){    	
        this.p1 = this.children[0];
        this.p3 = this.children[1];
		this.p2 = this.children[2];
        this.p4 = this.children[3];
		this.p5 = this.children[4];
		
		var element = doc.createElement("CallUnlinkOp");
		element.setAttribute("id", this.p1.name);
		element.setAttribute("text", this.p3.content);
		element.setAttribute("x", this.p1.bounds.x);
		element.setAttribute("y", this.p1.bounds.y);
		element.setAttribute("w", this.p1.bounds.width);
		element.setAttribute("h", this.p1.bounds.height);
		element.setAttribute("classe", this.propriedades["classe"]);
		element.setAttribute("operacao", "Unlink");
        return element;
    };	
	
    var type = TYPES.ACTION_AIO;
	this.component.getType = function(){		
		return type;
	};    
	
		//novo GETs
	this.component.getX = function(){
		var x = this.p1.bounds.x;
		
		return x;
	};
	
	this.component.getY = function(){
		var y = this.p1.bounds.y;
		
		return y;
	};
	
	this.component.getWidth = function(){
		var w = this.p1.bounds.width;
		
		return w;
	};
	
	this.component.getHeight = function(){
		var h = this.p1.bounds.height;
		
		return h;
	};
	
	//NOVO 08-04-2015
	this.component.getTipo = function(){
		var t = this.p4.name;
		
		return t;
	};
    
    this.posicionaMenu = function(){
		var dados={
			y: 20,
			w: 300,
			h: 100
		};
		this.component.mudaCoisas(dados);
	};
};

// ACTION AIO - CallLinkOp
var myModify2 = function(){
	contador = contador + 1;
	contModify = contModify + 1;

	//rectangulo principal 
	this.p1 = new paper.Path.Rectangle(new paper.Point(200, 100), new paper.Size(200, 60));
    this.p1.strokeColor = "black";
    this.p1.name = "calllinkop" + contModify;

	this.p3 = new paper.PointText({		//texto e cor do texto
        content: 'CallLinkOp',		
        fillColor: 'black',
		fontSize: 15
    });
	
	// linha da seta "/"
	this.p2 = new paper.Path();  
	this.p2.add(new paper.Point(this.p1.bounds.x + 10, this.p1.bounds.y + 45));
	this.p2.add(new paper.Point(this.p1.bounds.x + 43.5, this.p1.bounds.y + 15));
	this.p2.strokeColor = "black";
	this.p2.strokeWidth = 2;

	this.p3.point = leftTextos(			//alinhar texto ? esquerda
            this.p1.bounds.width-90, 20,
            this.p1.bounds.x, this.p1.bounds.y,
            this.p3.bounds.width, this.p3.bounds.height
            );
	//tri?ngulo - ponta da seta		
	var center = new paper.Point(this.p1.bounds.x + 45, this.p1.bounds.y + 15);
	var sides = 3;
	var radius = 7;
	this.p4 = new paper.Path.RegularPolygon(center, sides, radius);
	this.p4.fillColor = 'black';	
	this.p4.rotate(45);	
	this.p4.name = "modify_symbol";
	
	//s?mbolo "~"
	this.p5 = new paper.PointText(new paper.Point(this.p1.bounds.x + 50, this.p1.bounds.y + 20));		
    this.p5.content = '~';		
    this.p5.fillColor = 'black';
	this.p5.fontSize = 30;
    			
	this.component = new paper.Group([this.p1, this.p3, this.p2, this.p4, this.p5]);
    this.component.data ={
            nome:true,
            texto:true,
            accao:false,
            valores:false,
            selected:false,
            size:0,
			classe: true
    };
	
	this.component.propriedades={
        classe : "",
		atributo : "",
		operacao : ""
        
    };
	
		this.component.mudaCoisas = function(dados){
        this.p1 = this.children[0];
        this.p3 = this.children[1];
		this.p2 = this.children[2];
        this.p4 = this.children[3];
		this.p5 = this.children[4];
				
        if(dados["nome"]) this.p1.name = dados["nome"];
        if(dados["texto"]) this.p3.content = dados["texto"];

        if(dados["x"]) this.p1.bounds.x = dados["x"];
        if(dados["y"]) this.p1.bounds.y = dados["y"];

        if(dados["w"]) this.p1.bounds.width = dados["w"];
        if(dados["h"]) this.p1.bounds.height = dados["h"];
		
		if(dados["classe"]) this.propriedades["classe"] = dados["classe"]; 
		if(dados["atributo"]) this.propriedades["atributo"] = dados["atributo"]; 
		if(dados["operacao"]) this.propriedades["operacao"] = dados["operacao"];
		}; 
		
	this.component.getXML = function(){
        this.p1 = this.children[0];
        this.p3 = this.children[1];
		this.p2 = this.children[2];
        this.p4 = this.children[3];
		this.p5 = this.children[4];
			
		xml = "<CallLinkOp id='"+ this.p1.name +"' text='" + this.p3.content + "' x='"+ this.p1.bounds.x +"' y='"+ this.p1.bounds.y + "' w='" + this.p1.bounds.width + "' h='" +this.p1.bounds.height + "' classe='" + this.propriedades["classe"] + "' operacao='Link" + /*this.propriedades["operacao"] +*/ "'>\n" +
                "</CallLinkOp> \n";
        return xml;
    };
	
    this.component.getElement = function(doc){    	
        this.p1 = this.children[0];
        this.p3 = this.children[1];
		this.p2 = this.children[2];
        this.p4 = this.children[3];
		this.p5 = this.children[4];
		
		var element = doc.createElement("CallLinkOp");
		element.setAttribute("id", this.p1.name);
		element.setAttribute("text", this.p3.content);
		element.setAttribute("x", this.p1.bounds.x);
		element.setAttribute("y", this.p1.bounds.y);
		element.setAttribute("w", this.p1.bounds.width);
		element.setAttribute("h", this.p1.bounds.height);
		element.setAttribute("classe", this.propriedades["classe"]);
		element.setAttribute("operacao", "Link");
        return element;
    };	
	
    var type = TYPES.ACTION_AIO;
	this.component.getType = function(){		
		return type;
	};
		
	//novo GETs
	this.component.getX = function(){
		var x = this.p1.bounds.x;
		
		return x;
	};
	
	this.component.getY = function(){
		var y = this.p1.bounds.y;
		
		return y;
	};
	
	this.component.getWidth = function(){
		var w = this.p1.bounds.width;
		
		return w;
	};
	
	this.component.getHeight = function(){
		var h = this.p1.bounds.height;
		
		return h;
	};
	
	//NOVO 08-04-2015
	this.component.getTipo = function(){
		var t = this.p4.name;
		
		return t;
	};
    
    this.posicionaMenu = function(){
		var dados={
			y: 20,
			w: 300,
			h: 100
		};
		this.component.mudaCoisas(dados);
	};
};

// ACTION AIO - CallRetrieveOp
var myView2 = function(){
	contador = contador + 1;
	contView = contView + 1;
	
	//rectangulo principal 
	this.p1 = new paper.Path.Rectangle(new paper.Point(200, 100), new paper.Size(200, 60));
    this.p1.strokeColor = "black";
    this.p1.name = "callretrieveop" + contView;

	this.p3 = new paper.PointText({		//texto e cor do texto
        content: 'CallRetrieveOp',		
        fillColor: 'black',
		fontSize: 15
    });
	
	// linha da seta "/"
	this.p2 = new paper.Path();  
	this.p2.add(new paper.Point(this.p1.bounds.x + 10, this.p1.bounds.y + 45));
	this.p2.add(new paper.Point(this.p1.bounds.x + 43.5, this.p1.bounds.y + 15));
	this.p2.strokeColor = "black";
	this.p2.strokeWidth = 2;

	this.p3.point = leftTextos(			//alinhar texto ? esquerda
            this.p1.bounds.width-90, 20,
            this.p1.bounds.x, this.p1.bounds.y,
            this.p3.bounds.width, this.p3.bounds.height
            );
			
	//tri?ngulo - ponta da seta		
	var center = new paper.Point(this.p1.bounds.x + 45, this.p1.bounds.y + 15);
	var sides = 3;
	var radius = 7;
	this.p4 = new paper.Path.RegularPolygon(center, sides, radius);
	this.p4.fillColor = 'black';	
	this.p4.rotate(45);	
	this.p4.name = "view_symbol";
	
	//quadrado
	this.p5 = new paper.Path.Rectangle(new paper.Point(this.p1.bounds.x + 55, this.p1.bounds.y + 5), new paper.Size(12, 12));
    this.p5.strokeColor = "black"; 
			
	this.component = new paper.Group([this.p1, this.p3, this.p2, this.p4, this.p5]);
    this.component.data ={
            nome:true,
            texto:true,
            size:0,
			classe: true
    };
	
	this.component.propriedades={
        classe : "",
		atributo : "",
		operacao : ""
        
    };
	
		this.component.mudaCoisas = function(dados){
        this.p1 = this.children[0];
        this.p3 = this.children[1];
		this.p2 = this.children[2];
        this.p4 = this.children[3];
		this.p5 = this.children[4];
					
        if(dados["nome"]) this.p1.name = dados["nome"];
        if(dados["texto"]) this.p3.content = dados["texto"];

        if(dados["x"]) this.p1.bounds.x = dados["x"];
        if(dados["y"]) this.p1.bounds.y = dados["y"];

        if(dados["w"]) this.p1.bounds.width = dados["w"];
        if(dados["h"]) this.p1.bounds.height = dados["h"];
		
		if(dados["classe"]) this.propriedades["classe"] = dados["classe"]; 
		if(dados["atributo"]) this.propriedades["atributo"] = dados["atributo"]; 
		if(dados["operacao"]) this.propriedades["operacao"] = dados["operacao"];
		}; 
		
	this.component.getXML = function(){
        this.p1 = this.children[0];
        this.p3 = this.children[1];
		this.p2 = this.children[2];
        this.p4 = this.children[3];
		this.p5 = this.children[4];
			
		xml = "<CallRetrieveOp id='"+ this.p1.name +"' text='" + this.p3.content + "' x='"+ this.p1.bounds.x +"' y='"+ this.p1.bounds.y + "' w='" + this.p1.bounds.width + "' h='" +this.p1.bounds.height + "' classe='" + this.propriedades["classe"] + "' operacao='Retrieve" + /*this.propriedades["operacao"] +*/ "'>\n" +
                "</CallRetrieveOp> \n";
        return xml;
    };
	
    this.component.getElement = function(doc){    	
        this.p1 = this.children[0];
        this.p3 = this.children[1];
		this.p2 = this.children[2];
        this.p4 = this.children[3];
		this.p5 = this.children[4];
		
		var element = doc.createElement("CallRetrieveOp");
		element.setAttribute("id", this.p1.name);
		element.setAttribute("text", this.p3.content);
		element.setAttribute("x", this.p1.bounds.x);
		element.setAttribute("y", this.p1.bounds.y);
		element.setAttribute("w", this.p1.bounds.width);
		element.setAttribute("h", this.p1.bounds.height);
		element.setAttribute("classe", this.propriedades["classe"]);
		element.setAttribute("operacao", "Retrieve");
        return element;
    };	
	
    var type = TYPES.ACTION_AIO;
	this.component.getType = function(){		
		return type;
	};
		
	//novo GETs
	this.component.getX = function(){
		var x = this.p1.bounds.x;
		
		return x;
	};
	
	this.component.getY = function(){
		var y = this.p1.bounds.y;
		
		return y;
	};
	
	this.component.getWidth = function(){
		var w = this.p1.bounds.width;
		
		return w;
	};
	
	this.component.getHeight = function(){
		var h = this.p1.bounds.height;
		
		return h;
	};
	
	//NOVO 08-04-2015
	this.component.getTipo = function(){
		var t = this.p4.name;
		
		return t;
	};
    
    this.posicionaMenu = function(){
		var dados={
			y: 20,
			w: 300,
			h: 100
		};
		this.component.mudaCoisas(dados);
	};
};

// ACTION AIO - CallDeleteOp
var myDeleteErase = function(){
	
	contador = contador + 1;
	contDeleteErase = contDeleteErase + 1;

	//rectangulo principal 
	this.p1 = new paper.Path.Rectangle(new paper.Point(200, 100), new paper.Size(200, 60));
    this.p1.strokeColor = "black";
    this.p1.name = "calldeleteop" + contDeleteErase;

	this.p3 = new paper.PointText({		//texto e cor do texto
        content: 'CallDeleteOp',		
        fillColor: 'black',
		fontSize: 15
    });
	
	// linha da seta "/"
	this.p2 = new paper.Path();  
	this.p2.add(new paper.Point(this.p1.bounds.x + 10, this.p1.bounds.y + 45));
	this.p2.add(new paper.Point(this.p1.bounds.x + 43.5, this.p1.bounds.y + 15));
	this.p2.strokeColor = "black";
	this.p2.strokeWidth = 2;

	this.p3.point = leftTextos(			//alinhar texto ? esquerda
            this.p1.bounds.width-90, 20,
            this.p1.bounds.x, this.p1.bounds.y,
            this.p3.bounds.width, this.p3.bounds.height
            );

	//tri?ngulo - ponta da seta		
	var center = new paper.Point(this.p1.bounds.x + 45, this.p1.bounds.y + 15);
	var sides = 3;
	var radius = 7;
	this.p4 = new paper.Path.RegularPolygon(center, sides, radius);
	this.p4.fillColor = 'black';	
	this.p4.rotate(45);	
	this.p4.name = "deleteerase_symbol";
	
	// linha do X "/"
	this.p5 = new paper.Path();  
	this.p5.add(new paper.Point(this.p1.bounds.x + 55, this.p1.bounds.y + 15));
	this.p5.add(new paper.Point(this.p1.bounds.x + 65, this.p1.bounds.y + 5));
	this.p5.strokeColor = "black";
	this.p5.strokeWidth = 2;
	
	// linha do X "\"
	this.p6 = new paper.Path();  
	this.p6.add(new paper.Point(this.p1.bounds.x + 55, this.p1.bounds.y + 5));
	this.p6.add(new paper.Point(this.p1.bounds.x + 65, this.p1.bounds.y + 15));
	this.p6.strokeColor = "black";
	this.p6.strokeWidth = 2;

	
	this.component = new paper.Group([this.p1, this.p3, this.p2, this.p4, this.p5, this.p6]);
    this.component.data ={
            nome:true,
            texto:true,
            size:0,
			classe: true
    };
	
	this.component.propriedades={
        classe : "",
		atributo : "",
		operacao: ""
        
    };
	
		this.component.mudaCoisas = function(dados){
        this.p1 = this.children[0];
        this.p3 = this.children[1];
		this.p2 = this.children[2];
        this.p4 = this.children[3];
		this.p5 = this.children[4];
		this.p6 = this.children[5];
		
        if(dados["nome"]) this.p1.name = dados["nome"];
        if(dados["texto"]) this.p3.content = dados["texto"];

        if(dados["x"]) this.p1.bounds.x = dados["x"];
        if(dados["y"]) this.p1.bounds.y = dados["y"];

        if(dados["w"]) this.p1.bounds.width = dados["w"];
        if(dados["h"]) this.p1.bounds.height = dados["h"];
		
		if(dados["classe"]) this.propriedades["classe"] = dados["classe"]; 
		if(dados["atributo"]) this.propriedades["atributo"] = dados["atributo"]; 
		if(dados["operacao"]) this.propriedades["operacao"] = dados["operacao"];
		}; 
		
	this.component.getXML = function(){
        this.p1 = this.children[0];
        this.p3 = this.children[1];
		this.p2 = this.children[2];
        this.p4 = this.children[3];
		this.p5 = this.children[4];
		this.p6 = this.children[5];
		
		xml = "<CallDeleteOp id='"+ this.p1.name +"' text='" + this.p3.content + "' x='"+ this.p1.bounds.x +"' y='"+ this.p1.bounds.y + "' w='" + this.p1.bounds.width + "' h='" +this.p1.bounds.height + "' classe='" + this.propriedades["classe"] + "' operacao='Delete" + /*this.propriedades["operacao"] +*/"'>\n" +
                "</CallDeleteOp> \n";
        return xml;
    };
    
    this.component.getElement = function(doc){    	
        this.p1 = this.children[0];
        this.p3 = this.children[1];
		this.p2 = this.children[2];
        this.p4 = this.children[3];
		this.p5 = this.children[4];
		this.p6 = this.children[5];
		
		var element = doc.createElement("CallDeleteOp");
		element.setAttribute("id", this.p1.name);
		element.setAttribute("text", this.p3.content);
		element.setAttribute("x", this.p1.bounds.x);
		element.setAttribute("y", this.p1.bounds.y);
		element.setAttribute("w", this.p1.bounds.width);
		element.setAttribute("h", this.p1.bounds.height);
		element.setAttribute("classe", this.propriedades["classe"]);
		element.setAttribute("operacao", "Delete");
        return element;
    };	
	
    var type = TYPES.ACTION_AIO;
	this.component.getType = function(){		
		return type;
	}; 
	    
	//novo GETs
	this.component.getX = function(){
		var x = this.p1.bounds.x;
		
		return x;
	};
	
	this.component.getY = function(){
		var y = this.p1.bounds.y;
		
		return y;
	};
	
	this.component.getWidth = function(){
		var w = this.p1.bounds.width;
		
		return w;
	};
	
	this.component.getHeight = function(){
		var h = this.p1.bounds.height;
		
		return h;
	};
	
	//NOVO 08-04-2015
	this.component.getTipo = function(){
		var t = this.p4.name;
		
		return t;
	};
	
    this.posicionaMenu = function(){
		var dados={
			y: 20,
			w: 300,
			h: 100
		};
		this.component.mudaCoisas(dados);
	};
};

// ACTION AIO - CallUpdateOp
var myModify = function(){
	contador = contador + 1;
	contModify = contModify + 1;

	//rectangulo principal 
	this.p1 = new paper.Path.Rectangle(new paper.Point(200, 100), new paper.Size(200, 60));
    this.p1.strokeColor = "black";
    this.p1.name = "callupdateop" + contModify;

	this.p3 = new paper.PointText({		//texto e cor do texto
        content: 'CallUpdateOp',		
        fillColor: 'black',
		fontSize: 15
    });
	
	// linha da seta "/"
	this.p2 = new paper.Path();  
	this.p2.add(new paper.Point(this.p1.bounds.x + 10, this.p1.bounds.y + 45));
	this.p2.add(new paper.Point(this.p1.bounds.x + 43.5, this.p1.bounds.y + 15));
	this.p2.strokeColor = "black";
	this.p2.strokeWidth = 2;

	this.p3.point = leftTextos(			//alinhar texto ? esquerda
            this.p1.bounds.width-90, 20,
            this.p1.bounds.x, this.p1.bounds.y,
            this.p3.bounds.width, this.p3.bounds.height
            );
	//tri?ngulo - ponta da seta		
	var center = new paper.Point(this.p1.bounds.x + 45, this.p1.bounds.y + 15);
	var sides = 3;
	var radius = 7;
	this.p4 = new paper.Path.RegularPolygon(center, sides, radius);
	this.p4.fillColor = 'black';	
	this.p4.rotate(45);	
	this.p4.name = "modify_symbol";
	
	//s?mbolo "~"
	this.p5 = new paper.PointText(new paper.Point(this.p1.bounds.x + 50, this.p1.bounds.y + 20));		
    this.p5.content = '~';		
    this.p5.fillColor = 'black';
	this.p5.fontSize = 30;
    			
	this.component = new paper.Group([this.p1, this.p3, this.p2, this.p4, this.p5]);
    this.component.data ={
            nome:true,
            texto:true,
            accao:false,
            valores:false,
            selected:false,
            size:0,
			classe: true
    };
	
	this.component.propriedades={
        classe : "",
		atributo : "",
		operacao : ""
        
    };
	
		this.component.mudaCoisas = function(dados){
        this.p1 = this.children[0];
        this.p3 = this.children[1];
		this.p2 = this.children[2];
        this.p4 = this.children[3];
		this.p5 = this.children[4];
				
        if(dados["nome"]) this.p1.name = dados["nome"];
        if(dados["texto"]) this.p3.content = dados["texto"];

        if(dados["x"]) this.p1.bounds.x = dados["x"];
        if(dados["y"]) this.p1.bounds.y = dados["y"];

        if(dados["w"]) this.p1.bounds.width = dados["w"];
        if(dados["h"]) this.p1.bounds.height = dados["h"];
		
		if(dados["classe"]) this.propriedades["classe"] = dados["classe"]; 
		if(dados["atributo"]) this.propriedades["atributo"] = dados["atributo"]; 
		if(dados["operacao"]) this.propriedades["operacao"] = dados["operacao"];
		}; 
		
	this.component.getXML = function(){
        this.p1 = this.children[0];
        this.p3 = this.children[1];
		this.p2 = this.children[2];
        this.p4 = this.children[3];
		this.p5 = this.children[4];
			
		xml = "<CallUpdateOp id='"+ this.p1.name +"' text='" + this.p3.content + "' x='"+ this.p1.bounds.x +"' y='"+ this.p1.bounds.y + "' w='" + this.p1.bounds.width + "' h='" +this.p1.bounds.height + "' classe='" + this.propriedades["classe"] + "' operacao='Update" + /*this.propriedades["operacao"] +*/ "'>\n" +
                "</CallUpdateOp> \n";
        return xml;
    };
	
    this.component.getElement = function(doc){    	
        this.p1 = this.children[0];
        this.p3 = this.children[1];
		this.p2 = this.children[2];
        this.p4 = this.children[3];
		this.p5 = this.children[4];
		
		var element = doc.createElement("CallUpdateOp");
		element.setAttribute("id", this.p1.name);
		element.setAttribute("text", this.p3.content);
		element.setAttribute("x", this.p1.bounds.x);
		element.setAttribute("y", this.p1.bounds.y);
		element.setAttribute("w", this.p1.bounds.width);
		element.setAttribute("h", this.p1.bounds.height);
		element.setAttribute("classe", this.propriedades["classe"]);
		element.setAttribute("operacao", "Update");
        return element;
    };	
	
    var type = TYPES.ACTION_AIO;
	this.component.getType = function(){		
		return type;
	}; 
		
	//novo GETs
	this.component.getX = function(){
		var x = this.p1.bounds.x;
		
		return x;
	};
	
	this.component.getY = function(){
		var y = this.p1.bounds.y;
		
		return y;
	};
	
	this.component.getWidth = function(){
		var w = this.p1.bounds.width;
		
		return w;
	};
	
	this.component.getHeight = function(){
		var h = this.p1.bounds.height;
		
		return h;
	};
	
	//NOVO 08-04-2015
	this.component.getTipo = function(){
		var t = this.p4.name;
		
		return t;
	};
    
    this.posicionaMenu = function(){
		var dados={
			y: 20,
			w: 300,
			h: 100
		};
		this.component.mudaCoisas(dados);
	};	
};

// ACTION AIO - CallCreateOp
var myCreate = function(){
	contador = contador + 1;
	contCreate = contCreate + 1;

	//rectangulo principal 
	this.p1 = new paper.Path.Rectangle(new paper.Point(200, 100), new paper.Size(200, 60));
    this.p1.strokeColor = "black";
    this.p1.name = "callcreateop" + contCreate;

	this.p3 = new paper.PointText({		//texto e cor do texto
        content: 'CallCreateOp',		
        fillColor: 'black',
		fontSize: 15
    });
	
	// linha da seta "/"
	this.p2 = new paper.Path();  
	this.p2.add(new paper.Point(this.p1.bounds.x + 10, this.p1.bounds.y + 45));
	this.p2.add(new paper.Point(this.p1.bounds.x + 43.5, this.p1.bounds.y + 15));
	this.p2.strokeColor = "black";
	this.p2.strokeWidth = 2;

	this.p3.point = leftTextos(			//alinhar texto ? esquerda
            this.p1.bounds.width-90, 20,
            this.p1.bounds.x, this.p1.bounds.y,
            this.p3.bounds.width, this.p3.bounds.height
            );
	//tri?ngulo - ponta da seta		
	var center = new paper.Point(this.p1.bounds.x + 45, this.p1.bounds.y + 15);
	var sides = 3;
	var radius = 7;
	this.p4 = new paper.Path.RegularPolygon(center, sides, radius);
	this.p4.fillColor = 'black';	
	this.p4.rotate(45);	
	this.p4.name = "create_symbol";
	
	//estrela
	var centerstar = new paper.Point(this.p1.bounds.x + 60, this.p1.bounds.y + 10);
	var points = 5;
	var radius1 = 4;
	var radius2 = 7;
	this.p5 = new paper.Path.Star(centerstar, points, radius1, radius2);
	this.p5.fillColor = 'black';
	
			
	this.component = new paper.Group([this.p1, this.p3, this.p2, this.p4, this.p5]);
    this.component.data ={
            nome:true,
            texto:true,
            size:0,
			classe: true
    };
	
	this.component.propriedades={
        classe : "",
		atributo : "",
		operacao : ""
        
    };
	
		this.component.mudaCoisas = function(dados){
        this.p1 = this.children[0];
        this.p3 = this.children[1];
		this.p2 = this.children[2];
        this.p4 = this.children[3];
		this.p5 = this.children[4];
		
        if(dados["nome"]) this.p1.name = dados["nome"];
        if(dados["texto"]) this.p3.content = dados["texto"];

        if(dados["x"]) this.p1.bounds.x = dados["x"];
        if(dados["y"]) this.p1.bounds.y = dados["y"];

        if(dados["w"]) this.p1.bounds.width = dados["w"];
        if(dados["h"]) this.p1.bounds.height = dados["h"];
		
		if(dados["classe"]) this.propriedades["classe"] = dados["classe"]; 
		if(dados["atributo"]) this.propriedades["atributo"] = dados["atributo"];
		if(dados["operacao"]) this.propriedades["operacao"] = dados["operacao"];
		}; 
		
	this.component.getXML = function(){
        this.p1 = this.children[0];
        this.p3 = this.children[1];
		this.p2 = this.children[2];
        this.p4 = this.children[3];
		this.p5 = this.children[4];
		
		xml = "<CallCreateOp id='"+ this.p1.name +"' text='" + this.p3.content + "' x='"+ this.p1.bounds.x +"' y='"+ this.p1.bounds.y + "' w='" + this.p1.bounds.width + "' h='" +this.p1.bounds.height + "' classe='" + this.propriedades["classe"] + "' operacao='Create" + /*this.propriedades["operacao"] +*/ "'>\n" +
                "</CallCreateOp> \n";
        return xml;
    };
    
    this.component.getElement = function(doc){    	
        this.p1 = this.children[0];
        this.p3 = this.children[1];
		this.p2 = this.children[2];
        this.p4 = this.children[3];
		this.p5 = this.children[4];
		
		var element = doc.createElement("CallCreateOp");
		element.setAttribute("id", this.p1.name);
		element.setAttribute("text", this.p3.content);
		element.setAttribute("x", this.p1.bounds.x);
		element.setAttribute("y", this.p1.bounds.y);
		element.setAttribute("w", this.p1.bounds.width);
		element.setAttribute("h", this.p1.bounds.height);
		element.setAttribute("classe", this.propriedades["classe"]);
		element.setAttribute("operacao", "Create");
        return element;
    };	
	
    var type = TYPES.ACTION_AIO;
	this.component.getType = function(){		
		return type;
	};    
	
		//novo GETs
	this.component.getX = function(){
		var x = this.p1.bounds.x;
		
		return x;
	};
	
	this.component.getY = function(){
		var y = this.p1.bounds.y;
		
		return y;
	};
	
	this.component.getWidth = function(){
		var w = this.p1.bounds.width;
		
		return w;
	};
	
	this.component.getHeight = function(){
		var h = this.p1.bounds.height;
		
		return h;
	};
	
		//NOVO 08-04-2015
	this.component.getTipo = function(){
		var t = this.p4.name;
		
		return t;
	};
    
    this.posicionaMenu = function(){
		var dados={
			y: 20,
			w: 300,
			h: 100
		};
		this.component.mudaCoisas(dados);
	};
};

// ACTION AIO - ToViewInstance
var myView = function(){
	var target = "";
	contador = contador + 1;
	contView = contView + 1;
	
	//rectangulo principal 
	this.p1 = new paper.Path.Rectangle(new paper.Point(200, 100), new paper.Size(200, 60));
    this.p1.strokeColor = "black";
    this.p1.name = "toviewinstance" + contView;

	this.p3 = new paper.PointText({		//texto e cor do texto
        content: 'ToViewInstance',		
        fillColor: 'black',
		fontSize: 15
    });
	
	// linha da seta "/"
	this.p2 = new paper.Path();  
	this.p2.add(new paper.Point(this.p1.bounds.x + 10, this.p1.bounds.y + 45));
	this.p2.add(new paper.Point(this.p1.bounds.x + 43.5, this.p1.bounds.y + 15));
	this.p2.strokeColor = "black";
	this.p2.strokeWidth = 2;

	this.p3.point = leftTextos(			//alinhar texto ? esquerda
            this.p1.bounds.width-90, 20,
            this.p1.bounds.x, this.p1.bounds.y,
            this.p3.bounds.width, this.p3.bounds.height
            );
			
	//triangulo - ponta da seta		
	var center = new paper.Point(this.p1.bounds.x + 45, this.p1.bounds.y + 15);
	var sides = 3;
	var radius = 7;
	this.p4 = new paper.Path.RegularPolygon(center, sides, radius);
	this.p4.fillColor = 'black';	
	this.p4.rotate(45);	
	this.p4.name = "view_symbol";
	
	//quadrado
	this.p5 = new paper.Path.Rectangle(new paper.Point(this.p1.bounds.x + 55, this.p1.bounds.y + 5), new paper.Size(12, 12));
    this.p5.strokeColor = "black"; 
			
	this.component = new paper.Group([this.p1, this.p3, this.p2, this.p4, this.p5]);
    this.component.data ={
            nome:true,
            texto:true,
            size:0,
			classe: true
    };
	
	this.component.propriedades={
        classe : "",
		atributo : ""
        
    };
	
		this.component.mudaCoisas = function(dados){
        this.p1 = this.children[0];
        this.p3 = this.children[1];
		this.p2 = this.children[2];
        this.p4 = this.children[3];
		this.p5 = this.children[4];
		
		if(dados["target"]) target = dados["target"];
        if(dados["nome"]) this.p1.name = dados["nome"];
        if(dados["texto"]) this.p3.content = dados["texto"];

        if(dados["x"]) this.p1.bounds.x = dados["x"];
        if(dados["y"]) this.p1.bounds.y = dados["y"];

        if(dados["w"]) this.p1.bounds.width = dados["w"];
        if(dados["h"]) this.p1.bounds.height = dados["h"];
		
		if(dados["classe"]) this.propriedades["classe"] = dados["classe"]; 
		if(dados["atributo"]) this.propriedades["atributo"] = dados["atributo"]; 
		}; 
		
	this.component.getXML = function(){
        this.p1 = this.children[0];
        this.p3 = this.children[1];
		this.p2 = this.children[2];
        this.p4 = this.children[3];
		this.p5 = this.children[4];
			
		xml = "<ToViewInstance id='"+ this.p1.name +"' text='" + this.p3.content + "' x='"+ this.p1.bounds.x +"' y='"+ this.p1.bounds.y + "' w='" + this.p1.bounds.width + "' h='" +this.p1.bounds.height + "' classe='" + this.propriedades["classe"] + "'>\n" +
                "</ToViewInstance> \n";
        return xml;
    };
    
    this.component.getElement = function(doc){    	
        this.p1 = this.children[0];
        this.p3 = this.children[1];
		this.p2 = this.children[2];
        this.p4 = this.children[3];
		this.p5 = this.children[4];
		
		var element = doc.createElement("ToViewInstance");
		element.setAttribute("id", this.p1.name);
		element.setAttribute("text", this.p3.content);
		element.setAttribute("x", this.p1.bounds.x);
		element.setAttribute("y", this.p1.bounds.y);
		element.setAttribute("w", this.p1.bounds.width);
		element.setAttribute("h", this.p1.bounds.height);
		element.setAttribute("classe", this.propriedades["classe"]);
		element.setAttribute("target", target);
        return element;
    };	
	
    var type = TYPES.ACTION_AIO_TARGET;
	this.component.getType = function(){		
		return type;
	};    
	
	this.component.getTarget = function(){		
		return target;
	};
		
	//novo GETs
	this.component.getX = function(){
		var x = this.p1.bounds.x;
		
		return x;
	};
	
	this.component.getY = function(){
		var y = this.p1.bounds.y;
		
		return y;
	};
	
	this.component.getWidth = function(){
		var w = this.p1.bounds.width;
		
		return w;
	};
	
	this.component.getHeight = function(){
		var h = this.p1.bounds.height;
		
		return h;
	};
	
	//NOVO 08-04-2015
	this.component.getTipo = function(){
		var t = this.p4.name;
		
		return t;
	};
    
    this.posicionaMenu = function(){
		var dados={
			y: 20,
			w: 300,
			h: 100
		};
		this.component.mudaCoisas(dados);
	};
};

// ACTION AIO - ToUpdateInstance
var myStartGoTo3 = function(){
	var target = "";
	contador = contador + 1;
	contStartGoTo = contStartGoTo +1;
	
	//rectangulo principal 
	this.p1 = new paper.Path.Rectangle(new paper.Point(200, 100), new paper.Size(200, 60));
    this.p1.strokeColor = "black";
    this.p1.name = "toupdateinstance" + contStartGoTo ;

	this.p3 = new paper.PointText({		//texto e cor do texto
        content: 'ToUpdateInstance',		
        fillColor: 'black',
		fontSize: 15
    });
	
	// linha da seta "/"
	this.p2 = new paper.Path();  
	this.p2.add(new paper.Point(this.p1.bounds.x + 10, this.p1.bounds.y + 45));
	this.p2.add(new paper.Point(this.p1.bounds.x + 43.5, this.p1.bounds.y + 15));
	this.p2.strokeColor = "black";
	this.p2.strokeWidth = 2;

	this.p3.point = leftTextos(			//alinhar texto ? esquerda
            this.p1.bounds.width-90, 20,
            this.p1.bounds.x, this.p1.bounds.y,
            this.p3.bounds.width, this.p3.bounds.height
            );
	//tri?ngulo - ponta da seta		
	var center = new paper.Point(this.p1.bounds.x + 45, this.p1.bounds.y + 15);
	var sides = 3;
	var radius = 7;
	this.p4 = new paper.Path.RegularPolygon(center, sides, radius);
	this.p4.fillColor = 'black';	
	this.p4.rotate(45);
	this.p4.name = "startgoto_symbol";	
	
	//circulo
	var center = new paper.Point(this.p1.bounds.x + 60, this.p1.bounds.y + 10);
	//var points = 5;
	var radius = 5;
	//var radius2 = 7;
	this.p5 = new paper.Path.Circle(center, radius);
	this.p5.fillColor = 'black';
	
			
	this.component = new paper.Group([this.p1, this.p3, this.p2, this.p4, this.p5]);
    this.component.data ={
            nome:true,
            texto:true,
            accao:false,
            valores:false,
            selected:false,
            size:0,
			classe: true
    };
	
	this.component.propriedades={
        classe : "",
		atributo : ""
        
    };
	
		this.component.mudaCoisas = function(dados){
        this.p1 = this.children[0];
        this.p3 = this.children[1];
		this.p2 = this.children[2];
        this.p4 = this.children[3];
		this.p5 = this.children[4];
		
		if(dados["target"]) target = dados["target"];
        if(dados["nome"]) this.p1.name = dados["nome"];
        if(dados["texto"]) this.p3.content = dados["texto"];

        if(dados["x"]) this.p1.bounds.x = dados["x"];
        if(dados["y"]) this.p1.bounds.y = dados["y"];

        if(dados["w"]) this.p1.bounds.width = dados["w"];
        if(dados["h"]) this.p1.bounds.height = dados["h"];
		
		if(dados["classe"]) this.propriedades["classe"] = dados["classe"]; 
		if(dados["atributo"]) this.propriedades["atributo"] = dados["atributo"];
		}; 
		
	this.component.getXML = function(){
        this.p1 = this.children[0];
        this.p3 = this.children[1];
		this.p2 = this.children[2];
        this.p4 = this.children[3];
		this.p5 = this.children[4];
			
		xml = "<ToUpdateInstance id='"+ this.p1.name +"' text='" + this.p3.content + "' x='"+ this.p1.bounds.x +"' y='"+ this.p1.bounds.y + "' w='" + this.p1.bounds.width + "' h='" +this.p1.bounds.height + "' classe='" + this.propriedades["classe"] + "'>\n" +
                "</ToUpdateInstance> \n";
        return xml;
    };
	
    this.component.getElement = function(doc){    	
        this.p1 = this.children[0];
        this.p3 = this.children[1];
		this.p2 = this.children[2];
        this.p4 = this.children[3];
		this.p5 = this.children[4];
		
		var element = doc.createElement("ToUpdateInstance");
		element.setAttribute("id", this.p1.name);
		element.setAttribute("text", this.p3.content);
		element.setAttribute("x", this.p1.bounds.x);
		element.setAttribute("y", this.p1.bounds.y);
		element.setAttribute("w", this.p1.bounds.width);
		element.setAttribute("h", this.p1.bounds.height);
		element.setAttribute("classe", this.propriedades["classe"]);
		element.setAttribute("target", target);
        return element;
    };	
	
    var type = TYPES.ACTION_AIO_TARGET;
	this.component.getType = function(){		
		return type;
	};
	
	this.component.getTarget = function(){		
		return target;
	};
			
	//novo GETs
	this.component.getX = function(){
		var x = this.p1.bounds.x;
		
		return x;
	};
	
	this.component.getY = function(){
		var y = this.p1.bounds.y;
		
		return y;
	};
	
	this.component.getWidth = function(){
		var w = this.p1.bounds.width;
		
		return w;
	};
	
	this.component.getHeight = function(){
		var h = this.p1.bounds.height;
		
		return h;
	};
    
	//NOVO 08-04-2015
	this.component.getTipo = function(){
		var t = this.p4.name;
		
		return t;
	};
	
    this.posicionaMenu = function(){
		var dados={
			y: 20,
			w: 300,
			h: 100
		};
		this.component.mudaCoisas(dados);
	};
};

// ACTION AIO - ToCreateInstance
var myStartGoTo2 = function(){
	var target = "";
	contador = contador + 1;
	contStartGoTo = contStartGoTo +1;
	
	//rectangulo principal 
	this.p1 = new paper.Path.Rectangle(new paper.Point(200, 100), new paper.Size(200, 60));
    this.p1.strokeColor = "black";
    this.p1.name = "tocreateinstance" + contStartGoTo ;

	this.p3 = new paper.PointText({		//texto e cor do texto
        content: 'ToCreateInstance',		
        fillColor: 'black',
		fontSize: 15
    });
	
	// linha da seta "/"
	this.p2 = new paper.Path();  
	this.p2.add(new paper.Point(this.p1.bounds.x + 10, this.p1.bounds.y + 45));
	this.p2.add(new paper.Point(this.p1.bounds.x + 43.5, this.p1.bounds.y + 15));
	this.p2.strokeColor = "black";
	this.p2.strokeWidth = 2;

	this.p3.point = leftTextos(			//alinhar texto ? esquerda
            this.p1.bounds.width-90, 20,
            this.p1.bounds.x, this.p1.bounds.y,
            this.p3.bounds.width, this.p3.bounds.height
            );
	//tri?ngulo - ponta da seta		
	var center = new paper.Point(this.p1.bounds.x + 45, this.p1.bounds.y + 15);
	var sides = 3;
	var radius = 7;
	this.p4 = new paper.Path.RegularPolygon(center, sides, radius);
	this.p4.fillColor = 'black';	
	this.p4.rotate(45);
	this.p4.name = "startgoto_symbol";	
	
	//circulo
	var center = new paper.Point(this.p1.bounds.x + 60, this.p1.bounds.y + 10);
	//var points = 5;
	var radius = 5;
	//var radius2 = 7;
	this.p5 = new paper.Path.Circle(center, radius);
	this.p5.fillColor = 'black';
	
			
	this.component = new paper.Group([this.p1, this.p3, this.p2, this.p4, this.p5]);
    this.component.data ={
            nome:true,
            texto:true,
            accao:false,
            valores:false,
            selected:false,
            size:0,
			classe: true
    };
	
	this.component.propriedades={
        classe : "",
		atributo : ""
        
    };
	
		this.component.mudaCoisas = function(dados){
        this.p1 = this.children[0];
        this.p3 = this.children[1];
		this.p2 = this.children[2];
        this.p4 = this.children[3];
		this.p5 = this.children[4];
				
		if(dados["target"]) target = dados["target"];
        if(dados["nome"]) this.p1.name = dados["nome"];
        if(dados["texto"]) this.p3.content = dados["texto"];

        if(dados["x"]) this.p1.bounds.x = dados["x"];
        if(dados["y"]) this.p1.bounds.y = dados["y"];

        if(dados["w"]) this.p1.bounds.width = dados["w"];
        if(dados["h"]) this.p1.bounds.height = dados["h"];
		
		if(dados["classe"]) this.propriedades["classe"] = dados["classe"]; 
		if(dados["atributo"]) this.propriedades["atributo"] = dados["atributo"];
		}; 
		
	this.component.getXML = function(){
        this.p1 = this.children[0];
        this.p3 = this.children[1];
		this.p2 = this.children[2];
        this.p4 = this.children[3];
		this.p5 = this.children[4];
			
		xml = "<ToCreateInstance id='"+ this.p1.name +"' text='" + this.p3.content + "' x='"+ this.p1.bounds.x +"' y='"+ this.p1.bounds.y + "' w='" + this.p1.bounds.width + "' h='" +this.p1.bounds.height + "' classe='" + this.propriedades["classe"] + "'>\n" +
                "</ToCreateInstance> \n";
        return xml;
    };
		
    this.component.getElement = function(doc){    	
        this.p1 = this.children[0];
        this.p3 = this.children[1];
		this.p2 = this.children[2];
        this.p4 = this.children[3];
		this.p5 = this.children[4];
		
		var element = doc.createElement("ToCreateInstance");
		element.setAttribute("id", this.p1.name);
		element.setAttribute("text", this.p3.content);
		element.setAttribute("x", this.p1.bounds.x);
		element.setAttribute("y", this.p1.bounds.y);
		element.setAttribute("w", this.p1.bounds.width);
		element.setAttribute("h", this.p1.bounds.height);
		element.setAttribute("classe", this.propriedades["classe"]);
		element.setAttribute("target", target);
        return element;
    };	
	
    var type = TYPES.ACTION_AIO_TARGET;
	this.component.getType = function(){		
		return type;
	};
		
	this.component.getTarget = function(){		
		return target;
	};
			
	//novo GETs
	this.component.getX = function(){
		var x = this.p1.bounds.x;
		
		return x;
	};
	
	this.component.getY = function(){
		var y = this.p1.bounds.y;
		
		return y;
	};
	
	this.component.getWidth = function(){
		var w = this.p1.bounds.width;
		
		return w;
	};
	
	this.component.getHeight = function(){
		var h = this.p1.bounds.height;
		
		return h;
	};
    
	//NOVO 08-04-2015
	this.component.getTipo = function(){
		var t = this.p4.name;
		
		return t;
	};
	
    this.posicionaMenu = function(){
		var dados={
			y: 20,
			w: 300,
			h: 100
		};
		this.component.mudaCoisas(dados);
	};
};

// ACTION AIO - SelectOKOp
var mySelect = function(){
	contador = contador + 1;
	contSelect = contSelect + 1;

	//rectangulo principal 
	this.p1 = new paper.Path.Rectangle(new paper.Point(200, 100), new paper.Size(200, 60));
    this.p1.strokeColor = "black";
    this.p1.name = "selectokop" + contSelect;

	this.p3 = new paper.PointText({		//texto e cor do texto
        content: 'SelectOKOp',		
        fillColor: 'black',
		fontSize: 15
    });

	// linha da seta "/"
	this.p2 = new paper.Path();  
	this.p2.add(new paper.Point(this.p1.bounds.x + 10, this.p1.bounds.y + 45));
	this.p2.add(new paper.Point(this.p1.bounds.x + 43.5, this.p1.bounds.y + 15));
	this.p2.strokeColor = "black";
	this.p2.strokeWidth = 2;

	this.p3.point = leftTextos(			//alinhar texto ? esquerda
            this.p1.bounds.width-90, 20,
            this.p1.bounds.x, this.p1.bounds.y,
            this.p3.bounds.width, this.p3.bounds.height
            );
			
	//tri?ngulo - ponta da seta		
	var center = new paper.Point(this.p1.bounds.x + 45, this.p1.bounds.y + 15);
	var sides = 3;
	var radius = 7;
	this.p4 = new paper.Path.RegularPolygon(center, sides, radius);
	this.p4.fillColor = 'black';	
	this.p4.rotate(45);	
	this.p4.name = "select_symbol";
	
	// linha "-" 2
	this.p5 = new paper.Path();  
	this.p5.add(new paper.Point(this.p1.bounds.x + 50, this.p1.bounds.y + 10));
	this.p5.add(new paper.Point(this.p1.bounds.x + 75, this.p1.bounds.y + 10));
	this.p5.strokeColor = "black";
	this.p5.strokeWidth = 3;
		
    this.component = new paper.Group([this.p1, this.p3, this.p2, this.p4, this.p5]);
    this.component.data ={
            nome:true,
            texto:true,
            size:0,
			classe: true
    };
	
	this.component.propriedades={
        classe : "",
		atributo : ""
        
    };
	
		this.component.mudaCoisas = function(dados){
        this.p1 = this.children[0];
        this.p3 = this.children[1];
		this.p2 = this.children[2];
        this.p4 = this.children[3];
		this.p5 = this.children[4];
				
        if(dados["nome"]) this.p1.name = dados["nome"];
        if(dados["texto"]) this.p3.content = dados["texto"];

        if(dados["x"]) this.p1.bounds.x = dados["x"];
        if(dados["y"]) this.p1.bounds.y = dados["y"];

        if(dados["w"]) this.p1.bounds.width = dados["w"];
        if(dados["h"]) this.p1.bounds.height = dados["h"];
		
		if(dados["classe"]) this.propriedades["classe"] = dados["classe"]; 
		if(dados["atributo"]) this.propriedades["atributo"] = dados["atributo"]; 
		}; 
		
	this.component.getXML = function(){
        this.p1 = this.children[0];
        this.p3 = this.children[1];
		this.p2 = this.children[2];
        this.p4 = this.children[3];
		this.p5 = this.children[4];
			
		xml = "<SelectOKOp id='"+ this.p1.name +"' text='" + this.p3.content + "' x='"+ this.p1.bounds.x +"' y='"+ this.p1.bounds.y + "' w='" + this.p1.bounds.width + "' h='" +this.p1.bounds.height + "' classe='" + this.propriedades["classe"] + "'>\n" +
                "</SelectOKOp> \n";
        return xml;
    };
	
    this.component.getElement = function(doc){    	
        this.p1 = this.children[0];
        this.p3 = this.children[1];
		this.p2 = this.children[2];
        this.p4 = this.children[3];
		this.p5 = this.children[4];
		
		var element = doc.createElement("SelectOKOp");
		element.setAttribute("id", this.p1.name);
		element.setAttribute("text", this.p3.content);
		element.setAttribute("x", this.p1.bounds.x);
		element.setAttribute("y", this.p1.bounds.y);
		element.setAttribute("w", this.p1.bounds.width);
		element.setAttribute("h", this.p1.bounds.height);
		element.setAttribute("classe", this.propriedades["classe"]);
        return element;
    };	
	
    var type = TYPES.ACTION_AIO;
	this.component.getType = function(){		
		return type;
	};
		
	//novo GETs
	this.component.getX = function(){
		var x = this.p1.bounds.x;
		
		return x;
	};
	
	this.component.getY = function(){
		var y = this.p1.bounds.y;
		
		return y;
	};
	
	this.component.getWidth = function(){
		var w = this.p1.bounds.width;
		
		return w;
	};
	
	this.component.getHeight = function(){
		var h = this.p1.bounds.height;
		
		return h;
	};
	
		//NOVO 08-04-2015
	this.component.getTipo = function(){
		var t = this.p4.name;
		
		return t;
	};
    
    this.posicionaMenu = function(){
		var dados={
			y: 20,
			w: 300,
			h: 100
		};
		this.component.mudaCoisas(dados);
	};
};

// ACTION AIO - CloseOp
var myStopEndComplete2 = function(){
	contador = contador + 1;
	contStopEndComplete = contStopEndComplete + 1;
	
	//rectangulo principal 
	this.p1 = new paper.Path.Rectangle(new paper.Point(200, 100), new paper.Size(200, 60));
    this.p1.strokeColor = "black";
    this.p1.name = "closeop" + contStopEndComplete;

	this.p3 = new paper.PointText({		//texto e cor do texto
        content: 'CloseOp',		
        fillColor: 'black',
		fontSize: 15
    });

	// linha da seta "/"
	this.p2 = new paper.Path();  
	this.p2.add(new paper.Point(this.p1.bounds.x + 10, this.p1.bounds.y + 45));
	this.p2.add(new paper.Point(this.p1.bounds.x + 43.5, this.p1.bounds.y + 15));
	this.p2.strokeColor = "black";
	this.p2.strokeWidth = 2;

	this.p3.point = leftTextos(			//alinhar texto ? esquerda
            this.p1.bounds.width-90, 20,
            this.p1.bounds.x, this.p1.bounds.y,
            this.p3.bounds.width, this.p3.bounds.height
            );
			
	//tri?ngulo - ponta da seta		
	var center = new paper.Point(this.p1.bounds.x + 45, this.p1.bounds.y + 15);
	var sides = 3;
	var radius = 7;
	this.p4 = new paper.Path.RegularPolygon(center, sides, radius);
	this.p4.fillColor = 'black';	
	this.p4.rotate(45);	
	this.p4.name = "stopendcomplete_symbol";
	
	// linha "|" 2
	this.p5 = new paper.Path();  
	this.p5.add(new paper.Point(this.p1.bounds.x + 50, this.p1.bounds.y + 10));
	this.p5.add(new paper.Point(this.p1.bounds.x + 50, this.p1.bounds.y + 40));
	this.p5.strokeColor = "black";
	this.p5.strokeWidth = 2;
		
    this.component = new paper.Group([this.p1, this.p3, this.p2, this.p4, this.p5]);
    this.component.data ={
            nome:true,
            texto:true,
            size:0,
			classe: true
    };
	
	this.component.propriedades={
        classe : "",
		atributo : ""
        
    };

		this.component.mudaCoisas = function(dados){
        this.p1 = this.children[0];
        this.p3 = this.children[1];
		this.p2 = this.children[2];
        this.p4 = this.children[3];
		this.p5 = this.children[4];
				
        if(dados["nome"]) this.p1.name = dados["nome"];
        if(dados["texto"]) this.p3.content = dados["texto"];

        if(dados["x"]) this.p1.bounds.x = dados["x"];
        if(dados["y"]) this.p1.bounds.y = dados["y"];

        if(dados["w"]) this.p1.bounds.width = dados["w"];
        if(dados["h"]) this.p1.bounds.height = dados["h"];
		
		if(dados["classe"]) this.propriedades["classe"] = dados["classe"]; 
		if(dados["atributo"]) this.propriedades["atributo"] = dados["atributo"]; 
		}; 
		
	this.component.getXML = function(){
        this.p1 = this.children[0];
        this.p3 = this.children[1];
		this.p2 = this.children[2];
        this.p4 = this.children[3];
		this.p5 = this.children[4];
			
		xml = "<CloseOp id='"+ this.p1.name +"' text='" + this.p3.content + "' x='"+ this.p1.bounds.x +"' y='"+ this.p1.bounds.y + "' w='" + this.p1.bounds.width + "' h='" +this.p1.bounds.height + "' classe='" + this.propriedades["classe"] + "'>\n" +
                "</CloseOp> \n";
        return xml;
    };
	
    this.component.getElement = function(doc){    	
        this.p1 = this.children[0];
        this.p3 = this.children[1];
		this.p2 = this.children[2];
        this.p4 = this.children[3];
		this.p5 = this.children[4];
		
		var element = doc.createElement("CloseOp");
		element.setAttribute("id", this.p1.name);
		element.setAttribute("text", this.p3.content);
		element.setAttribute("x", this.p1.bounds.x);
		element.setAttribute("y", this.p1.bounds.y);
		element.setAttribute("w", this.p1.bounds.width);
		element.setAttribute("h", this.p1.bounds.height);
		element.setAttribute("classe", this.propriedades["classe"]);
        return element;
    };	
	
    var type = TYPES.ACTION_AIO;
	this.component.getType = function(){		
		return type;
	};	
		
	//novo GETs
	this.component.getX = function(){
		var x = this.p1.bounds.x;
		
		return x;
	};
	
	this.component.getY = function(){
		var y = this.p1.bounds.y;
		
		return y;
	};
	
	this.component.getWidth = function(){
		var w = this.p1.bounds.width;
		
		return w;
	};
	
	this.component.getHeight = function(){
		var h = this.p1.bounds.height;
		
		return h;
	};
    
	//NOVO 08-04-2015
	this.component.getTipo = function(){
		var t = this.p4.name;
		
		return t;
	};
	
    this.posicionaMenu = function(){
		var dados={
			y: 20,
			w: 300,
			h: 100
		};
		this.component.mudaCoisas(dados);
	};
};

// ACTION AIO CancelOp
var myStopEndComplete = function(){
	contador = contador + 1;
	contStopEndComplete = contStopEndComplete + 1;
	
	//rectangulo principal 
	this.p1 = new paper.Path.Rectangle(new paper.Point(200, 100), new paper.Size(200, 60));
    this.p1.strokeColor = "black";
    this.p1.name = "cancelop" + contStopEndComplete;

	this.p3 = new paper.PointText({		//texto e cor do texto
        content: 'CancelOp',		
        fillColor: 'black',
		fontSize: 15
    });

	// linha da seta "/"
	this.p2 = new paper.Path();  
	this.p2.add(new paper.Point(this.p1.bounds.x + 10, this.p1.bounds.y + 45));
	this.p2.add(new paper.Point(this.p1.bounds.x + 43.5, this.p1.bounds.y + 15));
	this.p2.strokeColor = "black";
	this.p2.strokeWidth = 2;

	this.p3.point = leftTextos(			//alinhar texto ? esquerda
            this.p1.bounds.width-90, 20,
            this.p1.bounds.x, this.p1.bounds.y,
            this.p3.bounds.width, this.p3.bounds.height
            );
			
	//tri?ngulo - ponta da seta		
	var center = new paper.Point(this.p1.bounds.x + 45, this.p1.bounds.y + 15);
	var sides = 3;
	var radius = 7;
	this.p4 = new paper.Path.RegularPolygon(center, sides, radius);
	this.p4.fillColor = 'black';	
	this.p4.rotate(45);	
	this.p4.name = "stopendcomplete_symbol";
	
	// linha "|" 2
	this.p5 = new paper.Path();  
	this.p5.add(new paper.Point(this.p1.bounds.x + 50, this.p1.bounds.y + 10));
	this.p5.add(new paper.Point(this.p1.bounds.x + 50, this.p1.bounds.y + 40));
	this.p5.strokeColor = "black";
	this.p5.strokeWidth = 2;
		
    this.component = new paper.Group([this.p1, this.p3, this.p2, this.p4, this.p5]);
    this.component.data ={
            nome:true,
            texto:true,
            size:0,
			classe: true
    };
	
	this.component.propriedades={
        classe : "",
		atributo : ""
        
    };

		this.component.mudaCoisas = function(dados){
        this.p1 = this.children[0];
        this.p3 = this.children[1];
		this.p2 = this.children[2];
        this.p4 = this.children[3];
		this.p5 = this.children[4];
				
        if(dados["nome"]) this.p1.name = dados["nome"];
        if(dados["texto"]) this.p3.content = dados["texto"];

        if(dados["x"]) this.p1.bounds.x = dados["x"];
        if(dados["y"]) this.p1.bounds.y = dados["y"];

        if(dados["w"]) this.p1.bounds.width = dados["w"];
        if(dados["h"]) this.p1.bounds.height = dados["h"];
		
		if(dados["classe"]) this.propriedades["classe"] = dados["classe"]; 
		if(dados["atributo"]) this.propriedades["atributo"] = dados["atributo"]; 
		}; 
		
	this.component.getXML = function(){
        this.p1 = this.children[0];
        this.p3 = this.children[1];
		this.p2 = this.children[2];
        this.p4 = this.children[3];
		this.p5 = this.children[4];
			
		xml = "<CancelOp id='"+ this.p1.name +"' text='" + this.p3.content + "' x='"+ this.p1.bounds.x +"' y='"+ this.p1.bounds.y + "' w='" + this.p1.bounds.width + "' h='" +this.p1.bounds.height + "' classe='" + this.propriedades["classe"] + "'>\n" +
                "</CancelOp> \n";
        return xml;
    };
	
	this.component.getElement = function(doc){    	
        this.p1 = this.children[0];
        this.p3 = this.children[1];
		this.p2 = this.children[2];
        this.p4 = this.children[3];
		this.p5 = this.children[4];
		
		var element = doc.createElement("CancelOp");
		element.setAttribute("id", this.p1.name);
		element.setAttribute("text", this.p3.content);
		element.setAttribute("x", this.p1.bounds.x);
		element.setAttribute("y", this.p1.bounds.y);
		element.setAttribute("w", this.p1.bounds.width);
		element.setAttribute("h", this.p1.bounds.height);
		element.setAttribute("classe", this.propriedades["classe"]);
        return element;
    };	
	
    var type = TYPES.ACTION_AIO;
	this.component.getType = function(){		
		return type;
	};	
	
	//novo GETs
	this.component.getX = function(){
		var x = this.p1.bounds.x;
		
		return x;
	};
	
	this.component.getY = function(){
		var y = this.p1.bounds.y;
		
		return y;
	};
	
	this.component.getWidth = function(){
		var w = this.p1.bounds.width;
		
		return w;
	};
	
	this.component.getHeight = function(){
		var h = this.p1.bounds.height;
		
		return h;
	};
    
	//NOVO 08-04-2015
	this.component.getTipo = function(){
		var t = this.p4.name;
		
		return t;
	};
	
    this.posicionaMenu = function(){
		var dados={
			y: 20,
			w: 300,
			h: 100
		};
		this.component.mudaCoisas(dados);
	};
};

// DATA AIO - InputOnly
var myInputAccepter = function(){ 
	contador = contador + 1;
	contInputAccepter = contInputAccepter + 1;
	
    //rectangulo principal 
	this.p1 = new paper.Path.Rectangle(new paper.Point(200, 180), new paper.Size(200, 60));
    this.p1.strokeColor = "black";
    this.p1.name = "inputonly" + contInputAccepter;

	this.p3 = new paper.PointText({		//texto e cor do texto
        content: 'InputOnly',		
        fillColor: 'black',
		fontSize: 15
    });
	
	//quadrado  
	this.p5 = new paper.Path.Rectangle(new paper.Point(this.p1.bounds.x + 10, this.p1.bounds.y + 10), new paper.Size(40, 40));
    this.p5.strokeColor = "black";
    this.p5.name = "inputaccepter_symbol";
	
	// linha da seta "/"
	this.p2 = new paper.Path();  
	this.p2.add(new paper.Point(this.p1.bounds.x + 3, this.p1.bounds.y + 55));
	this.p2.add(new paper.Point(this.p1.bounds.x + 25, this.p1.bounds.y + 30));
	this.p2.strokeColor = "black";
	this.p2.strokeWidth = 2;

	this.p3.point = leftTextos(			//alinhar texto ? esquerda
            this.p1.bounds.width-90, 20,
            this.p1.bounds.x, this.p1.bounds.y,
            this.p3.bounds.width, this.p3.bounds.height
            );
	//tri?ngulo - ponta da seta		
	var center = new paper.Point(this.p1.bounds.x + 26, this.p1.bounds.y + 31);
	var sides = 3;
	var radius = 6;
	this.p4 = new paper.Path.RegularPolygon(center, sides, radius);
	this.p4.fillColor = 'black';	
	this.p4.rotate(45);	
	
	//estrela
	var centerstar = new paper.Point(this.p1.bounds.x + 35, this.p1.bounds.y + 29);
	var points = 5;
	var radius1 = 3;
	var radius2 = 6;
	this.p6 = new paper.Path.Star(centerstar, points, radius1, radius2);
	this.p6.fillColor = 'black';
			
	this.component = new paper.Group([this.p1, this.p3, this.p2, this.p4, this.p5, this.p6]);
    this.component.data ={
            nome:true,
            texto:true,
            size:0,
			classe: true
    };
	
	this.component.propriedades={
        classe : "",
		atributo : ""
        
    };
	
		this.component.mudaCoisas = function(dados){
        this.p1 = this.children[0];
        this.p3 = this.children[1];
		this.p2 = this.children[2];
        this.p4 = this.children[3];
		this.p5 = this.children[4];
		this.p6 = this.children[5];
					
        if(dados["nome"]) this.p1.name = dados["nome"];
        if(dados["texto"]) this.p3.content = dados["texto"];

        if(dados["x"]) this.p1.bounds.x = dados["x"];
        if(dados["y"]) this.p1.bounds.y = dados["y"];

        if(dados["w"]) this.p1.bounds.width = dados["w"];
        if(dados["h"]) this.p1.bounds.height = dados["h"];
		
		if(dados["classe"]) this.propriedades["classe"] = dados["classe"]; 
		if(dados["atributo"]) this.propriedades["atributo"] = dados["atributo"]; 
		}; 
		
	this.component.getXML = function(){
        this.p1 = this.children[0];
        this.p3 = this.children[1];
		this.p2 = this.children[2];
        this.p4 = this.children[3];
		this.p5 = this.children[4];
		this.p6 = this.children[5];
			
		xml = "<InputOnly id='"+ this.p1.name +"' text='" + this.p3.content + "' x='"+ this.p1.bounds.x +"' y='"+ this.p1.bounds.y + "' w='" + this.p1.bounds.width + "' h='" +this.p1.bounds.height + "' classe='" + this.propriedades["classe"] + "' atributo='" + this.propriedades["atributo"] + "'>\n" +
                "</InputOnly> \n";
        return xml;
    };
	
    this.component.getElement = function(doc){    	
        this.p1 = this.children[0];
        this.p3 = this.children[1];
		this.p2 = this.children[2];
        this.p4 = this.children[3];
		this.p5 = this.children[4];
		this.p6 = this.children[5];
		
		var element = doc.createElement("InputOnly");
		element.setAttribute("id", this.p1.name);
		element.setAttribute("text", this.p3.content);
		element.setAttribute("x", this.p1.bounds.x);
		element.setAttribute("y", this.p1.bounds.y);
		element.setAttribute("w", this.p1.bounds.width);
		element.setAttribute("h", this.p1.bounds.height);
		element.setAttribute("classe", this.propriedades["classe"]);
		element.setAttribute("atributo", this.propriedades["atributo"]);		
        return element;
    };	
	
    var type = TYPES.DATA_AIO;
	this.component.getType = function(){		
		return type;
	};	
	
	//novo GETs
	this.component.getX = function(){
		var x = this.p1.bounds.x;
		
		return x;
	};
	
	this.component.getY = function(){
		var y = this.p1.bounds.y;
		
		return y;
	};
	
	this.component.getWidth = function(){
		var w = this.p1.bounds.width;
		
		return w;
	};
	
	this.component.getHeight = function(){
		var h = this.p1.bounds.height;
		
		return h;
	};
	
	//NOVO 08-04-2015
	this.component.getTipo = function(){
		var t = this.p5.name;
		
		return t;
	};
    
    this.posicionaMenu = function(){
		var dados={
			y: 20,
			w: 300,
			h: 100
		};
		this.component.mudaCoisas(dados);
	};
};

// DATA AIO - Editting 
var myEditableElement = function(){ 
	contador = contador + 1;
	contEditableElement = contEditableElement + 1;

    //rectangulo principal 
	this.p1 = new paper.Path.Rectangle(new paper.Point(200, 180), new paper.Size(200, 60));
    this.p1.strokeColor = "black";
    this.p1.name = "editting" + contEditableElement;

	this.p3 = new paper.PointText({		//texto e cor do texto
        content: 'Editting',		
        fillColor: 'black',
		fontSize: 15
    });
	
	//quadrado  
	this.p5 = new paper.Path.Rectangle(new paper.Point(this.p1.bounds.x + 10, this.p1.bounds.y + 10), new paper.Size(40, 40));
    this.p5.strokeColor = "black";
    this.p5.name = "editableelement_symbol";
	
	// linha da seta "/"
	this.p2 = new paper.Path();  
	this.p2.add(new paper.Point(this.p1.bounds.x + 3, this.p1.bounds.y + 55));
	this.p2.add(new paper.Point(this.p1.bounds.x + 25, this.p1.bounds.y + 30));
	this.p2.strokeColor = "black";
	this.p2.strokeWidth = 2;

	this.p3.point = leftTextos(			//alinhar texto ? esquerda
            this.p1.bounds.width-90, 20,
            this.p1.bounds.x, this.p1.bounds.y,
            this.p3.bounds.width, this.p3.bounds.height
            );
	//tri?ngulo - ponta da seta		
	var center = new paper.Point(this.p1.bounds.x + 26, this.p1.bounds.y + 31);
	var sides = 3;
	var radius = 6;
	this.p4 = new paper.Path.RegularPolygon(center, sides, radius);
	this.p4.fillColor = 'black';	
	this.p4.rotate(45);	
	
	//s?mbolo "~"
	this.p6 = new paper.PointText(new paper.Point(this.p1.bounds.x + 30, this.p1.bounds.y + 33));		
    this.p6.content = '~';		
    this.p6.fillColor = 'black';
	this.p6.fontSize = 25;
			
	this.component = new paper.Group([this.p1, this.p3, this.p2, this.p4, this.p5, this.p6]);
    this.component.data ={
            nome:true,
            texto:true,
            size:0,
			classe:true
    };
	
	this.component.propriedades={
        classe : "",
		atributo : ""
        
    };
	
		this.component.mudaCoisas = function(dados){
        this.p1 = this.children[0];
        this.p3 = this.children[1];
		this.p2 = this.children[2];
        this.p4 = this.children[3];
		this.p5 = this.children[4];
		this.p6 = this.children[5];
					
        if(dados["nome"]) this.p1.name = dados["nome"];
        if(dados["texto"]) this.p3.content = dados["texto"];

        if(dados["x"]) this.p1.bounds.x = dados["x"];
        if(dados["y"]) this.p1.bounds.y = dados["y"];

        if(dados["w"]) this.p1.bounds.width = dados["w"];
        if(dados["h"]) this.p1.bounds.height = dados["h"];
		
		if(dados["classe"]) this.propriedades["classe"] = dados["classe"]; 
		if(dados["atributo"]) this.propriedades["atributo"] = dados["atributo"]; 
		}; 
		
	this.component.getXML = function(){
        this.p1 = this.children[0];
        this.p3 = this.children[1];
		this.p2 = this.children[2];
        this.p4 = this.children[3];
		this.p5 = this.children[4];
		this.p6 = this.children[5];
			
		xml = "<Editting id='"+ this.p1.name +"' text='" + this.p3.content + "' x='"+ this.p1.bounds.x +"' y='"+ this.p1.bounds.y + "' w='" + this.p1.bounds.width + "' h='" +this.p1.bounds.height + "' classe='" + this.propriedades["classe"] + "' atributo='" + this.propriedades["atributo"] + "'>\n" +
                "</Editting> \n";
        return xml;
    };
	
    this.component.getElement = function(doc){    	
        this.p1 = this.children[0];
        this.p3 = this.children[1];
		this.p2 = this.children[2];
        this.p4 = this.children[3];
		this.p5 = this.children[4];
		this.p6 = this.children[5];
		
		var element = doc.createElement("Editting");
		element.setAttribute("id", this.p1.name);
		element.setAttribute("text", this.p3.content);
		element.setAttribute("x", this.p1.bounds.x);
		element.setAttribute("y", this.p1.bounds.y);
		element.setAttribute("w", this.p1.bounds.width);
		element.setAttribute("h", this.p1.bounds.height);
		element.setAttribute("classe", this.propriedades["classe"]);
		element.setAttribute("atributo", this.propriedades["atributo"]);		
        return element;
    };	
	
    var type = TYPES.DATA_AIO;
	this.component.getType = function(){		
		return type;
	};	
		
	//novo GETs
	this.component.getX = function(){
		var x = this.p1.bounds.x;
		
		return x;
	};
	
	this.component.getY = function(){
		var y = this.p1.bounds.y;
		
		return y;
	};
	
	this.component.getWidth = function(){
		var w = this.p1.bounds.width;
		
		return w;
	};
	
	this.component.getHeight = function(){
		var h = this.p1.bounds.height;
		
		return h;
	};
	
	//NOVO 08-04-2015
	this.component.getTipo = function(){
		var t = this.p5.name;
		
		return t;
	};
    
    this.posicionaMenu = function(){
		var dados={
			y: 20,
			w: 300,
			h: 100
		};
		this.component.mudaCoisas(dados);
	};
};

// DATA AIO - OutputOnly
var myElement = function(){
	contador = contador + 1;
	contElement = contElement + 1;
    //rectangulo principal 
	this.p1 = new paper.Path.Rectangle(new paper.Point(420, 180), new paper.Size(200, 60));
    this.p1.strokeColor = "black";
    this.p1.name = "outputonly" + contElement;
	
	//quadrado - element 
	this.p3 = new paper.Path.Rectangle(new paper.Point(this.p1.bounds.x + 10, this.p1.bounds.y + 10), new paper.Size(40, 40));
    this.p3.strokeColor = "black";
    this.p3.name = "element_symbol";
	
	this.p4 = new paper.PointText({		//texto, cor do texto e tamanho
        content: 'OutputOnly',		
        fillColor: 'black',
		fontSize: 15
    });

	this.p4.point = leftTextos(			//alinhar texto ? esquerda
            this.p1.bounds.width-90, 20,
            this.p1.bounds.x, this.p1.bounds.y,
            this.p4.bounds.width, this.p4.bounds.height
            );

	// linha dentro do quadrado element
	this.p5 = new paper.Path();
	this.p5.add(new paper.Point(this.p3.bounds.x + 7.5, this.p3.bounds.y + 7.5)); // primeiro ponto - vai buscar posi??o (bounds) de p1 - rectangulo e acresce 20 ao y (para baixo) 
	this.p5.add(new paper.Point(this.p3.bounds.x + this.p3.bounds.width - 7.5, this.p3.bounds.y + 7.5)); // segundo ponto - vai buscar posi??o (bounds) de p1 - rectangulo e acresce 20 ao y (para baixo) e utiliza a width de p1 
	this.p5.strokeColor = "black";
		
	this.component = new paper.Group([this.p1, this.p4, this.p3, this.p5]);
    this.component.data ={
            nome:true,
            texto:true,
            size:0,
			classe: true
    };
	
	this.component.propriedades={
        classe : "",
		atributo: ""
        
    };
	
	this.component.mudaCoisas = function(dados){
        this.p1 = this.children[0];
        this.p4 = this.children[1];
		this.p3 = this.children[2];
        this.p5 = this.children[3];
		
        if(dados["nome"]) this.p1.name = dados["nome"];
        if(dados["texto"]) this.p4.content = dados["texto"];

        if(dados["x"]) this.p1.bounds.x = dados["x"];
        if(dados["y"]) this.p1.bounds.y = dados["y"];

        if(dados["w"]) this.p1.bounds.width = dados["w"];
        if(dados["h"]) this.p1.bounds.height = dados["h"];
		
		if(dados["classe"]) this.propriedades["classe"] = dados["classe"]; 
		if(dados["atributo"]) this.propriedades["atributo"] = dados["atributo"]; 
		}; 
		
	this.component.getXML = function(){
        this.p1 = this.children[0];
        this.p4 = this.children[1];
		this.p3 = this.children[2];
       	this.p5 = this.children[3];
		
		xml = "<OutputOnly id='"+ this.p1.name +"' text='" + this.p4.content + "' x='"+ this.p1.bounds.x +"' y='"+ this.p1.bounds.y + "' w='" + this.p1.bounds.width + "' h='" +this.p1.bounds.height + "' classe='" + this.propriedades["classe"] + "' atributo='" + this.propriedades["atributo"] +"'>\n" +
                "</OutputOnly> \n";
        return xml;
    };
	
    this.component.getElement = function(doc){    	
        this.p1 = this.children[0];
        this.p4 = this.children[1];
		this.p3 = this.children[2];
       	this.p5 = this.children[3];
		
		var element = doc.createElement("OutputOnly");
		element.setAttribute("id", this.p1.name);
		element.setAttribute("text", this.p4.content);
		element.setAttribute("x", this.p1.bounds.x);
		element.setAttribute("y", this.p1.bounds.y);
		element.setAttribute("w", this.p1.bounds.width);
		element.setAttribute("h", this.p1.bounds.height);
		element.setAttribute("classe", this.propriedades["classe"]);
		element.setAttribute("atributo", this.propriedades["atributo"]);		
        return element;
    };	
	
    var type = TYPES.DATA_AIO;
	this.component.getType = function(){		
		return type;
	};	
	
	//novo GETs
	this.component.getX = function(){
		var x = this.p1.bounds.x;
		
		return x;
	};
	
	this.component.getY = function(){
		var y = this.p1.bounds.y;
		
		return y;
	};
	
	this.component.getWidth = function(){
		var w = this.p1.bounds.width;
		
		return w;
	};
	
	this.component.getHeight = function(){
		var h = this.p1.bounds.height;
		
		return h;
	};
	
	//NOVO 08-04-2015
	this.component.getTipo = function(){
		var t = this.p3.name;
		
		return t;
	};
    
    this.posicionaMenu = function(){
		var dados={
			y: 20,
			w: 300,
			h: 100
		};
		this.component.mudaCoisas(dados);
	};
};

//DATA AIO - System Message (OutputResultOnly)
var myNotification = function(){
	contador = contador + 1;
	contNotification = contNotification + 1;
	
	//rectangulo principal 
	this.p1 = new paper.Path.Rectangle(new paper.Point(420, 240), new paper.Size(200, 60));
    this.p1.strokeColor = "black";
    this.p1.name = "outputresultspace" + contNotification;
	
	//quadrado - notification 
	this.p3 = new paper.Path.Rectangle(new paper.Point(this.p1.bounds.x + 10, this.p1.bounds.y + 10), new paper.Size(40, 40));
    this.p3.strokeColor = "black";
    this.p3.name = "notification_symbol";
	
	// linha dentro do quadrado notification
	this.p5 = new paper.Path();
	this.p5.add(new paper.Point(this.p3.bounds.x + 20, this.p3.bounds.y + 6)); // primeiro ponto - vai buscar posi??o (bounds) de p1 - rectangulo e acresce 20 ao y (para baixo) 
	this.p5.add(new paper.Point(this.p3.bounds.x + 20, this.p3.bounds.y + 25)); // segundo ponto - vai buscar posi??o (bounds) de p1 - rectangulo e acresce 20 ao y (para baixo) e utiliza a width de p1 
	this.p5.strokeColor = "black";
	this.p5.strokeWidth = 2;

	// circulo dentro do quadrado notification (pequena linha)
	
	this.p6 = new paper.Path();
	this.p6.add(new paper.Point(this.p3.bounds.x + 20, this.p3.bounds.y + 29)); // primeiro ponto - vai buscar posi??o (bounds) de p1 - rectangulo e acresce 20 ao y (para baixo) 
	this.p6.add(new paper.Point(this.p3.bounds.x + 20, this.p3.bounds.y + 33)); // segundo ponto - vai buscar posi??o (bounds) de p1 - rectangulo e acresce 20 ao y (para baixo) e utiliza a width de p1 
	this.p6.strokeColor = "black";
	this.p6.strokeWidth = 2;
	
	this.p4 = new paper.PointText({		//texto e cor do texto
        content: 'OutputResultSpace',		
        fillColor: 'black',
		fontSize: 15
    });

	this.p4.point = leftTextos(			//alinhar texto ? esquerda
            this.p1.bounds.width-90, 20,
            this.p1.bounds.x, this.p1.bounds.y,
            this.p4.bounds.width, this.p4.bounds.height
            );
			
	this.component = new paper.Group([this.p1, this.p4, this.p3, this.p5, this.p6]);
    this.component.data ={
            nome:true,
            texto:true,
            size:0,
			classe: true
    };
	
	this.component.propriedades={
        classe : "",
		atributo: ""
        
    };
	
	this.component.mudaCoisas = function(dados){
        this.p1 = this.children[0];
        this.p4 = this.children[1];
		this.p3 = this.children[2];
        this.p5 = this.children[3];
		this.p6 = this.children[4];
		
        if(dados["nome"]) this.p1.name = dados["nome"];
        if(dados["texto"]) this.p4.content = dados["texto"];

        if(dados["x"]) this.p1.bounds.x = dados["x"];
        if(dados["y"]) this.p1.bounds.y = dados["y"];

        if(dados["w"]) this.p1.bounds.width = dados["w"];
        if(dados["h"]) this.p1.bounds.height = dados["h"];
		
		if(dados["classe"]) this.propriedades["classe"] = dados["classe"]; 
		if(dados["atributo"]) this.propriedades["atributo"] = dados["atributo"]; 
		}; 
		
	this.component.getXML = function(){
        this.p1 = this.children[0];
        this.p4 = this.children[1];
		this.p3 = this.children[2];
        this.p5 = this.children[3];
		this.p6 = this.children[4];
		
		xml = "<OutputResultSpace id='"+ this.p1.name +"' text='" + this.p4.content + "' x='"+ this.p1.bounds.x +"' y='"+ this.p1.bounds.y + "' w='" + this.p1.bounds.width + "' h='" +this.p1.bounds.height + "' classe='" + this.propriedades["classe"] + "' atributo='" + this.propriedades["atributo"] + "' >\n" +
                "</OutputResultSpace> \n";
        return xml;
    };
	
    this.component.getElement = function(doc){    	
        this.p1 = this.children[0];
        this.p4 = this.children[1];
		this.p3 = this.children[2];
        this.p5 = this.children[3];
		this.p6 = this.children[4];
		
		var element = doc.createElement("OutputResultSpace");
		element.setAttribute("id", this.p1.name);
		element.setAttribute("text", this.p4.content);
		element.setAttribute("x", this.p1.bounds.x);
		element.setAttribute("y", this.p1.bounds.y);
		element.setAttribute("w", this.p1.bounds.width);
		element.setAttribute("h", this.p1.bounds.height);
		element.setAttribute("classe", this.propriedades["classe"]);
		element.setAttribute("atributo", this.propriedades["atributo"]);		
        return element;
    };	
	
    var type = TYPES.DATA_AIO;
	this.component.getType = function(){		
		return type;
	};
		
	//novo GETs
	this.component.getX = function(){
		var x = this.p1.bounds.x;
		
		return x;
	};
	
	this.component.getY = function(){
		var y = this.p1.bounds.y;
		
		return y;
	};
	
	this.component.getWidth = function(){
		var w = this.p1.bounds.width;
		
		return w;
	};
	
	this.component.getHeight = function(){
		var h = this.p1.bounds.height;
		
		return h;
	};
	
	//NOVO 08-04-2015
	this.component.getTipo = function(){
		var t = this.p3.name;
		
		return t;
	};
    
    this.posicionaMenu = function(){
		var dados={
			y: 20,
			w: 300,
			h: 100
		};
		this.component.mudaCoisas(dados);
	};
};

// ViewList Selectable
var mySelectableCollection = function(){ 
	contador = contador + 1;
	contSelectableCollection = contSelectableCollection + 1;
	
    //rectangulo principal 
	this.p1 = new paper.Path.Rectangle(new paper.Point(200, 180), new paper.Size(200, 60));
    this.p1.strokeColor = "black";
    this.p1.name = "viewlist" + contSelectableCollection;

	this.p3 = new paper.PointText({		//texto e cor do texto
        content: 'ViewList',		
        fillColor: 'black',
		fontSize: 15
    });
	
	//quadrado  
	this.p5 = new paper.Path.Rectangle(new paper.Point(this.p1.bounds.x + 10, this.p1.bounds.y + 10), new paper.Size(40, 40));
    this.p5.strokeColor = "black";
    this.p5.name = "selectablecollection_symbol";
	
	// linhas dentro do quadrado collection
	this.p8 = new paper.Path();
	this.p8.add(new paper.Point(this.p5.bounds.x + 7.5, this.p5.bounds.y + 25)); // primeiro ponto - vai buscar posi??o (bounds) de p1 - rectangulo e acresce 20 ao y (para baixo) 
	this.p8.add(new paper.Point(this.p5.bounds.x + 32.5, this.p5.bounds.y + 25)); // segundo ponto - vai buscar posi??o (bounds) de p1 - rectangulo e acresce 20 ao y (para baixo) e utiliza a width de p1 
	this.p8.strokeColor = "black";
	
	// linha da seta "/"
	this.p2 = new paper.Path();  
	this.p2.add(new paper.Point(this.p1.bounds.x + 3, this.p1.bounds.y + 55));
	this.p2.add(new paper.Point(this.p1.bounds.x + 20, this.p1.bounds.y + 25));
	this.p2.strokeColor = "black";
	this.p2.strokeWidth = 2;

	this.p3.point = leftTextos(			//alinhar texto ? esquerda
            this.p1.bounds.width-90, 20,
            this.p1.bounds.x, this.p1.bounds.y,
            this.p3.bounds.width, this.p3.bounds.height
            );
	
	//tri?ngulo - ponta da seta		
	var center = new paper.Point(this.p1.bounds.x + 22, this.p1.bounds.y + 26);
	var sides = 3;
	var radius = 6;
	this.p4 = new paper.Path.RegularPolygon(center, sides, radius);
	this.p4.fillColor = 'black';	
	this.p4.rotate(45);	

	// linha "-" 2
	this.p6 = new paper.Path();  
	this.p6.add(new paper.Point(this.p5.bounds.x + 15, this.p5.bounds.y + 10));
	this.p6.add(new paper.Point(this.p5.bounds.x + 32.5, this.p5.bounds.y + 10));
	this.p6.strokeColor = "black";
	this.p6.strokeWidth = 3;
	
	
	//NOVO 06-07-15
	// linha da lista
	
	this.s1 = new paper.Path();
	this.s1.strokeColor = 'black';
	this.s1.add(new paper.Point(this.p1.bounds.x + (this.p1.bounds.width)-43, this.p1.bounds.y + (this.p1.bounds.height)-25));
	this.s1.add(new paper.Point(this.p1.bounds.x + (this.p1.bounds.width)-24, this.p1.bounds.y + (this.p1.bounds.height)-5));
	this.s1.add(new paper.Point(this.p1.bounds.x + (this.p1.bounds.width)-5, this.p1.bounds.y + (this.p1.bounds.height)-25));

	this.s2 = new paper.Path();
	this.s2.strokeColor = 'black';
	this.s2.add(new paper.Point(this.p1.bounds.x + (this.p1.bounds.width)-43, this.p1.bounds.y +(this.p1.bounds.height)-30));
	this.s2.add(new paper.Point(this.p1.bounds.x + (this.p1.bounds.width)-24, this.p1.bounds.y + (this.p1.bounds.height)-10));
	this.s2.add(new paper.Point(this.p1.bounds.x + (this.p1.bounds.width)-5, this.p1.bounds.y + (this.p1.bounds.height)-30));

	this.s3 = new paper.Path();
	this.s3.strokeColor = 'black';
	this.s3.add(new paper.Point(this.p1.bounds.x + (this.p1.bounds.width)-43, this.p1.bounds.y +(this.p1.bounds.height)-35));
	this.s3.add(new paper.Point(this.p1.bounds.x + (this.p1.bounds.width)-24, this.p1.bounds.y + (this.p1.bounds.height)-15));
	this.s3.add(new paper.Point(this.p1.bounds.x + (this.p1.bounds.width)-5, this.p1.bounds.y + (this.p1.bounds.height)-35));

			
	this.component = new paper.Group([this.p1, this.p3, this.p2, this.p4, this.p5, this.p6, this.p8, this.s1, this.s2, this.s3]);
    this.component.data ={
            nome:true,
            texto:true,
            size:0,
			classe:true
    };
	
	this.component.propriedades={
        classe : "",
		atributo : ""
        
    };
	
	this.component.mudaCoisas = function(dados){
        this.p1 = this.children[0];
        this.p3 = this.children[1];
		this.p2 = this.children[2];
        this.p4 = this.children[3];
		this.p5 = this.children[4];
		this.p6 = this.children[5];
		this.p8 = this.children[6];
		//NOVO 06-07-15
		this.s1 = this.children[7];
		this.s2 = this.children[8];
		this.s3 = this.children[9];
					
        if(dados["nome"]) this.p1.name = dados["nome"];
        if(dados["texto"]) this.p3.content = dados["texto"];

        if(dados["x"]) this.p1.bounds.x = dados["x"];
        if(dados["y"]) this.p1.bounds.y = dados["y"];

        if(dados["w"]) this.p1.bounds.width = dados["w"];
        if(dados["h"]) this.p1.bounds.height = dados["h"];
		
		if(dados["classe"]) this.propriedades["classe"] = dados["classe"]; 
		if(dados["atributo"]) this.propriedades["atributo"] = dados["atributo"]; 
		
		//NOVO 06-07-15
		//ALTERA??O DA POSI??O DOS TRI?NGULOS AQUI
		// Fazer uma c?pia dos tri?ngulos
		this.s1copy = this.s1.clone();
		this.s2copy = this.s2.clone();
		this.s3copy = this.s3.clone();
		
		// mover a c?pia para o centro e fundo do elemnto
		this.s1copy.position = new paper.Point(this.p1.bounds.x + ((this.p1.bounds.width)/2), this.p1.bounds.y + (this.p1.bounds.height)-20);
		this.s2copy.position = new paper.Point(this.p1.bounds.x + ((this.p1.bounds.width)/2), this.p1.bounds.y + (this.p1.bounds.height)-25);
		this.s3copy.position = new paper.Point(this.p1.bounds.x + ((this.p1.bounds.width)/2), this.p1.bounds.y + (this.p1.bounds.height)-30);
				
		//remover o original
		this.s1.remove();
		this.s2.remove();
		this.s3.remove();
	}; 
		
	this.component.getXML = function(){
        this.p1 = this.children[0];
        this.p3 = this.children[1];
		this.p2 = this.children[2];
        this.p4 = this.children[3];
		this.p5 = this.children[4];
		this.p6 = this.children[5];
		this.p8 = this.children[6];
		this.s1 = this.children[7];
		this.s2 = this.children[8];
		this.s3 = this.children[9];
			
		xml = "<ViewListS id='"+ this.p1.name +"' text='" + this.p3.content + "' x='"+ this.p1.bounds.x +"' y='"+ this.p1.bounds.y + "' w='" + this.p1.bounds.width + "' h='" +this.p1.bounds.height + "' classe='" + this.propriedades["classe"] + "'>\n" +
                "</ViewListS> \n";
        return xml;
    };
    
    this.component.getElement = function(doc){    	
        this.p1 = this.children[0];
        this.p3 = this.children[1];
		this.p2 = this.children[2];
        this.p4 = this.children[3];
		this.p5 = this.children[4];
		this.p6 = this.children[5];
		this.p8 = this.children[6];
		this.s1 = this.children[7];
		this.s2 = this.children[8];
		this.s3 = this.children[9];
		
		var element = doc.createElement("ViewListS");
		element.setAttribute("id", this.p1.name);
		element.setAttribute("text", this.p3.content);
		element.setAttribute("x", this.p1.bounds.x);
		element.setAttribute("y", this.p1.bounds.y);
		element.setAttribute("w", this.p1.bounds.width);
		element.setAttribute("h", this.p1.bounds.height);
		element.setAttribute("classe", this.propriedades["classe"]);		
        return element;
    };	
	
    var type = TYPES.INTERACTION_BLOCK;
	this.component.getType = function(){		
		return type;
	};    
	
	//novo GETs
	this.component.getX = function(){
		var x = this.p1.bounds.x;
		
		return x;
	};
	
	this.component.getY = function(){
		var y = this.p1.bounds.y;
		
		return y;
	};
	
	this.component.getWidth = function(){
		var w = this.p1.bounds.width;
		
		return w;
	};
	
	this.component.getHeight = function(){
		var h = this.p1.bounds.height;
		
		return h;
	};
	
	//NOVO 08-04-2015
	this.component.getTipo = function(){
		var t = this.p5.name;
		
		return t;
	};
    
    this.posicionaMenu = function(){
		var dados={
			y: 20,
			w: 300,
			h: 100
		};
		this.component.mudaCoisas(dados);
	};
};

// ViewRelatedList Selectable
var mySelectableCollection2 = function(){ 
	contador = contador + 1;
	contSelectableCollection = contSelectableCollection + 1;
	
    //rectangulo principal 
	this.p1 = new paper.Path.Rectangle(new paper.Point(200, 180), new paper.Size(200, 60));
    this.p1.strokeColor = "black";
    this.p1.name = "viewrelatedlist" + contSelectableCollection;

	this.p3 = new paper.PointText({		//texto e cor do texto
        content: 'ViewRelatedList',		
        fillColor: 'black',
		fontSize: 15
    });
	
	//quadrado  
	this.p5 = new paper.Path.Rectangle(new paper.Point(this.p1.bounds.x + 10, this.p1.bounds.y + 10), new paper.Size(40, 40));
    this.p5.strokeColor = "black";
    this.p5.name = "selectablecollection_symbol";
	
	// linhas dentro do quadrado collection
	this.p8 = new paper.Path();
	this.p8.add(new paper.Point(this.p5.bounds.x + 7.5, this.p5.bounds.y + 25)); // primeiro ponto - vai buscar posi??o (bounds) de p1 - rectangulo e acresce 20 ao y (para baixo) 
	this.p8.add(new paper.Point(this.p5.bounds.x + 32.5, this.p5.bounds.y + 25)); // segundo ponto - vai buscar posi??o (bounds) de p1 - rectangulo e acresce 20 ao y (para baixo) e utiliza a width de p1 
	this.p8.strokeColor = "black";
	
	// linha da seta "/"
	this.p2 = new paper.Path();  
	this.p2.add(new paper.Point(this.p1.bounds.x + 3, this.p1.bounds.y + 55));
	this.p2.add(new paper.Point(this.p1.bounds.x + 20, this.p1.bounds.y + 25));
	this.p2.strokeColor = "black";
	this.p2.strokeWidth = 2;

	this.p3.point = leftTextos(			//alinhar texto ? esquerda
            this.p1.bounds.width-90, 20,
            this.p1.bounds.x, this.p1.bounds.y,
            this.p3.bounds.width, this.p3.bounds.height
            );
	
	//tri?ngulo - ponta da seta		
	var center = new paper.Point(this.p1.bounds.x + 22, this.p1.bounds.y + 26);
	var sides = 3;
	var radius = 6;
	this.p4 = new paper.Path.RegularPolygon(center, sides, radius);
	this.p4.fillColor = 'black';	
	this.p4.rotate(45);	

	// linha "-" 2
	this.p6 = new paper.Path();  
	this.p6.add(new paper.Point(this.p5.bounds.x + 15, this.p5.bounds.y + 10));
	this.p6.add(new paper.Point(this.p5.bounds.x + 32.5, this.p5.bounds.y + 10));
	this.p6.strokeColor = "black";
	this.p6.strokeWidth = 3;
	
	//NOVO 06-07-15
	// linha da lista
	
	this.s1 = new paper.Path();
	this.s1.strokeColor = 'black';
	this.s1.add(new paper.Point(this.p1.bounds.x + (this.p1.bounds.width)-43, this.p1.bounds.y + (this.p1.bounds.height)-25));
	this.s1.add(new paper.Point(this.p1.bounds.x + (this.p1.bounds.width)-24, this.p1.bounds.y + (this.p1.bounds.height)-5));
	this.s1.add(new paper.Point(this.p1.bounds.x + (this.p1.bounds.width)-5, this.p1.bounds.y + (this.p1.bounds.height)-25));

	this.s2 = new paper.Path();
	this.s2.strokeColor = 'black';
	this.s2.add(new paper.Point(this.p1.bounds.x + (this.p1.bounds.width)-43, this.p1.bounds.y +(this.p1.bounds.height)-30));
	this.s2.add(new paper.Point(this.p1.bounds.x + (this.p1.bounds.width)-24, this.p1.bounds.y + (this.p1.bounds.height)-10));
	this.s2.add(new paper.Point(this.p1.bounds.x + (this.p1.bounds.width)-5, this.p1.bounds.y + (this.p1.bounds.height)-30));

	this.s3 = new paper.Path();
	this.s3.strokeColor = 'black';
	this.s3.add(new paper.Point(this.p1.bounds.x + (this.p1.bounds.width)-43, this.p1.bounds.y +(this.p1.bounds.height)-35));
	this.s3.add(new paper.Point(this.p1.bounds.x + (this.p1.bounds.width)-24, this.p1.bounds.y + (this.p1.bounds.height)-15));
	this.s3.add(new paper.Point(this.p1.bounds.x + (this.p1.bounds.width)-5, this.p1.bounds.y + (this.p1.bounds.height)-35));
			
	this.component = new paper.Group([this.p1, this.p3, this.p2, this.p4, this.p5, this.p6, this.p8, this.s1, this.s2, this.s3]);
    this.component.data ={
            nome:true,
            texto:true,
            size:0,
			classe:true
    };
	
	this.component.propriedades={
        classe : "",
		atributo : ""
        
    };
	
	this.component.mudaCoisas = function(dados){
        this.p1 = this.children[0];
        this.p3 = this.children[1];
		this.p2 = this.children[2];
        this.p4 = this.children[3];
		this.p5 = this.children[4];
		this.p6 = this.children[5];
		this.p8 = this.children[6];
		
		this.s1 = this.children[7];
		this.s2 = this.children[8];
		this.s3 = this.children[9];
					
        if(dados["nome"]) this.p1.name = dados["nome"];
        if(dados["texto"]) this.p3.content = dados["texto"];

        if(dados["x"]) this.p1.bounds.x = dados["x"];
        if(dados["y"]) this.p1.bounds.y = dados["y"];

        if(dados["w"]) this.p1.bounds.width = dados["w"];
        if(dados["h"]) this.p1.bounds.height = dados["h"];
		
		if(dados["classe"]) this.propriedades["classe"] = dados["classe"]; 
		if(dados["atributo"]) this.propriedades["atributo"] = dados["atributo"]; 
		
		//ALTERA??O DA POSI??O DOS TRI?NGULOS AQUI
		// Fazer uma c?pia dos tri?ngulos
		this.s1copy = this.s1.clone();
		this.s2copy = this.s2.clone();
		this.s3copy = this.s3.clone();
		
		// mover a c?pia para o centro e fundo do elemnto
		this.s1copy.position = new paper.Point(this.p1.bounds.x + ((this.p1.bounds.width)/2), this.p1.bounds.y + (this.p1.bounds.height)-20);
		this.s2copy.position = new paper.Point(this.p1.bounds.x + ((this.p1.bounds.width)/2), this.p1.bounds.y + (this.p1.bounds.height)-25);
		this.s3copy.position = new paper.Point(this.p1.bounds.x + ((this.p1.bounds.width)/2), this.p1.bounds.y + (this.p1.bounds.height)-30);
				
		//remover o original
		this.s1.remove();
		this.s2.remove();
		this.s3.remove();
	}; 
		
	this.component.getXML = function(){
        this.p1 = this.children[0];
        this.p3 = this.children[1];
		this.p2 = this.children[2];
        this.p4 = this.children[3];
		this.p5 = this.children[4];
		this.p6 = this.children[5];
		this.p8 = this.children[6];
			
		xml = "<ViewRelatedListS id='"+ this.p1.name +"' text='" + this.p3.content + "' x='"+ this.p1.bounds.x +"' y='"+ this.p1.bounds.y + "' w='" + this.p1.bounds.width + "' h='" +this.p1.bounds.height + "' classe='" + this.propriedades["classe"] + "'>\n" +
                "</ViewRelatedListS> \n";
        return xml;
    };
	
    this.component.getElement = function(doc){    	
        this.p1 = this.children[0];
        this.p3 = this.children[1];
		this.p2 = this.children[2];
        this.p4 = this.children[3];
		this.p5 = this.children[4];
		this.p6 = this.children[5];
		this.p8 = this.children[6];
		
		var element = doc.createElement("ViewRelatedListS");
		element.setAttribute("id", this.p1.name);
		element.setAttribute("text", this.p3.content);
		element.setAttribute("x", this.p1.bounds.x);
		element.setAttribute("y", this.p1.bounds.y);
		element.setAttribute("w", this.p1.bounds.width);
		element.setAttribute("h", this.p1.bounds.height);
		element.setAttribute("classe", this.propriedades["classe"]);		
        return element;
    };	
	
    var type = TYPES.INTERACTION_BLOCK;
	this.component.getType = function(){		
		return type;
	};
	
	//novo GETs
	this.component.getX = function(){
		var x = this.p1.bounds.x;
		
		return x;
	};
	
	this.component.getY = function(){
		var y = this.p1.bounds.y;
		
		return y;
	};
	
	this.component.getWidth = function(){
		var w = this.p1.bounds.width;
		
		return w;
	};
	
	this.component.getHeight = function(){
		var h = this.p1.bounds.height;
		
		return h;
	};
	
	//NOVO 08-04-2015
	this.component.getTipo = function(){
		var t = this.p5.name;
		
		return t;
	};
    
    this.posicionaMenu = function(){
		var dados={
			y: 20,
			w: 300,
			h: 100
		};
		this.component.mudaCoisas(dados);
	};
};

// Menu
var mySelectableActionSet = function(){ 
	contador = contador + 1;
	contSelectableActionSet = contSelectableActionSet + 1;
	
    //rectangulo principal 
	this.p1 = new paper.Path.Rectangle(new paper.Point(200, 180), new paper.Size(200, 60));
    this.p1.strokeColor = "black";
    this.p1.name = "menu" + contSelectableActionSet;

	this.p3 = new paper.PointText({		//texto e cor do texto
        content: 'Menu',		
        fillColor: 'black',
		fontSize: 14
    });
	
	//quadrado  
	this.p5 = new paper.Path.Rectangle(new paper.Point(this.p1.bounds.x + 10, this.p1.bounds.y + 10), new paper.Size(40, 40));
    this.p5.strokeColor = "black";
    this.p5.name = "selectableactionset_symbol";
	
	// linhas dentro do quadrado collection
	this.p8 = new paper.Path();
	this.p8.add(new paper.Point(this.p5.bounds.x + 7.5, this.p5.bounds.y + 25)); // primeiro ponto - vai buscar posi??o (bounds) de p1 - rectangulo e acresce 20 ao y (para baixo) 
	this.p8.add(new paper.Point(this.p5.bounds.x + 32.5, this.p5.bounds.y + 25)); // segundo ponto - vai buscar posi??o (bounds) de p1 - rectangulo e acresce 20 ao y (para baixo) e utiliza a width de p1 
	this.p8.strokeColor = "black";
	
	// linha da seta "/"
	this.p2 = new paper.Path();  
	this.p2.add(new paper.Point(this.p1.bounds.x + 3, this.p1.bounds.y + 55));
	this.p2.add(new paper.Point(this.p1.bounds.x + 20, this.p1.bounds.y + 25));
	this.p2.strokeColor = "black";
	this.p2.strokeWidth = 2;

	this.p3.point = leftTextos(			//alinhar texto ? esquerda
            this.p1.bounds.width-90, 20,
            this.p1.bounds.x, this.p1.bounds.y,
            this.p3.bounds.width, this.p3.bounds.height
            );
			
	//tri?ngulo - ponta da seta		
	var center = new paper.Point(this.p1.bounds.x + 22, this.p1.bounds.y + 26);
	var sides = 3;
	var radius = 6;
	this.p4 = new paper.Path.RegularPolygon(center, sides, radius);
	this.p4.fillColor = 'black';	
	this.p4.rotate(45);	

	//circulo
	var center = new paper.Point(this.p5.bounds.x + 20, this.p5.bounds.y + 13);
	//var points = 5;
	var radius = 4;
	//var radius2 = 7;
	this.p6 = new paper.Path.Circle(center, radius);
	this.p6.fillColor = 'black';
		
	this.component = new paper.Group([this.p1, this.p3, this.p2, this.p4, this.p5, this.p6, this.p8]);
    this.component.data ={
            nome:true,
            texto:true,
            size:0,
			classe: true
    };
	
	this.component.propriedades={
        classe : "",
		atributo : ""
        
    };
	
	this.component.mudaCoisas = function(dados){
        this.p1 = this.children[0];
        this.p3 = this.children[1];
		this.p2 = this.children[2];
        this.p4 = this.children[3];
		this.p5 = this.children[4];
		this.p6 = this.children[5];
		this.p8 = this.children[6];
					
        if(dados["nome"]) this.p1.name = dados["nome"];
        if(dados["texto"]) this.p3.content = dados["texto"];

        if(dados["x"]) this.p1.bounds.x = dados["x"];
        if(dados["y"]) this.p1.bounds.y = dados["y"];

        if(dados["w"]) this.p1.bounds.width = dados["w"];
        if(dados["h"]) this.p1.bounds.height = dados["h"];
		
		if(dados["classe"]) this.propriedades["classe"] = dados["classe"];
		if(dados["atributo"]) this.propriedades["atributo"] = dados["atributo"];
	}; 
		
	this.component.getXML = function(){
        this.p1 = this.children[0];
        this.p3 = this.children[1];
		this.p2 = this.children[2];
        this.p4 = this.children[3];
		this.p5 = this.children[4];
		this.p6 = this.children[5];
		this.p8 = this.children[6];
			
		xml = "<Menu id='"+ this.p1.name +"' text='" + this.p3.content + "' x='"+ this.p1.bounds.x +"' y='"+ this.p1.bounds.y + "' w='" + this.p1.bounds.width + "' h='" +this.p1.bounds.height + "' classe='" + this.propriedades["classe"] + "'>\n" +
                "</Menu> \n";
        return xml;
    };
	
    this.component.getElement = function(doc){    	
        this.p1 = this.children[0];
        this.p3 = this.children[1];
		this.p2 = this.children[2];
        this.p4 = this.children[3];
		this.p5 = this.children[4];
		this.p6 = this.children[5];
		this.p8 = this.children[6];
		
		var element = doc.createElement("Menu");
		element.setAttribute("id", this.p1.name);
		element.setAttribute("text", this.p3.content);
		element.setAttribute("x", this.p1.bounds.x);
		element.setAttribute("y", this.p1.bounds.y);
		element.setAttribute("w", this.p1.bounds.width);
		element.setAttribute("h", this.p1.bounds.height);
		element.setAttribute("classe", this.propriedades["classe"]);		
        return element;
    };	
	
    var type = TYPES.MENU;
	this.component.getType = function(){		
		return type;
	}; 
		
	//novo GETs
	this.component.getX = function(){
		var x = this.p1.bounds.x;
		
		return x;
	};
	
	this.component.getY = function(){
		var y = this.p1.bounds.y;
		
		return y;
	};
	
	this.component.getWidth = function(){
		var w = this.p1.bounds.width;
		
		return w;
	};
	
	this.component.getHeight = function(){
		var h = this.p1.bounds.height;
		
		return h;
	};
	
	//NOVO 08-04-2015
	this.component.getTipo = function(){
		var t = this.p5.name;
		
		return t;
	};
    
    this.posicionaMenu = function(){
		var dados={
			y: 20,
			w: 300,
			h: 100
		};
		this.component.mudaCoisas(dados);
	};
};

// MenuItem
var myStartGoTo = function(){
	contador = contador + 1;
	contStartGoTo = contStartGoTo +1;
	var target = "";
	
	//rectangulo principal 
	this.p1 = new paper.Path.Rectangle(new paper.Point(200, 100), new paper.Size(200, 60));
    this.p1.strokeColor = "black";
    this.p1.name = "menuitem" + contStartGoTo ;

	this.p3 = new paper.PointText({		//texto e cor do texto
        content: 'MenuItem',		
        fillColor: 'black',
		fontSize: 15
    });
	
	// linha da seta "/"
	this.p2 = new paper.Path();  
	this.p2.add(new paper.Point(this.p1.bounds.x + 10, this.p1.bounds.y + 45));
	this.p2.add(new paper.Point(this.p1.bounds.x + 43.5, this.p1.bounds.y + 15));
	this.p2.strokeColor = "black";
	this.p2.strokeWidth = 2;

	this.p3.point = leftTextos(			//alinhar texto ? esquerda
            this.p1.bounds.width-90, 20,
            this.p1.bounds.x, this.p1.bounds.y,
            this.p3.bounds.width, this.p3.bounds.height
            );
	//tri?ngulo - ponta da seta		
	var center = new paper.Point(this.p1.bounds.x + 45, this.p1.bounds.y + 15);
	var sides = 3;
	var radius = 7;
	this.p4 = new paper.Path.RegularPolygon(center, sides, radius);
	this.p4.fillColor = 'black';	
	this.p4.rotate(45);
	this.p4.name = "startgoto_symbol";	
	
	//circulo
	var center = new paper.Point(this.p1.bounds.x + 60, this.p1.bounds.y + 10);
	//var points = 5;
	var radius = 5;
	//var radius2 = 7;
	this.p5 = new paper.Path.Circle(center, radius);
	this.p5.fillColor = 'black';
	
			
	this.component = new paper.Group([this.p1, this.p3, this.p2, this.p4, this.p5]);
    this.component.data ={
            nome:true,
            texto:true,
            accao:false,
            valores:false,
            selected:false,
            size:0,
			classe: true
    };
	
	this.component.propriedades={
        classe : "",
		atributo : ""
        
    };
	
	this.component.mudaCoisas = function(dados){
    this.p1 = this.children[0];
    this.p3 = this.children[1];
	this.p2 = this.children[2];
    this.p4 = this.children[3];
	this.p5 = this.children[4];
			
	if(dados["target"]) target = dados["target"];
	
    if(dados["nome"]) this.p1.name = dados["nome"];
    if(dados["texto"]) this.p3.content = dados["texto"];

    if(dados["x"]) this.p1.bounds.x = dados["x"];
    if(dados["y"]) this.p1.bounds.y = dados["y"];

    if(dados["w"]) this.p1.bounds.width = dados["w"];
    if(dados["h"]) this.p1.bounds.height = dados["h"];
	
	if(dados["classe"]) this.propriedades["classe"] = dados["classe"]; 
	if(dados["atributo"]) this.propriedades["atributo"] = dados["atributo"];
	}; 
		
	this.component.getXML = function(){
        this.p1 = this.children[0];
        this.p3 = this.children[1];
		this.p2 = this.children[2];
        this.p4 = this.children[3];
		this.p5 = this.children[4];
			
		xml = "<MenuItem id='"+ this.p1.name +"' text='" + this.p3.content + "' x='"+ this.p1.bounds.x +"' y='"+ this.p1.bounds.y + "' w='" + this.p1.bounds.width + "' h='" +this.p1.bounds.height + "' classe='" + this.propriedades["classe"] + "'>\n" +
                "</MenuItem> \n";
        return xml;
    };
    
    this.component.getElement = function(doc){    	
        this.p1 = this.children[0];
        this.p3 = this.children[1];
		this.p2 = this.children[2];
        this.p4 = this.children[3];
		this.p5 = this.children[4];
		
		var element = doc.createElement("MenuItem");
		element.setAttribute("id", this.p1.name);
		element.setAttribute("text", this.p3.content);
		element.setAttribute("x", this.p1.bounds.x);
		element.setAttribute("y", this.p1.bounds.y);
		element.setAttribute("w", this.p1.bounds.width);
		element.setAttribute("h", this.p1.bounds.height);
		element.setAttribute("classe", this.propriedades["classe"]);
		element.setAttribute("target", target);
        return element;
    };	
	
    var type = TYPES.MENU_ITEM;
	this.component.getType = function(){		
		return type;
	};    
	
	this.component.getTarget = function(){		
		return target;
	};
		
	//novo GETs
	this.component.getX = function(){
		var x = this.p1.bounds.x;
		
		return x;
	};
	
	this.component.getY = function(){
		var y = this.p1.bounds.y;
		
		return y;
	};
	
	this.component.getWidth = function(){
		var w = this.p1.bounds.width;
		
		return w;
	};
	
	this.component.getHeight = function(){
		var h = this.p1.bounds.height;
		
		return h;
	};
    
	//NOVO 08-04-2015
	this.component.getTipo = function(){
		var t = this.p4.name;
		
		return t;
	};
	
    this.posicionaMenu = function(){
		var dados={
			y: 20,
			w: 300,
			h: 100
		};
		this.component.mudaCoisas(dados);
	};
};

// ViewEntity
var myContainer2 = function(){ 
	contador = contador + 1;
    contContainer = contContainer + 1;
	
	//rectangulo principal 
	this.p1 = new paper.Path.Rectangle(new paper.Point(640, 100), new paper.Size(200, 60));
    this.p1.strokeColor = "black";
    this.p1.name = "viewentity" + contContainer;

    this.p2 = new paper.PointText({		//texto e cor do texto
        content: 'ViewEntity',		
        fillColor: 'black',
		fontSize: 15
    });
	
	        
	this.p2.point = leftTextos(			//alinhar texto ? esquerda
            this.p1.bounds.width-90, 20,
            this.p1.bounds.x, this.p1.bounds.y,
            this.p2.bounds.width, this.p2.bounds.height
    );
			
	//quadrado - container 
	this.p3 = new paper.Path.Rectangle(new paper.Point(this.p1.bounds.x + 10, this.p1.bounds.y + 10), new paper.Size(40, 40));
    this.p3.strokeColor = "black";
    this.p3.name = "container_symbol";
	
    this.component = new paper.Group([this.p1, this.p2, this.p3]);
    this.component.data ={
            nome:true,
            texto:true,
            size:0,
			classe: true
    };
	
	this.component.propriedades={
        classe : "",
		atributo : "",
		operacao : ""
        
    };

	this.component.mudaCoisas = function(dados){
        this.p1 = this.children[0];
        this.p2 = this.children[1];
        
        if(dados["nome"]) this.p1.name = dados["nome"];
        if(dados["texto"]) this.p2.content = dados["texto"];

        if(dados["x"]) this.p1.bounds.x = dados["x"];
        if(dados["y"]) this.p1.bounds.y = dados["y"];

        if(dados["w"]) this.p1.bounds.width = dados["w"];
        if(dados["h"]) this.p1.bounds.height = dados["h"];
		
		if(dados["classe"]) this.propriedades["classe"] = dados["classe"]; 
		if(dados["atributo"]) this.propriedades["atributo"] = dados["atributo"]; 
		if(dados["operacao"]) this.propriedades["operacao"] = dados["operacao"]; 
		
    };
	
    this.component.getXML = function(){
        this.p1 = this.children[0];
        this.p2 = this.children[1];
      xml = "<ViewEntity id='"+ this.p1.name +
      "' text='" + this.p2.content + 
      "' x='"+ this.p1.bounds.x +
      "' y='"+ this.p1.bounds.y + 
      "' w='" + this.p1.bounds.width + 
      "' h='" +this.p1.bounds.height + 
      "' classe='" + this.propriedades["classe"] + 
      /*"' atributo='" + this.propriedades["atributo"] + */"'>\n" +
                "</ViewEntity> \n";
        return xml;
    };
	
    this.component.getElement = function(doc){    	
        this.p1 = this.children[0];
        this.p2 = this.children[1];
		var element = doc.createElement("ViewEntity");
		element.setAttribute("id", this.p1.name);
		element.setAttribute("text", this.p2.content);
		element.setAttribute("x", this.p1.bounds.x);
		element.setAttribute("y", this.p1.bounds.y);
		element.setAttribute("w", this.p1.bounds.width);
		element.setAttribute("h", this.p1.bounds.height);
		element.setAttribute("classe", this.propriedades["classe"]);		
        return element;
    };	
	
    var type = TYPES.INTERACTION_BLOCK;
	this.component.getType = function(){		
		return type;
	};   	
	
	//novo GETs
	this.component.getX = function(){
		var x = this.p1.bounds.x;
		
		return x;
	};
	
	this.component.getY = function(){
		var y = this.p1.bounds.y;
		
		return y;
	};
	
	this.component.getWidth = function(){
		var w = this.p1.bounds.width;
		
		return w;
	};
	
	this.component.getHeight = function(){
		var h = this.p1.bounds.height;
		
		return h;
	};
	
	//NOVO 08-04-2015
	this.component.getTipo = function(){
		var t = this.p3.name;
		
		return t;
	};
	
	this.component.getClasse = function(){
		var cl = this.propriedades.classe;
		
		return cl;
	};
	
    this.posicionaMenu = function(){
		var dados={
			y: 20,
			w: 300,
			h: 100
		};
		this.component.mudaCoisas(dados);
	};
};

//ViewList . INTERACTION BLOCK
var myCollection = function(){
	contador = contador + 1;
	contCollection = contCollection + 1;
    //rectangulo principal 
	this.p1 = new paper.Path.Rectangle(new paper.Point(640, 180), new paper.Size(200, 60));
    this.p1.strokeColor = "black";
    this.p1.name = "viewlist" + contCollection;
	
	//quadrado - element 
	this.p3 = new paper.Path.Rectangle(new paper.Point(this.p1.bounds.x + 10, this.p1.bounds.y + 10), new paper.Size(40, 40));
    this.p3.strokeColor = "black";
    this.p3.name = "collection_symbol";
	
	// linhas dentro do quadrado collection
	this.p5 = new paper.Path();
	this.p5.add(new paper.Point(this.p3.bounds.x + 7.5, this.p3.bounds.y + 7.5)); // primeiro ponto - vai buscar posi??o (bounds) de p1 - rectangulo e acresce 20 ao y (para baixo) 
	this.p5.add(new paper.Point(this.p3.bounds.x + this.p3.bounds.width - 7.5, this.p3.bounds.y + 7.5)); // segundo ponto - vai buscar posi??o (bounds) de p1 - rectangulo e acresce 20 ao y (para baixo) e utiliza a width de p1 
	this.p5.strokeColor = "black";

	this.p6 = new paper.Path();
	this.p6.add(new paper.Point(this.p3.bounds.x + 7.5, this.p3.bounds.y + 15)); // primeiro ponto - vai buscar posi??o (bounds) de p1 - rectangulo e acresce 20 ao y (para baixo) 
	this.p6.add(new paper.Point(this.p3.bounds.x + this.p3.bounds.width - 7.5, this.p3.bounds.y + 15)); // segundo ponto - vai buscar posi??o (bounds) de p1 - rectangulo e acresce 20 ao y (para baixo) e utiliza a width de p1 
	this.p6.strokeColor = "black";
	
   this.p4 = new paper.PointText({//texto e cor do texto
        content: 'ViewList',		
        fillColor: 'black',
		fontSize: 15
    });

	this.p4.point = leftTextos(	//alinhar texto ? esquerda
        this.p1.bounds.width-90, 20,
        this.p1.bounds.x, this.p1.bounds.y,
        this.p4.bounds.width, this.p4.bounds.height
    );
			
	//NOVO 06-07-15
	// linha da lista
	this.s1 = new paper.Path();
	this.s1.strokeColor = 'black';
	this.s1.add(new paper.Point(this.p1.bounds.x + (this.p1.bounds.width)-43, this.p1.bounds.y + (this.p1.bounds.height)-25));
	this.s1.add(new paper.Point(this.p1.bounds.x + (this.p1.bounds.width)-24, this.p1.bounds.y + (this.p1.bounds.height)-5));
	this.s1.add(new paper.Point(this.p1.bounds.x + (this.p1.bounds.width)-5, this.p1.bounds.y + (this.p1.bounds.height)-25));

	this.s2 = new paper.Path();
	this.s2.strokeColor = 'black';
	this.s2.add(new paper.Point(this.p1.bounds.x + (this.p1.bounds.width)-43, this.p1.bounds.y +(this.p1.bounds.height)-30));
	this.s2.add(new paper.Point(this.p1.bounds.x + (this.p1.bounds.width)-24, this.p1.bounds.y + (this.p1.bounds.height)-10));
	this.s2.add(new paper.Point(this.p1.bounds.x + (this.p1.bounds.width)-5, this.p1.bounds.y + (this.p1.bounds.height)-30));

	this.s3 = new paper.Path();
	this.s3.strokeColor = 'black';
	this.s3.add(new paper.Point(this.p1.bounds.x + (this.p1.bounds.width)-43, this.p1.bounds.y +(this.p1.bounds.height)-35));
	this.s3.add(new paper.Point(this.p1.bounds.x + (this.p1.bounds.width)-24, this.p1.bounds.y + (this.p1.bounds.height)-15));
	this.s3.add(new paper.Point(this.p1.bounds.x + (this.p1.bounds.width)-5, this.p1.bounds.y + (this.p1.bounds.height)-35));
			
	this.component = new paper.Group([this.p1, this.p4, this.p3, this.p5, this.p6, this.s1, this.s2, this.s3]);
    this.component.data = {
        nome:true,
        texto:true,
        size:0,
		classe: true
    };
	
	this.component.propriedades={
        classe : "",
		atributo : ""
        
    };
	
	this.component.mudaCoisas = function(dados){
        this.p1 = this.children[0];
        this.p4 = this.children[1];
		this.p3 = this.children[2];
        this.p5 = this.children[3];
		this.p6 = this.children[4];
			//NOVO 06-07-15
		this.s1 = this.children[5];
		this.s2 = this.children[6];
		this.s3 = this.children[7];
		
        if(dados["nome"]) this.p1.name = dados["nome"];
        if(dados["texto"]) this.p4.content = dados["texto"];

        if(dados["x"]) this.p1.bounds.x = dados["x"];
        if(dados["y"]) this.p1.bounds.y = dados["y"];

        if(dados["w"]) this.p1.bounds.width = dados["w"];
        if(dados["h"]) this.p1.bounds.height = dados["h"];
		
		if(dados["classe"]) this.propriedades["classe"] = dados["classe"]; 
		if(dados["atributo"]) this.propriedades["atributo"] = dados["atributo"];
		
		//ALTERA??O DA POSI??O DOS TRI?NGULOS AQUI
		// Fazer uma c?pia dos tri?ngulos
		this.s1copy = this.s1.clone();
		this.s2copy = this.s2.clone();
		this.s3copy = this.s3.clone();
		
		// mover a c?pia para o centro e fundo do elemnto
		this.s1copy.position = new paper.Point(this.p1.bounds.x + ((this.p1.bounds.width)/2), this.p1.bounds.y + (this.p1.bounds.height)-20);
		this.s2copy.position = new paper.Point(this.p1.bounds.x + ((this.p1.bounds.width)/2), this.p1.bounds.y + (this.p1.bounds.height)-25);
		this.s3copy.position = new paper.Point(this.p1.bounds.x + ((this.p1.bounds.width)/2), this.p1.bounds.y + (this.p1.bounds.height)-30);
				
		//remover o original
		this.s1.remove();
		this.s2.remove();
		this.s3.remove();
	}; 
		
	this.component.getXML = function(){
        this.p1 = this.children[0];
        this.p4 = this.children[1];
		this.p3 = this.children[2];
        this.p5 = this.children[3];
		this.p6 = this.children[4];
		
		xml = "<ViewList id='"+ this.p1.name +
		"' text='" + this.p4.content + 
		"' x='"+ this.p1.bounds.x +
		"' y='"+ this.p1.bounds.y + 
		"' w='" + this.p1.bounds.width + 
		"' h='" +this.p1.bounds.height + 
		"' classe='" + this.propriedades["classe"] + "'>\n" +
                "</ViewList> \n";
        return xml;
    };
    
    this.component.getElement = function(doc){    	
        this.p1 = this.children[0];
        this.p4 = this.children[1];
		this.p3 = this.children[2];
        this.p5 = this.children[3];
		this.p6 = this.children[4];
		
		var element = doc.createElement("ViewList");
		element.setAttribute("id", this.p1.name);
		element.setAttribute("text", this.p4.content);
		element.setAttribute("x", this.p1.bounds.x);
		element.setAttribute("y", this.p1.bounds.y);
		element.setAttribute("w", this.p1.bounds.width);
		element.setAttribute("h", this.p1.bounds.height);
		element.setAttribute("classe", this.propriedades["classe"]);		
        return element;
    };    
	
    var type = TYPES.INTERACTION_BLOCK;
	this.component.getType = function(){		
		return type;
	};   	
	
	//novo GETs
	this.component.getX = function(){
		var x = this.p1.bounds.x;
		
		return x;
	};
	
	this.component.getY = function(){
		var y = this.p1.bounds.y;
		
		return y;
	};
	
	this.component.getWidth = function(){
		var w = this.p1.bounds.width;
		
		return w;
	};
	
	this.component.getHeight = function(){
		var h = this.p1.bounds.height;
		
		return h;
	};
	
	//NOVO 08-04-2015
	this.component.getTipo = function(){
		var t = this.p3.name;
		
		return t;
	};
    
    this.posicionaMenu = function(){
		var dados={
			y: 20,
			w: 300,
			h: 100
		};
		this.component.mudaCoisas(dados);
	};
};

// ViewRelatedList - INTERACTION BLOCK
var myCollection2 = function(){
	contador = contador + 1;
	contCollection = contCollection + 1;
    //rectangulo principal 
	this.p1 = new paper.Path.Rectangle(new paper.Point(200, 360), new paper.Size(200, 60));
    this.p1.strokeColor = "black";
    this.p1.name = "viewrelatedlist" + contCollection;
	
	//quadrado - element 
	this.p3 = new paper.Path.Rectangle(new paper.Point(this.p1.bounds.x + 10, this.p1.bounds.y + 10), new paper.Size(40, 40));
    this.p3.strokeColor = "black";
    this.p3.name = "collection_symbol";
	
	// linhas dentro do quadrado collection
	this.p5 = new paper.Path();
	this.p5.add(new paper.Point(this.p3.bounds.x + 7.5, this.p3.bounds.y + 7.5)); // primeiro ponto - vai buscar posi??o (bounds) de p1 - rectangulo e acresce 20 ao y (para baixo) 
	this.p5.add(new paper.Point(this.p3.bounds.x + this.p3.bounds.width - 7.5, this.p3.bounds.y + 7.5)); // segundo ponto - vai buscar posi??o (bounds) de p1 - rectangulo e acresce 20 ao y (para baixo) e utiliza a width de p1 
	this.p5.strokeColor = "black";

	this.p6 = new paper.Path();
	this.p6.add(new paper.Point(this.p3.bounds.x + 7.5, this.p3.bounds.y + 15)); // primeiro ponto - vai buscar posi??o (bounds) de p1 - rectangulo e acresce 20 ao y (para baixo) 
	this.p6.add(new paper.Point(this.p3.bounds.x + this.p3.bounds.width - 7.5, this.p3.bounds.y + 15)); // segundo ponto - vai buscar posi??o (bounds) de p1 - rectangulo e acresce 20 ao y (para baixo) e utiliza a width de p1 
	this.p6.strokeColor = "black";
	
   this.p4 = new paper.PointText({		//texto e cor do texto
        content: 'ViewRelatedList',		
        fillColor: 'black',
		fontSize: 15
    });

	this.p4.point = leftTextos(			//alinhar texto ? esquerda
            this.p1.bounds.width-90, 20,
            this.p1.bounds.x, this.p1.bounds.y,
            this.p4.bounds.width, this.p4.bounds.height
            );
			
	//NOVO 06-07-15
	// linha da lista
	
	this.s1 = new paper.Path();
	this.s1.strokeColor = 'black';
	this.s1.add(new paper.Point(this.p1.bounds.x + (this.p1.bounds.width)-43, this.p1.bounds.y + (this.p1.bounds.height)-25));
	this.s1.add(new paper.Point(this.p1.bounds.x + (this.p1.bounds.width)-24, this.p1.bounds.y + (this.p1.bounds.height)-5));
	this.s1.add(new paper.Point(this.p1.bounds.x + (this.p1.bounds.width)-5, this.p1.bounds.y + (this.p1.bounds.height)-25));

	this.s2 = new paper.Path();
	this.s2.strokeColor = 'black';
	this.s2.add(new paper.Point(this.p1.bounds.x + (this.p1.bounds.width)-43, this.p1.bounds.y +(this.p1.bounds.height)-30));
	this.s2.add(new paper.Point(this.p1.bounds.x + (this.p1.bounds.width)-24, this.p1.bounds.y + (this.p1.bounds.height)-10));
	this.s2.add(new paper.Point(this.p1.bounds.x + (this.p1.bounds.width)-5, this.p1.bounds.y + (this.p1.bounds.height)-30));

	this.s3 = new paper.Path();
	this.s3.strokeColor = 'black';
	this.s3.add(new paper.Point(this.p1.bounds.x + (this.p1.bounds.width)-43, this.p1.bounds.y +(this.p1.bounds.height)-35));
	this.s3.add(new paper.Point(this.p1.bounds.x + (this.p1.bounds.width)-24, this.p1.bounds.y + (this.p1.bounds.height)-15));
	this.s3.add(new paper.Point(this.p1.bounds.x + (this.p1.bounds.width)-5, this.p1.bounds.y + (this.p1.bounds.height)-35));
			
	this.component = new paper.Group([this.p1, this.p4, this.p3, this.p5, this.p6, this.s1, this.s2, this.s3]);
    this.component.data ={
            nome:true,
            texto:true,
            size:0,
			classe: true
    };
	
	this.component.propriedades={
        classe : "",
		atributo : ""
        
    };
	
	this.component.mudaCoisas = function(dados){
        this.p1 = this.children[0];
        this.p4 = this.children[1];
		this.p3 = this.children[2];
        this.p5 = this.children[3];
		this.p6 = this.children[4];
		
					//NOVO 06-07-15
		this.s1 = this.children[5];
		this.s2 = this.children[6];
		this.s3 = this.children[7];
		
        if(dados["nome"]) this.p1.name = dados["nome"];
        if(dados["texto"]) this.p4.content = dados["texto"];

        if(dados["x"]) this.p1.bounds.x = dados["x"];
        if(dados["y"]) this.p1.bounds.y = dados["y"];

        if(dados["w"]) this.p1.bounds.width = dados["w"];
        if(dados["h"]) this.p1.bounds.height = dados["h"];
		
		if(dados["classe"]) this.propriedades["classe"] = dados["classe"]; 
		if(dados["atributo"]) this.propriedades["atributo"] = dados["atributo"];
		
				//ALTERA??O DA POSI??O DOS TRI?NGULOS AQUI
		// Fazer uma c?pia dos tri?ngulos
		this.s1copy = this.s1.clone();
		this.s2copy = this.s2.clone();
		this.s3copy = this.s3.clone();
		
		// mover a c?pia para o centro e fundo do elemnto
		this.s1copy.position = new paper.Point(this.p1.bounds.x + ((this.p1.bounds.width)/2), this.p1.bounds.y + (this.p1.bounds.height)-20);
		this.s2copy.position = new paper.Point(this.p1.bounds.x + ((this.p1.bounds.width)/2), this.p1.bounds.y + (this.p1.bounds.height)-25);
		this.s3copy.position = new paper.Point(this.p1.bounds.x + ((this.p1.bounds.width)/2), this.p1.bounds.y + (this.p1.bounds.height)-30);
				
		//remover o original
		this.s1.remove();
		this.s2.remove();
		this.s3.remove();
		}; 
		
	this.component.getXML = function(){
        this.p1 = this.children[0];
        this.p4 = this.children[1];
		this.p3 = this.children[2];
        this.p5 = this.children[3];
		this.p6 = this.children[4];
		
		xml = "<ViewRelatedList id='"+ this.p1.name +"' text='" + this.p4.content + "' x='"+ this.p1.bounds.x +"' y='"+ this.p1.bounds.y + "' w='" + this.p1.bounds.width + "' h='" +this.p1.bounds.height + "' classe='" + this.propriedades["classe"] + "'>\n" +
                "</ViewRelatedList> \n";
        return xml;
    };
	
    this.component.getElement = function(doc){    	
        this.p1 = this.children[0];
        this.p4 = this.children[1];
		this.p3 = this.children[2];
        this.p5 = this.children[3];
		this.p6 = this.children[4];
		
		var element = doc.createElement("ViewRelatedList");
		element.setAttribute("id", this.p1.name);
		element.setAttribute("text", this.p4.content);
		element.setAttribute("x", this.p1.bounds.x);
		element.setAttribute("y", this.p1.bounds.y);
		element.setAttribute("w", this.p1.bounds.width);
		element.setAttribute("h", this.p1.bounds.height);
		element.setAttribute("classe", this.propriedades["classe"]);		
        return element;
    };	
	
    var type = TYPES.INTERACTION_BLOCK;
	this.component.getType = function(){		
		return type;
	};   	
	
	// novo GETs
	this.component.getX = function(){
		var x = this.p1.bounds.x;
		
		return x;
	};
	
	this.component.getY = function(){
		var y = this.p1.bounds.y;
		
		return y;
	};
	
	this.component.getWidth = function(){
		var w = this.p1.bounds.width;
		
		return w;
	};
	
	this.component.getHeight = function(){
		var h = this.p1.bounds.height;
		
		return h;
	};
	
	//NOVO 08-04-2015
	this.component.getTipo = function(){
		var t = this.p3.name;
		
		return t;
	};
    
    this.posicionaMenu = function(){
		var dados={
			y: 20,
			w: 300,
			h: 100
		};
		this.component.mudaCoisas(dados);
	};
};

// ViewRelatedEntity
var myContainer3 = function(){ 
	contador = contador + 1;
    contContainer = contContainer + 1;
	
	//rectangulo principal 
	this.p1 = new paper.Path.Rectangle(new paper.Point(200, 180), new paper.Size(200, 60));
    this.p1.strokeColor = "black";
    this.p1.name = "viewrelatedentity" + contContainer;

    this.p2 = new paper.PointText({		//texto e cor do texto
        content: 'ViewRelatedEntity',		
        fillColor: 'black',
		fontSize: 15
    });
	
	        
	this.p2.point = leftTextos(			//alinhar texto ? esquerda
            this.p1.bounds.width-90, 20,
            this.p1.bounds.x, this.p1.bounds.y,
            this.p2.bounds.width, this.p2.bounds.height
    );
			
	//quadrado - container 
	this.p3 = new paper.Path.Rectangle(new paper.Point(this.p1.bounds.x + 10, this.p1.bounds.y + 10), new paper.Size(40, 40));
    this.p3.strokeColor = "black";
    this.p3.name = "container_symbol";
	
    this.component = new paper.Group([this.p1, this.p2, this.p3]);
    this.component.data ={
            nome:true,
            texto:true,
            size:0,
			classe: true
    };
	
	this.component.propriedades={
        classe : "",
		atributo : ""
        
    };

	this.component.mudaCoisas = function(dados){
        this.p1 = this.children[0];
        this.p2 = this.children[1];
        
        if(dados["nome"]) this.p1.name = dados["nome"];
        if(dados["texto"]) this.p2.content = dados["texto"];

        if(dados["x"]) this.p1.bounds.x = dados["x"];
        if(dados["y"]) this.p1.bounds.y = dados["y"];

        if(dados["w"]) this.p1.bounds.width = dados["w"];
        if(dados["h"]) this.p1.bounds.height = dados["h"];
		
		if(dados["classe"]) this.propriedades["classe"] = dados["classe"]; 
		if(dados["atributo"]) this.propriedades["atributo"] = dados["atributo"]; 
		
    };
	
    this.component.getXML = function(){
        this.p1 = this.children[0];
        this.p2 = this.children[1];
      xml = "<ViewRelatedEntity id='"+ this.p1.name +"' text='" + this.p2.content + "' x='"+ this.p1.bounds.x +"' y='"+ this.p1.bounds.y + "' w='" + this.p1.bounds.width + "' h='" +this.p1.bounds.height + "' classe='" + this.propriedades["classe"] + /*"' atributo='" + this.propriedades["atributo"] + */"'>\n" +
                "</ViewRelatedEntity> \n";
        return xml;
    };
	
    this.component.getElement = function(doc){    	
        this.p1 = this.children[0];
        this.p2 = this.children[1];
		var element = doc.createElement("ViewRelatedEntity");
		element.setAttribute("id", this.p1.name);
		element.setAttribute("text", this.p2.content);
		element.setAttribute("x", this.p1.bounds.x);
		element.setAttribute("y", this.p1.bounds.y);
		element.setAttribute("w", this.p1.bounds.width);
		element.setAttribute("h", this.p1.bounds.height);
		element.setAttribute("classe", this.propriedades["classe"]);		
        return element;
    };
    
    var type = TYPES.INTERACTION_BLOCK;
	this.component.getType = function(){		
		return type;
	};     
	
	//novo GETs
	this.component.getX = function(){
		var x = this.p1.bounds.x;
		
		return x;
	};
	
	this.component.getY = function(){
		var y = this.p1.bounds.y;
		
		return y;
	};
	
	this.component.getWidth = function(){
		var w = this.p1.bounds.width;
		
		return w;
	};
	
	this.component.getHeight = function(){
		var h = this.p1.bounds.height;
		
		return h;
	};
	
	//NOVO 08-04-2015
	this.component.getTipo = function(){
		var t = this.p3.name;
		
		return t;
	};
	
	this.component.getClasse = function(){
		var cl = this.propriedades.classe;
		
		return cl;
	};    
	
    this.posicionaMenu = function(){
		var dados={
			y: 20,
			w: 300,
			h: 100
		};
		this.component.mudaCoisas(dados);
	};

};

// Interaction Space
var myContainer = function(){ 
	contador = contador + 1;
    contContainer = contContainer + 1;
	
	// Rectangulo principal 
	this.p1 = new paper.Path.Rectangle(new paper.Point(420, 100), new paper.Size(200, 60));
    this.p1.strokeColor = "black";
    this.p1.name = "interactionspace" + contContainer;

    this.p2 = new paper.PointText({		//texto e cor do texto
        content: 'InteractionSpace',		
        fillColor: 'black',
		fontSize: 15
    });
	
	        
	this.p2.point = leftTextos(			//alinhar texto ? esquerda
            this.p1.bounds.width-90, 20,
            this.p1.bounds.x, this.p1.bounds.y,
            this.p2.bounds.width, this.p2.bounds.height
    );
			
	//quadrado - container 
	this.p3 = new paper.Path.Rectangle(new paper.Point(this.p1.bounds.x + 10, this.p1.bounds.y + 10), new paper.Size(40, 40));
    this.p3.strokeColor = "black";
    this.p3.name = "container_symbol";
	
    this.component = new paper.Group([this.p1, this.p2, this.p3]);
    this.component.data = {
            nome:true,
            texto:true,
            size:0,
			classe: true
    };
	
	this.component.propriedades={
        classe : "",
		atributo : ""
        
    };

	this.component.mudaCoisas = function(dados){
        this.p1 = this.children[0];
        this.p2 = this.children[1];
        
        if(dados["nome"]) this.p1.name = dados["nome"];
        if(dados["texto"]) this.p2.content = dados["texto"];

        if(dados["x"]) this.p1.bounds.x = dados["x"];
        if(dados["y"]) this.p1.bounds.y = dados["y"];

        if(dados["w"]) this.p1.bounds.width = dados["w"];
        if(dados["h"]) this.p1.bounds.height = dados["h"];
		
		if(dados["classe"]) this.propriedades["classe"] = dados["classe"]; 
		if(dados["atributo"]) this.propriedades["atributo"] = dados["atributo"]; 
		
    };
	
    this.component.getXML = function(){
        this.p1 = this.children[0];
        this.p2 = this.children[1];
      	xml = "<InteractionSpace id='"+ this.p1.name +"' text='" + this.p2.content + "' x='"+ this.p1.bounds.x +"' y='"+ this.p1.bounds.y + "' w='" + this.p1.bounds.width + "' h='" +this.p1.bounds.height + "' classe='" + this.propriedades["classe"] + /*"' atributo='" + this.propriedades["atributo"] + */"'>\n" +
                "</InteractionSpace> \n";
        return xml;
    };
    
    this.component.getElement = function(doc){    	
        this.p1 = this.children[0];
        this.p2 = this.children[1];
		var element = doc.createElement("InteractionSpace");
		element.setAttribute("id", this.p1.name);
		element.setAttribute("text", this.p2.content);
		element.setAttribute("x", this.p1.bounds.x);
		element.setAttribute("y", this.p1.bounds.y);
		element.setAttribute("w", this.p1.bounds.width);
		element.setAttribute("h", this.p1.bounds.height);
		element.setAttribute("classe", this.propriedades["classe"]);		
        return element;
    };
    
    var type = TYPES.INTERACTION_SPACE;
	this.component.getType = function(){		
		return type;
	};    
		
	//novo GETs
	this.component.getX = function(){
		var x = this.p1.bounds.x;		
		return x;
	};
	
	this.component.getY = function(){
		var y = this.p1.bounds.y;
		
		return y;
	};
	
	this.component.getWidth = function(){
		var w = this.p1.bounds.width;
		
		return w;
	};
	
	this.component.getHeight = function(){
		var h = this.p1.bounds.height;
		
		return h;
	};
	
	//NOVO 08-04-2015
	this.component.getTipo = function(){
		var t = this.p3.name;		
		return t;
	};
	
	this.component.getClasse = function(){
		var cl = this.propriedades.classe;
		
		return cl;
	};    
	
    this.posicionaMenu = function(){
		var dados={
			y: 20,
			w: 300,
			h: 100
		};
		this.component.mudaCoisas(dados);
	};
};

//importar Container do XML
function impMenuBar(idMB, textoMB, classeMB, atributoMB, xMB, yMB, wMB, hMB){
	contador = contador + 1;
    contContainer = contContainer + 1;
	
	//rectangulo principal 
	this.p1 = new paper.Path.Rectangle(new paper.Point(xMB, yMB), new paper.Size(wMB, hMB));
    this.p1.strokeColor = "black";
    this.p1.name = idMB;
	this.p1.dashArray = [8, 10];
	this.p1.strokeWidth = 2;

    this.p2 = new paper.PointText({		//texto e cor do texto
        content: textoMB,		
        fillColor: 'black',
		fontSize: 15
    });
	
	        
	this.p2.point = leftTextos(			//alinhar texto ? esquerda
            this.p1.bounds.width-90, 20,
            this.p1.bounds.x, this.p1.bounds.y,
            this.p2.bounds.width, this.p2.bounds.height
    );
			
    this.component = new paper.Group([this.p1, this.p2]);
    this.component.data ={
            nome:true,
            texto:true,
            size:0,
			classe: true
    };
	
	this.component.propriedades={
        classe : classeMB,
		atributo : " "
        
    };

	this.component.mudaCoisas = function(dados){
        this.p1 = this.children[0];
        this.p2 = this.children[1];
        
        if(dados["nome"]) this.p1.name = dados["nome"];
        if(dados["texto"]) this.p2.content = dados["texto"];

        if(dados["x"]) this.p1.bounds.x = dados["x"];
        if(dados["y"]) this.p1.bounds.y = dados["y"];

        if(dados["w"]) this.p1.bounds.width = dados["w"];
        if(dados["h"]) this.p1.bounds.height = dados["h"];
		
		if(dados["classe"]) this.propriedades["classe"] = dados["classe"]; 
		if(dados["atributo"]) this.propriedades["atributo"] = dados["atributo"]; 
		
    };
	
    this.component.getXML = function(){
        this.p1 = this.children[0];
        this.p2 = this.children[1];
      xml = "<MenuBar id='"+ this.p1.name +"' text='" + this.p2.content + "' x='"+ this.p1.bounds.x +"' y='"+ this.p1.bounds.y + "' w='" + this.p1.bounds.width + "' h='" +this.p1.bounds.height + "' classe='" + this.propriedades["classe"] + /*"' atributo='" + this.propriedades["atributo"] + */"'>\n" +
                "</MenuBar> \n";
        return xml;
    };
    
    this.component.getElement = function(doc){    	
        this.p1 = this.children[0];
        this.p2 = this.children[1];
		var element = doc.createElement("MenuBar");
		element.setAttribute("id", this.p1.name);
		element.setAttribute("text", this.p2.content);
		element.setAttribute("x", this.p1.bounds.x);
		element.setAttribute("y", this.p1.bounds.y);
		element.setAttribute("w", this.p1.bounds.width);
		element.setAttribute("h", this.p1.bounds.height);
		element.setAttribute("classe", this.propriedades["classe"]);		
        return element;
    };	
	
    var type = TYPES.MENU_BAR;
	this.component.getType = function(){		
		return type;
	};    
	
	//novo GETs
	this.component.getX = function(){
		var x = this.p1.bounds.x;
		
		return x;
	};
	
	this.component.getY = function(){
		var y = this.p1.bounds.y;
		
		return y;
	};
	
	this.component.getWidth = function(){
		var w = this.p1.bounds.width;
		
		return w;
	};
	
	this.component.getHeight = function(){
		var h = this.p1.bounds.height;
		
		return h;
	};
    
    this.posicionaMenu = function(){
		var dados={
			y: 20,
			w: 300,
			h: 100
		};
		this.component.mudaCoisas(dados);
	};
};

//importar Container do XML
function impContainer(idC, textoC, classeC, atributoC, xC, yC, wC, hC){
	contador = contador + 1;
    contContainer = contContainer + 1;
	
	//rectangulo principal 
	this.p1 = new paper.Path.Rectangle(new paper.Point(xC, yC), new paper.Size(wC, hC));
    this.p1.strokeColor = "black";
    this.p1.name = idC;

    this.p2 = new paper.PointText({		//texto e cor do texto
        content: textoC,		
        fillColor: 'black',
		fontSize: 15
    });
	
	        
	this.p2.point = leftTextos(			//alinhar texto ? esquerda
            this.p1.bounds.width-90, 20,
            this.p1.bounds.x, this.p1.bounds.y,
            this.p2.bounds.width, this.p2.bounds.height
    );
			
	//quadrado - container 
	this.p3 = new paper.Path.Rectangle(new paper.Point(this.p1.bounds.x + 10, this.p1.bounds.y + 10), new paper.Size(40, 40));
    this.p3.strokeColor = "black";
    this.p3.name = "container_symbol";
	
    this.component = new paper.Group([this.p1, this.p2, this.p3]);
    this.component.data ={
            nome:true,
            texto:true,
            size:0,
			classe: true
    };
	
	this.component.propriedades={
        classe : classeC,
		atributo : " "
        
    };

	this.component.mudaCoisas = function(dados){
        this.p1 = this.children[0];
        this.p2 = this.children[1];
        
        if(dados["nome"]) this.p1.name = dados["nome"];
        if(dados["texto"]) this.p2.content = dados["texto"];

        if(dados["x"]) this.p1.bounds.x = dados["x"];
        if(dados["y"]) this.p1.bounds.y = dados["y"];

        if(dados["w"]) this.p1.bounds.width = dados["w"];
        if(dados["h"]) this.p1.bounds.height = dados["h"];
		
		if(dados["classe"]) this.propriedades["classe"] = dados["classe"]; 
		if(dados["atributo"]) this.propriedades["atributo"] = dados["atributo"]; 
		
    };
	
    this.component.getXML = function(){
        this.p1 = this.children[0];
        this.p2 = this.children[1];
      xml = "<InteractionSpace id='"+ this.p1.name +"' text='" + this.p2.content + "' x='"+ this.p1.bounds.x +"' y='"+ this.p1.bounds.y + "' w='" + this.p1.bounds.width + "' h='" +this.p1.bounds.height + "' classe='" + this.propriedades["classe"] + /*"' atributo='" + this.propriedades["atributo"] + */"'>\n" +
                "</InteractionSpace> \n";
        return xml;
    };
	
    this.component.getElement = function(doc){    	
        this.p1 = this.children[0];
        this.p2 = this.children[1];
		var element = doc.createElement("InteractionSpace");
		element.setAttribute("id", this.p1.name);
		element.setAttribute("text", this.p2.content);
		element.setAttribute("x", this.p1.bounds.x);
		element.setAttribute("y", this.p1.bounds.y);
		element.setAttribute("w", this.p1.bounds.width);
		element.setAttribute("h", this.p1.bounds.height);
		element.setAttribute("classe", this.propriedades["classe"]);		
        return element;
    };
    
    var type = TYPES.INTERACTION_SPACE;
	this.component.getType = function(){		
		return type;
	}; 
		
	//novo GETs
	this.component.getX = function(){
		var x = this.p1.bounds.x;
		
		return x;
	};
	
	this.component.getY = function(){
		var y = this.p1.bounds.y;
		
		return y;
	};
	
	this.component.getWidth = function(){
		var w = this.p1.bounds.width;
		
		return w;
	};
	
	this.component.getHeight = function(){
		var h = this.p1.bounds.height;
		
		return h;
	};
	
    this.posicionaMenu = function(){
		var dados={
			y: 20,
			w: 300,
			h: 100
		};
		this.component.mudaCoisas(dados);
	};	
};

//importar Container do XML
function impContainer2(idC, textoC, classeC, atributoC, xC, yC, wC, hC){
	contador = contador + 1;
    contContainer = contContainer + 1;
	
	//rectangulo principal 
	this.p1 = new paper.Path.Rectangle(new paper.Point(xC, yC), new paper.Size(wC, hC));
    this.p1.strokeColor = "black";
    this.p1.name = idC;

    this.p2 = new paper.PointText({		//texto e cor do texto
        content: textoC,		
        fillColor: 'black',
		fontSize: 15
    });
	
	        
	this.p2.point = leftTextos(			//alinhar texto ? esquerda
            this.p1.bounds.width-90, 20,
            this.p1.bounds.x, this.p1.bounds.y,
            this.p2.bounds.width, this.p2.bounds.height
    );
			
	//quadrado - container 
	this.p3 = new paper.Path.Rectangle(new paper.Point(this.p1.bounds.x + 10, this.p1.bounds.y + 10), new paper.Size(40, 40));
    this.p3.strokeColor = "black";
    this.p3.name = "container_symbol";
	
    this.component = new paper.Group([this.p1, this.p2, this.p3]);
    this.component.data ={
            nome:true,
            texto:true,
            size:0,
			classe: true
    };
	
	this.component.propriedades={
        classe : classeC,
		atributo : " "
        
    };

	this.component.mudaCoisas = function(dados){
        this.p1 = this.children[0];
        this.p2 = this.children[1];
        
        if(dados["nome"]) this.p1.name = dados["nome"];
        if(dados["texto"]) this.p2.content = dados["texto"];

        if(dados["x"]) this.p1.bounds.x = dados["x"];
        if(dados["y"]) this.p1.bounds.y = dados["y"];

        if(dados["w"]) this.p1.bounds.width = dados["w"];
        if(dados["h"]) this.p1.bounds.height = dados["h"];
		
		if(dados["classe"]) this.propriedades["classe"] = dados["classe"]; 
		if(dados["atributo"]) this.propriedades["atributo"] = dados["atributo"]; 
		
    };
	
    this.component.getXML = function(){
        this.p1 = this.children[0];
        this.p2 = this.children[1];
      xml = "<ViewEntity id='"+ this.p1.name +"' text='" + this.p2.content + "' x='"+ this.p1.bounds.x +"' y='"+ this.p1.bounds.y + "' w='" + this.p1.bounds.width + "' h='" +this.p1.bounds.height + "' classe='" + this.propriedades["classe"] + /*"' atributo='" + this.propriedades["atributo"] + */"'>\n" +
                "</ViewEntity> \n";
        return xml;
    };
	
    this.component.getElement = function(doc){    	
        this.p1 = this.children[0];
        this.p2 = this.children[1];
		var element = doc.createElement("ViewEntity");
		element.setAttribute("id", this.p1.name);
		element.setAttribute("text", this.p2.content);
		element.setAttribute("x", this.p1.bounds.x);
		element.setAttribute("y", this.p1.bounds.y);
		element.setAttribute("w", this.p1.bounds.width);
		element.setAttribute("h", this.p1.bounds.height);
		element.setAttribute("classe", this.propriedades["classe"]);		
        return element;
    };	
	
    var type = TYPES.INTERACTION_BLOCK;
	this.component.getType = function(){		
		return type;
	}; 
		
	//novo GETs
	this.component.getX = function(){
		var x = this.p1.bounds.x;
		
		return x;
	};
	
	this.component.getY = function(){
		var y = this.p1.bounds.y;
		
		return y;
	};
	
	this.component.getWidth = function(){
		var w = this.p1.bounds.width;
		
		return w;
	};
	
	this.component.getHeight = function(){
		var h = this.p1.bounds.height;
		
		return h;
	};

    this.posicionaMenu = function(){
		var dados={
			y: 20,
			w: 300,
			h: 100
		};
		this.component.mudaCoisas(dados);
	};
};

//importar Container do XML
function impContainer3(idC, textoC, classeC, atributoC, xC, yC, wC, hC){
	contador = contador + 1;
    contContainer = contContainer + 1;
	
	//rectangulo principal 
	this.p1 = new paper.Path.Rectangle(new paper.Point(xC, yC), new paper.Size(wC, hC));
    this.p1.strokeColor = "black";
    this.p1.name = idC;

    this.p2 = new paper.PointText({		//texto e cor do texto
        content: textoC,		
        fillColor: 'black',
		fontSize: 15
    });
	
	        
	this.p2.point = leftTextos(			//alinhar texto ? esquerda
            this.p1.bounds.width-90, 20,
            this.p1.bounds.x, this.p1.bounds.y,
            this.p2.bounds.width, this.p2.bounds.height
    );
			
	//quadrado - container 
	this.p3 = new paper.Path.Rectangle(new paper.Point(this.p1.bounds.x + 10, this.p1.bounds.y + 10), new paper.Size(40, 40));
    this.p3.strokeColor = "black";
    this.p3.name = "container_symbol";
	
    this.component = new paper.Group([this.p1, this.p2, this.p3]);
    this.component.data ={
            nome:true,
            texto:true,
            size:0,
			classe: true
    };
	
	this.component.propriedades={
        classe : classeC,
		atributo : " "
        
    };

	this.component.mudaCoisas = function(dados){
        this.p1 = this.children[0];
        this.p2 = this.children[1];
        
        if(dados["nome"]) this.p1.name = dados["nome"];
        if(dados["texto"]) this.p2.content = dados["texto"];

        if(dados["x"]) this.p1.bounds.x = dados["x"];
        if(dados["y"]) this.p1.bounds.y = dados["y"];

        if(dados["w"]) this.p1.bounds.width = dados["w"];
        if(dados["h"]) this.p1.bounds.height = dados["h"];
		
		if(dados["classe"]) this.propriedades["classe"] = dados["classe"]; 
		if(dados["atributo"]) this.propriedades["atributo"] = dados["atributo"]; 
		
    };
	
    this.component.getXML = function(){
        this.p1 = this.children[0];
        this.p2 = this.children[1];
      xml = "<ViewRelatedEntity id='"+ this.p1.name +"' text='" + this.p2.content + "' x='"+ this.p1.bounds.x +"' y='"+ this.p1.bounds.y + "' w='" + this.p1.bounds.width + "' h='" +this.p1.bounds.height + "' classe='" + this.propriedades["classe"] + /*"' atributo='" + this.propriedades["atributo"] + */"'>\n" +
                "</ViewRelatedEntity> \n";
        return xml;
    };
	
    this.component.getElement = function(doc){    	
        this.p1 = this.children[0];
        this.p2 = this.children[1];
		var element = doc.createElement("ViewRelatedEntity");
		element.setAttribute("id", this.p1.name);
		element.setAttribute("text", this.p2.content);
		element.setAttribute("x", this.p1.bounds.x);
		element.setAttribute("y", this.p1.bounds.y);
		element.setAttribute("w", this.p1.bounds.width);
		element.setAttribute("h", this.p1.bounds.height);
		element.setAttribute("classe", this.propriedades["classe"]);		
        return element;
    };
    
    var type = TYPES.INTERACTION_BLOCK;
	this.component.getType = function(){		
		return type;
	};
		
	
	//novo GETs
	this.component.getX = function(){
		var x = this.p1.bounds.x;
		
		return x;
	};
	
	this.component.getY = function(){
		var y = this.p1.bounds.y;
		
		return y;
	};
	
	this.component.getWidth = function(){
		var w = this.p1.bounds.width;
		
		return w;
	};
	
	this.component.getHeight = function(){
		var h = this.p1.bounds.height;
		
		return h;
	};
    
    this.posicionaMenu = function(){
		var dados={
			y: 20,
			w: 300,
			h: 100
		};
		this.component.mudaCoisas(dados);
	};
};

//importar Element do XML
function impElement(idE, textoE, classeE, atributoE, xE, yE, wE, hE){
	contador = contador + 1;
	contElement = contElement + 1;
    //rectangulo principal 
	this.p1 = new paper.Path.Rectangle(new paper.Point(xE, yE), new paper.Size(wE, hE));
    this.p1.strokeColor = "black";
    this.p1.name = idE;
	
	//quadrado - element 
	this.p3 = new paper.Path.Rectangle(new paper.Point(this.p1.bounds.x + 10, this.p1.bounds.y + 10), new paper.Size(40, 40));
    this.p3.strokeColor = "black";
    this.p3.name = "element_symbol";
	
	this.p4 = new paper.PointText({		//texto, cor do texto e tamanho
        content: textoE,		
        fillColor: 'black',
		fontSize: 15
    });

	this.p4.point = leftTextos(			//alinhar texto ? esquerda
            this.p1.bounds.width-90, 20,
            this.p1.bounds.x, this.p1.bounds.y,
            this.p4.bounds.width, this.p4.bounds.height
            );

	// linha dentro do quadrado element
	this.p5 = new paper.Path();
	this.p5.add(new paper.Point(this.p3.bounds.x + 7.5, this.p3.bounds.y + 7.5)); // primeiro ponto - vai buscar posi??o (bounds) de p1 - rectangulo e acresce 20 ao y (para baixo) 
	this.p5.add(new paper.Point(this.p3.bounds.x + this.p3.bounds.width - 7.5, this.p3.bounds.y + 7.5)); // segundo ponto - vai buscar posi??o (bounds) de p1 - rectangulo e acresce 20 ao y (para baixo) e utiliza a width de p1 
	this.p5.strokeColor = "black";
		
	this.component = new paper.Group([this.p1, this.p4, this.p3, this.p5]);
    this.component.data ={
            nome:true,
            texto:true,
            size:0,
			classe: true
    };
	
	this.component.propriedades={
        classe : classeE,
		atributo: atributoE
        
    };
	


	this.component.mudaCoisas = function(dados){
        this.p1 = this.children[0];
        this.p4 = this.children[1];
		this.p3 = this.children[2];
        this.p5 = this.children[3];
		
        if(dados["nome"]) this.p1.name = dados["nome"];
        if(dados["texto"]) this.p4.content = dados["texto"];

        if(dados["x"]) this.p1.bounds.x = dados["x"];
        if(dados["y"]) this.p1.bounds.y = dados["y"];

        if(dados["w"]) this.p1.bounds.width = dados["w"];
        if(dados["h"]) this.p1.bounds.height = dados["h"];
		
		if(dados["classe"]) this.propriedades["classe"] = dados["classe"]; 
		if(dados["atributo"]) this.propriedades["atributo"] = dados["atributo"]; 
		}; 
		
	this.component.getXML = function(){
        this.p1 = this.children[0];
        this.p4 = this.children[1];
		this.p3 = this.children[2];
       	this.p5 = this.children[3];
		
		xml = "<OutputOnly id='"+ this.p1.name +"' text='" + this.p4.content + "' x='"+ this.p1.bounds.x +"' y='"+ this.p1.bounds.y + "' w='" + this.p1.bounds.width + "' h='" +this.p1.bounds.height + "' classe='" + this.propriedades["classe"] + "' atributo='" + this.propriedades["atributo"] +"'>\n" +
                "</OutputOnly> \n";
        return xml;
    };
	
    this.component.getElement = function(doc){    	
        this.p1 = this.children[0];
        this.p4 = this.children[1];
		this.p3 = this.children[2];
       	this.p5 = this.children[3];
		
		var element = doc.createElement("OutputOnly");
		element.setAttribute("id", this.p1.name);
		element.setAttribute("text", this.p4.content);
		element.setAttribute("x", this.p1.bounds.x);
		element.setAttribute("y", this.p1.bounds.y);
		element.setAttribute("w", this.p1.bounds.width);
		element.setAttribute("h", this.p1.bounds.height);
		element.setAttribute("classe", this.propriedades["classe"]);
		element.setAttribute("atributo", this.propriedades["atributo"]);		
        return element;
    };	
	
    var type = TYPES.DATA_AIO;
	this.component.getType = function(){		
		return type;
	};
		
	//novo GETs
	this.component.getX = function(){
		var x = this.p1.bounds.x;
		
		return x;
	};
	
	this.component.getY = function(){
		var y = this.p1.bounds.y;
		
		return y;
	};
	
	this.component.getWidth = function(){
		var w = this.p1.bounds.width;
		
		return w;
	};
	
	this.component.getHeight = function(){
		var h = this.p1.bounds.height;
		
		return h;
	};
    
    this.posicionaMenu = function(){
		var dados={
			y: 20,
			w: 300,
			h: 100
		};
		this.component.mudaCoisas(dados);
	};
}

//importar Collection do XML
function impCollection(idCL, textoCL, classeCL, atributoCL, xCL, yCL, wCL, hCL){
	
	contador = contador + 1;
	contCollection = contCollection + 1;
    //rectangulo principal 
	this.p1 = new paper.Path.Rectangle(new paper.Point(xCL, yCL), new paper.Size(wCL, hCL));
    this.p1.strokeColor = "black";
    this.p1.name = idCL;
	
	//quadrado - element 
	this.p3 = new paper.Path.Rectangle(new paper.Point(this.p1.bounds.x + 10, this.p1.bounds.y + 10), new paper.Size(40, 40));
    this.p3.strokeColor = "black";
    this.p3.name = "collection_symbol";
	
	// linhas dentro do quadrado collection
	this.p5 = new paper.Path();
	this.p5.add(new paper.Point(this.p3.bounds.x + 7.5, this.p3.bounds.y + 7.5)); // primeiro ponto - vai buscar posi??o (bounds) de p1 - rectangulo e acresce 20 ao y (para baixo) 
	this.p5.add(new paper.Point(this.p3.bounds.x + this.p3.bounds.width - 7.5, this.p3.bounds.y + 7.5)); // segundo ponto - vai buscar posi??o (bounds) de p1 - rectangulo e acresce 20 ao y (para baixo) e utiliza a width de p1 
	this.p5.strokeColor = "black";

	this.p6 = new paper.Path();
	this.p6.add(new paper.Point(this.p3.bounds.x + 7.5, this.p3.bounds.y + 15)); // primeiro ponto - vai buscar posi??o (bounds) de p1 - rectangulo e acresce 20 ao y (para baixo) 
	this.p6.add(new paper.Point(this.p3.bounds.x + this.p3.bounds.width - 7.5, this.p3.bounds.y + 15)); // segundo ponto - vai buscar posi??o (bounds) de p1 - rectangulo e acresce 20 ao y (para baixo) e utiliza a width de p1 
	this.p6.strokeColor = "black";
	
   this.p4 = new paper.PointText({		//texto e cor do texto
        content: textoCL,		
        fillColor: 'black',
		fontSize: 15
    });

	this.p4.point = leftTextos(			//alinhar texto ? esquerda
            this.p1.bounds.width-90, 20,
            this.p1.bounds.x, this.p1.bounds.y,
            this.p4.bounds.width, this.p4.bounds.height
            );
			
	//NOVO 06-07-15
	// linha da lista
	
	this.s1 = new paper.Path();
	this.s1.strokeColor = 'black';
	this.s1.add(new paper.Point(this.p1.bounds.x + (this.p1.bounds.width/2)-19, this.p1.bounds.y + (this.p1.bounds.height)-25));
	this.s1.add(new paper.Point(this.p1.bounds.x + (this.p1.bounds.width/2), this.p1.bounds.y + (this.p1.bounds.height)-5));
	this.s1.add(new paper.Point(this.p1.bounds.x + (this.p1.bounds.width/2)+19, this.p1.bounds.y + (this.p1.bounds.height)-25));

	this.s2 = new paper.Path();
	this.s2.strokeColor = 'black';
	this.s2.add(new paper.Point(this.p1.bounds.x + (this.p1.bounds.width/2)-19, this.p1.bounds.y +(this.p1.bounds.height)-30));
	this.s2.add(new paper.Point(this.p1.bounds.x + (this.p1.bounds.width/2), this.p1.bounds.y + (this.p1.bounds.height)-10));
	this.s2.add(new paper.Point(this.p1.bounds.x + (this.p1.bounds.width/2)+19, this.p1.bounds.y + (this.p1.bounds.height)-30));

	this.s3 = new paper.Path();
	this.s3.strokeColor = 'black';
	this.s3.add(new paper.Point(this.p1.bounds.x + (this.p1.bounds.width/2)-19, this.p1.bounds.y +(this.p1.bounds.height)-35));
	this.s3.add(new paper.Point(this.p1.bounds.x + (this.p1.bounds.width/2), this.p1.bounds.y + (this.p1.bounds.height)-15));
	this.s3.add(new paper.Point(this.p1.bounds.x + (this.p1.bounds.width/2)+19, this.p1.bounds.y + (this.p1.bounds.height)-35));

			
	this.component = new paper.Group([this.p1, this.p4, this.p3, this.p5, this.p6, this.s1, this.s2, this.s3]);
    this.component.data ={
            nome:true,
            texto:true,
            size:0,
			classe: true
    };
	
	this.component.propriedades={
        classe : classeCL,
		atributo : " "
        
    };
	
	this.component.mudaCoisas = function(dados){
        this.p1 = this.children[0];
        this.p4 = this.children[1];
		this.p3 = this.children[2];
        this.p5 = this.children[3];
		this.p6 = this.children[4];
		
					//NOVO 06-07-15
		this.s1 = this.children[5];
		this.s2 = this.children[6];
		this.s3 = this.children[7];
		
        if(dados["nome"]) this.p1.name = dados["nome"];
        if(dados["texto"]) this.p4.content = dados["texto"];

        if(dados["x"]) this.p1.bounds.x = dados["x"];
        if(dados["y"]) this.p1.bounds.y = dados["y"];

        if(dados["w"]) this.p1.bounds.width = dados["w"];
        if(dados["h"]) this.p1.bounds.height = dados["h"];
		
		if(dados["classe"]) this.propriedades["classe"] = dados["classe"]; 
		if(dados["atributo"]) this.propriedades["atributo"] = dados["atributo"];

		//ALTERA??O DA POSI??O DOS TRI?NGULOS AQUI
		// Fazer uma c?pia dos tri?ngulos
		this.s1copy = this.s1.clone();
		this.s2copy = this.s2.clone();
		this.s3copy = this.s3.clone();
		
		// mover a c?pia para o centro e fundo do elemnto
		this.s1copy.position = new paper.Point(this.p1.bounds.x + ((this.p1.bounds.width)/2), this.p1.bounds.y + (this.p1.bounds.height)-20);
		this.s2copy.position = new paper.Point(this.p1.bounds.x + ((this.p1.bounds.width)/2), this.p1.bounds.y + (this.p1.bounds.height)-25);
		this.s3copy.position = new paper.Point(this.p1.bounds.x + ((this.p1.bounds.width)/2), this.p1.bounds.y + (this.p1.bounds.height)-30);
				
		//remover o original
		this.s1.remove();
		this.s2.remove();
		this.s3.remove();		
		}; 
		
	this.component.getXML = function(){
        this.p1 = this.children[0];
        this.p4 = this.children[1];
		this.p3 = this.children[2];
        this.p5 = this.children[3];
		this.p6 = this.children[4];
		
		xml = "<ViewList id='"+ this.p1.name +"' text='" + this.p4.content + "' x='"+ this.p1.bounds.x +"' y='"+ this.p1.bounds.y + "' w='" + this.p1.bounds.width + "' h='" +this.p1.bounds.height + "' classe='" + this.propriedades["classe"] + "'>\n" +
                "</ViewList> \n";
        return xml;
    };
	
    this.component.getElement = function(doc){    	
        this.p1 = this.children[0];
        this.p4 = this.children[1];
		this.p3 = this.children[2];
        this.p5 = this.children[3];
		this.p6 = this.children[4];
		
		var element = doc.createElement("ViewList");
		element.setAttribute("id", this.p1.name);
		element.setAttribute("text", this.p4.content);
		element.setAttribute("x", this.p1.bounds.x);
		element.setAttribute("y", this.p1.bounds.y);
		element.setAttribute("w", this.p1.bounds.width);
		element.setAttribute("h", this.p1.bounds.height);
		element.setAttribute("classe", this.propriedades["classe"]);		
        return element;
    };    
	
    var type = TYPES.INTERACTION_BLOCK;
	this.component.getType = function(){		
		return type;
	}; 
		
	//novo GETs
	this.component.getX = function(){
		var x = this.p1.bounds.x;
		
		return x;
	};
	
	this.component.getY = function(){
		var y = this.p1.bounds.y;
		
		return y;
	};
	
	this.component.getWidth = function(){
		var w = this.p1.bounds.width;
		
		return w;
	};
	
	this.component.getHeight = function(){
		var h = this.p1.bounds.height;
		
		return h;
	};
    
    this.posicionaMenu = function(){
		var dados={
			y: 20,
			w: 300,
			h: 100
		};
		this.component.mudaCoisas(dados);
	};
};

//importar Collection do XML
function impCollection2(idCL, textoCL, classeCL, atributoCL, xCL, yCL, wCL, hCL){
	
	contador = contador + 1;
	contCollection = contCollection + 1;
    //rectangulo principal 
	this.p1 = new paper.Path.Rectangle(new paper.Point(xCL, yCL), new paper.Size(wCL, hCL));
    this.p1.strokeColor = "black";
    this.p1.name = idCL;
	
	//quadrado - element 
	this.p3 = new paper.Path.Rectangle(new paper.Point(this.p1.bounds.x + 10, this.p1.bounds.y + 10), new paper.Size(40, 40));
    this.p3.strokeColor = "black";
    this.p3.name = "collection_symbol";
	
	// linhas dentro do quadrado collection
	this.p5 = new paper.Path();
	this.p5.add(new paper.Point(this.p3.bounds.x + 7.5, this.p3.bounds.y + 7.5)); // primeiro ponto - vai buscar posi??o (bounds) de p1 - rectangulo e acresce 20 ao y (para baixo) 
	this.p5.add(new paper.Point(this.p3.bounds.x + this.p3.bounds.width - 7.5, this.p3.bounds.y + 7.5)); // segundo ponto - vai buscar posi??o (bounds) de p1 - rectangulo e acresce 20 ao y (para baixo) e utiliza a width de p1 
	this.p5.strokeColor = "black";

	this.p6 = new paper.Path();
	this.p6.add(new paper.Point(this.p3.bounds.x + 7.5, this.p3.bounds.y + 15)); // primeiro ponto - vai buscar posi??o (bounds) de p1 - rectangulo e acresce 20 ao y (para baixo) 
	this.p6.add(new paper.Point(this.p3.bounds.x + this.p3.bounds.width - 7.5, this.p3.bounds.y + 15)); // segundo ponto - vai buscar posi??o (bounds) de p1 - rectangulo e acresce 20 ao y (para baixo) e utiliza a width de p1 
	this.p6.strokeColor = "black";
	
   this.p4 = new paper.PointText({		//texto e cor do texto
        content: textoCL,		
        fillColor: 'black',
		fontSize: 15
    });

	this.p4.point = leftTextos(			//alinhar texto ? esquerda
            this.p1.bounds.width-90, 20,
            this.p1.bounds.x, this.p1.bounds.y,
            this.p4.bounds.width, this.p4.bounds.height
            );
			
	//NOVO 06-07-15
	// linha da lista
	
	this.s1 = new paper.Path();
	this.s1.strokeColor = 'black';
	this.s1.add(new paper.Point(this.p1.bounds.x + (this.p1.bounds.width/2)-19, this.p1.bounds.y + (this.p1.bounds.height)-25));
	this.s1.add(new paper.Point(this.p1.bounds.x + (this.p1.bounds.width/2), this.p1.bounds.y + (this.p1.bounds.height)-5));
	this.s1.add(new paper.Point(this.p1.bounds.x + (this.p1.bounds.width/2)+19, this.p1.bounds.y + (this.p1.bounds.height)-25));

	this.s2 = new paper.Path();
	this.s2.strokeColor = 'black';
	this.s2.add(new paper.Point(this.p1.bounds.x + (this.p1.bounds.width/2)-19, this.p1.bounds.y +(this.p1.bounds.height)-30));
	this.s2.add(new paper.Point(this.p1.bounds.x + (this.p1.bounds.width/2), this.p1.bounds.y + (this.p1.bounds.height)-10));
	this.s2.add(new paper.Point(this.p1.bounds.x + (this.p1.bounds.width/2)+19, this.p1.bounds.y + (this.p1.bounds.height)-30));

	this.s3 = new paper.Path();
	this.s3.strokeColor = 'black';
	this.s3.add(new paper.Point(this.p1.bounds.x + (this.p1.bounds.width/2)-19, this.p1.bounds.y +(this.p1.bounds.height)-35));
	this.s3.add(new paper.Point(this.p1.bounds.x + (this.p1.bounds.width/2), this.p1.bounds.y + (this.p1.bounds.height)-15));
	this.s3.add(new paper.Point(this.p1.bounds.x + (this.p1.bounds.width/2)+19, this.p1.bounds.y + (this.p1.bounds.height)-35));

			
	this.component = new paper.Group([this.p1, this.p4, this.p3, this.p5, this.p6, this.s1, this.s2, this.s3]);
    this.component.data ={
            nome:true,
            texto:true,
            size:0,
			classe: true
    };
	
	this.component.propriedades={
        classe : classeCL,
		atributo : " "
        
    };
	
	this.component.mudaCoisas = function(dados){
        this.p1 = this.children[0];
        this.p4 = this.children[1];
		this.p3 = this.children[2];
        this.p5 = this.children[3];
		this.p6 = this.children[4];
		
		this.s1 = this.children[5];
		this.s2 = this.children[6];
		this.s3 = this.children[7];
		
        if(dados["nome"]) this.p1.name = dados["nome"];
        if(dados["texto"]) this.p4.content = dados["texto"];

        if(dados["x"]) this.p1.bounds.x = dados["x"];
        if(dados["y"]) this.p1.bounds.y = dados["y"];

        if(dados["w"]) this.p1.bounds.width = dados["w"];
        if(dados["h"]) this.p1.bounds.height = dados["h"];
		
		if(dados["classe"]) this.propriedades["classe"] = dados["classe"]; 
		if(dados["atributo"]) this.propriedades["atributo"] = dados["atributo"]; 
		
						//ALTERA??O DA POSI??O DOS TRI?NGULOS AQUI
		// Fazer uma c?pia dos tri?ngulos
		this.s1copy = this.s1.clone();
		this.s2copy = this.s2.clone();
		this.s3copy = this.s3.clone();
		
		// mover a c?pia para o centro e fundo do elemnto
		this.s1copy.position = new paper.Point(this.p1.bounds.x + ((this.p1.bounds.width)/2), this.p1.bounds.y + (this.p1.bounds.height)-20);
		this.s2copy.position = new paper.Point(this.p1.bounds.x + ((this.p1.bounds.width)/2), this.p1.bounds.y + (this.p1.bounds.height)-25);
		this.s3copy.position = new paper.Point(this.p1.bounds.x + ((this.p1.bounds.width)/2), this.p1.bounds.y + (this.p1.bounds.height)-30);
				
		//remover o original
		this.s1.remove();
		this.s2.remove();
		this.s3.remove();
		}; 
		
	this.component.getXML = function(){
        this.p1 = this.children[0];
        this.p4 = this.children[1];
		this.p3 = this.children[2];
        this.p5 = this.children[3];
		this.p6 = this.children[4];
		
		xml = "<ViewRelatedList id='"+ this.p1.name +"' text='" + this.p4.content + "' x='"+ this.p1.bounds.x +"' y='"+ this.p1.bounds.y + "' w='" + this.p1.bounds.width + "' h='" +this.p1.bounds.height + "' classe='" + this.propriedades["classe"] + "'>\n" +
                "</ViewRelatedList> \n";
        return xml;
    };
	
    this.component.getElement = function(doc){    	
        this.p1 = this.children[0];
        this.p4 = this.children[1];
		this.p3 = this.children[2];
        this.p5 = this.children[3];
		this.p6 = this.children[4];
		
		var element = doc.createElement("ViewRelatedList");
		element.setAttribute("id", this.p1.name);
		element.setAttribute("text", this.p4.content);
		element.setAttribute("x", this.p1.bounds.x);
		element.setAttribute("y", this.p1.bounds.y);
		element.setAttribute("w", this.p1.bounds.width);
		element.setAttribute("h", this.p1.bounds.height);
		element.setAttribute("classe", this.propriedades["classe"]);		
        return element;
    };	
	
    var type = TYPES.INTERACTION_BLOCK;
	this.component.getType = function(){		
		return type;
	};
		
	//novo GETs
	this.component.getX = function(){
		var x = this.p1.bounds.x;
		
		return x;
	};
	
	this.component.getY = function(){
		var y = this.p1.bounds.y;
		
		return y;
	};
	
	this.component.getWidth = function(){
		var w = this.p1.bounds.width;
		
		return w;
	};
	
	this.component.getHeight = function(){
		var h = this.p1.bounds.height;
		
		return h;
	};
    
    this.posicionaMenu = function(){
		var dados={
			y: 20,
			w: 300,
			h: 100
		};
		this.component.mudaCoisas(dados);
	};
};

//importar Notification do XML
function impNotification(idN, textoN, classeN, atributoN, xN, yN, wN, hN){
	
	contador = contador + 1;
	contNotification = contNotification + 1;
	
	//rectangulo principal 
	this.p1 = new paper.Path.Rectangle(new paper.Point(xN, yN), new paper.Size(wN, hN));
    this.p1.strokeColor = "black";
    this.p1.name = idN;
	
	//quadrado - notification 
	this.p3 = new paper.Path.Rectangle(new paper.Point(this.p1.bounds.x + 10, this.p1.bounds.y + 10), new paper.Size(40, 40));
    this.p3.strokeColor = "black";
    this.p3.name = "notification_symbol";
	
	// linha dentro do quadrado notification
	this.p5 = new paper.Path();
	this.p5.add(new paper.Point(this.p3.bounds.x + 20, this.p3.bounds.y + 6)); // primeiro ponto - vai buscar posi??o (bounds) de p1 - rectangulo e acresce 20 ao y (para baixo) 
	this.p5.add(new paper.Point(this.p3.bounds.x + 20, this.p3.bounds.y + 25)); // segundo ponto - vai buscar posi??o (bounds) de p1 - rectangulo e acresce 20 ao y (para baixo) e utiliza a width de p1 
	this.p5.strokeColor = "black";
	this.p5.strokeWidth = 2;

	// circulo dentro do quadrado notification (pequena linha)
	
	this.p6 = new paper.Path();
	this.p6.add(new paper.Point(this.p3.bounds.x + 20, this.p3.bounds.y + 29)); // primeiro ponto - vai buscar posi??o (bounds) de p1 - rectangulo e acresce 20 ao y (para baixo) 
	this.p6.add(new paper.Point(this.p3.bounds.x + 20, this.p3.bounds.y + 33)); // segundo ponto - vai buscar posi??o (bounds) de p1 - rectangulo e acresce 20 ao y (para baixo) e utiliza a width de p1 
	this.p6.strokeColor = "black";
	this.p6.strokeWidth = 2;
	
	this.p4 = new paper.PointText({		//texto e cor do texto
        content: textoN,		
        fillColor: 'black',
		fontSize: 15
    });

	this.p4.point = leftTextos(			//alinhar texto ? esquerda
            this.p1.bounds.width-90, 20,
            this.p1.bounds.x, this.p1.bounds.y,
            this.p4.bounds.width, this.p4.bounds.height
            );
			
	this.component = new paper.Group([this.p1, this.p4, this.p3, this.p5, this.p6]);
    this.component.data ={
            nome:true,
            texto:true,
            size:0,
			classe: true
    };
	
	this.component.propriedades={
        classe : classeN,
		atributo: atributoN
        
    };
	
	this.component.mudaCoisas = function(dados){
        this.p1 = this.children[0];
        this.p4 = this.children[1];
		this.p3 = this.children[2];
        this.p5 = this.children[3];
		this.p6 = this.children[4];
		
        if(dados["nome"]) this.p1.name = dados["nome"];
        if(dados["texto"]) this.p4.content = dados["texto"];

        if(dados["x"]) this.p1.bounds.x = dados["x"];
        if(dados["y"]) this.p1.bounds.y = dados["y"];

        if(dados["w"]) this.p1.bounds.width = dados["w"];
        if(dados["h"]) this.p1.bounds.height = dados["h"];
		
		if(dados["classe"]) this.propriedades["classe"] = dados["classe"]; 
		if(dados["atributo"]) this.propriedades["atributo"] = dados["atributo"]; 
		}; 
		
	this.component.getXML = function(){
        this.p1 = this.children[0];
        this.p4 = this.children[1];
		this.p3 = this.children[2];
        this.p5 = this.children[3];
		this.p6 = this.children[4];
		
		xml = "<OutputResultSpace id='"+ this.p1.name +"' text='" + this.p4.content + "' x='"+ this.p1.bounds.x +"' y='"+ this.p1.bounds.y + "' w='" + this.p1.bounds.width + "' h='" +this.p1.bounds.height + "' classe='" + this.propriedades["classe"] + "' atributo='" + this.propriedades["atributo"] +"'>\n" +
                "</OutputResultSpace> \n";
        return xml;
    };
	
    this.component.getElement = function(doc){    	
        this.p1 = this.children[0];
        this.p4 = this.children[1];
		this.p3 = this.children[2];
        this.p5 = this.children[3];
		this.p6 = this.children[4];
		
		var element = doc.createElement("OutputResultSpace");
		element.setAttribute("id", this.p1.name);
		element.setAttribute("text", this.p4.content);
		element.setAttribute("x", this.p1.bounds.x);
		element.setAttribute("y", this.p1.bounds.y);
		element.setAttribute("w", this.p1.bounds.width);
		element.setAttribute("h", this.p1.bounds.height);
		element.setAttribute("classe", this.propriedades["classe"]);
		element.setAttribute("atributo", this.propriedades["atributo"]);		
        return element;
    };	
	
    var type = TYPES.DATA_AIO;
	this.component.getType = function(){		
		return type;
	};
		
	//novo GETs
	this.component.getX = function(){
		var x = this.p1.bounds.x;
		
		return x;
	};
	
	this.component.getY = function(){
		var y = this.p1.bounds.y;
		
		return y;
	};
	
	this.component.getWidth = function(){
		var w = this.p1.bounds.width;
		
		return w;
	};
	
	this.component.getHeight = function(){
		var h = this.p1.bounds.height;
		
		return h;
	};
    
    this.posicionaMenu = function(){
		var dados={
			y: 20,
			w: 300,
			h: 100
		};
		this.component.mudaCoisas(dados);
	};
};

// TOOLS
var myActionOperation = function(){
	contador = contador + 1;
	contActionOperation = contActionOperation + 1;
	
	//rectangulo principal 
	this.p1 = new paper.Path.Rectangle(new paper.Point(200, 100), new paper.Size(200, 60));
    this.p1.strokeColor = "black";
    this.p1.name = "actionooperation" + contActionOperation;

	this.p3 = new paper.PointText({		//texto e cor do texto
        content: 'Action Operation',		
        fillColor: 'black',
		fontSize: 15
    });
	
	// linha da seta "/"
	this.p2 = new paper.Path();  
	this.p2.add(new paper.Point(this.p1.bounds.x + 10, this.p1.bounds.y + 45));
	this.p2.add(new paper.Point(this.p1.bounds.x + 43.5, this.p1.bounds.y + 15));
	this.p2.strokeColor = "black";
	this.p2.strokeWidth = 2;

	this.p3.point = leftTextos(			//alinhar texto ? esquerda
            this.p1.bounds.width-90, 20,
            this.p1.bounds.x, this.p1.bounds.y,
            this.p3.bounds.width, this.p3.bounds.height
            );
	
	//tri?ngulo - ponta da seta		
	var center = new paper.Point(this.p1.bounds.x + 45, this.p1.bounds.y + 15);
	var sides = 3;
	var radius = 7;
	this.p4 = new paper.Path.RegularPolygon(center, sides, radius);
	this.p4.fillColor = 'black';	
	this.p4.rotate(45);	
	this.p4.name = "actionoperation_symbol";
			
	this.component = new paper.Group([this.p1, this.p3, this.p2, this.p4]);
    this.component.data ={
            nome:true,
            texto:true,
            size:0,
			classe: true
    };
	
	this.component.propriedades={
        classe : ""
        
    };

		this.component.mudaCoisas = function(dados){
        this.p1 = this.children[0];
        this.p3 = this.children[1];
		this.p2 = this.children[2];
        this.p4 = this.children[3];
		
        if(dados["nome"]) this.p1.name = dados["nome"];
        if(dados["texto"]) this.p3.content = dados["texto"];

        if(dados["x"]) this.p1.bounds.x = dados["x"];
        if(dados["y"]) this.p1.bounds.y = dados["y"];

        if(dados["w"]) this.p1.bounds.width = dados["w"];
        if(dados["h"]) this.p1.bounds.height = dados["h"];
		
		if(dados["classe"]) this.propriedades["classe"] = dados["classe"]; 
		}; 
		
	this.component.getXML = function(){
        this.p1 = this.children[0];
        this.p3 = this.children[1];
		this.p2 = this.children[2];
        this.p4 = this.children[3];
		
		xml = "<ActionOperation id='"+ this.p1.name +"' text='" + this.p3.content + "' x='"+ this.p1.bounds.x +"' y='"+ this.p1.bounds.y + "' w='" + this.p1.bounds.width + "' h='" +this.p1.bounds.height + "' classe='" + this.propriedades["classe"] +"'>\n" +
                "</ActionOperation> \n";
        return xml;
    };
	
		//novo GETs
	this.component.getX = function(){
		var x = this.p1.bounds.x;
		
		return x;
	};
	
	this.component.getY = function(){
		var y = this.p1.bounds.y;
		
		return y;
	};
	
	this.component.getWidth = function(){
		var w = this.p1.bounds.width;
		
		return w;
	};
	
	this.component.getHeight = function(){
		var h = this.p1.bounds.height;
		
		return h;
	};
	
	//NOVO 08-04-2015
	this.component.getTipo = function(){
		var t = this.p4.name;
		
		return t;
	};
    
    this.posicionaMenu = function(){
		var dados={
			y: 20,
			w: 300,
			h: 100
		};
		this.component.mudaCoisas(dados);
	};
};

//importar ActionOperation
function impActionOperation(idAO, textoAO, classeAO, xAO, yAO, wAO, hAO){
	
	contador = contador + 1;
	contActionOperation = contActionOperation + 1;
	
	//rectangulo principal 
	this.p1 = new paper.Path.Rectangle(new paper.Point(xAO, yAO), new paper.Size(wAO, hAO));
    this.p1.strokeColor = "black";
    this.p1.name = idAO;

	this.p3 = new paper.PointText({		//texto e cor do texto
        content: textoAO,		
        fillColor: 'black',
		fontSize: 15
    });
	
	// linha da seta "/"
	this.p2 = new paper.Path();  
	this.p2.add(new paper.Point(this.p1.bounds.x + 10, this.p1.bounds.y + 45));
	this.p2.add(new paper.Point(this.p1.bounds.x + 43.5, this.p1.bounds.y + 15));
	this.p2.strokeColor = "black";
	this.p2.strokeWidth = 2;

	this.p3.point = leftTextos(			//alinhar texto ? esquerda
            this.p1.bounds.width-90, 20,
            this.p1.bounds.x, this.p1.bounds.y,
            this.p3.bounds.width, this.p3.bounds.height
            );
	
	//tri?ngulo - ponta da seta		
	var center = new paper.Point(this.p1.bounds.x + 45, this.p1.bounds.y + 15);
	var sides = 3;
	var radius = 7;
	this.p4 = new paper.Path.RegularPolygon(center, sides, radius);
	this.p4.fillColor = 'black';	
	this.p4.rotate(45);	
			
	this.component = new paper.Group([this.p1, this.p3, this.p2, this.p4]);
    this.component.data ={
            nome:true,
            texto:true,
            size:0,
			classe: true
    };
	
	this.component.propriedades={
        classe : classeAO
        
    };

		this.component.mudaCoisas = function(dados){
        this.p1 = this.children[0];
        this.p3 = this.children[1];
		this.p2 = this.children[2];
        this.p4 = this.children[3];
		
        if(dados["nome"]) this.p1.name = dados["nome"];
        if(dados["texto"]) this.p3.content = dados["texto"];

        if(dados["x"]) this.p1.bounds.x = dados["x"];
        if(dados["y"]) this.p1.bounds.y = dados["y"];

        if(dados["w"]) this.p1.bounds.width = dados["w"];
        if(dados["h"]) this.p1.bounds.height = dados["h"];
		
		if(dados["classe"]) this.propriedades["classe"] = dados["classe"]; 
		}; 
		
	this.component.getXML = function(){
        this.p1 = this.children[0];
        this.p3 = this.children[1];
		this.p2 = this.children[2];
        this.p4 = this.children[3];
		
		xml = "<ActionOperation id='"+ this.p1.name +"' text='" + this.p3.content + "' x='"+ this.p1.bounds.x +"' y='"+ this.p1.bounds.y + "' w='" + this.p1.bounds.width + "' h='" +this.p1.bounds.height + "' classe='" + this.propriedades["classe"] +"'>\n" +
                "</ActionOperation> \n";
        return xml;
    };
	
		//novo GETs
	this.component.getX = function(){
		var x = this.p1.bounds.x;
		
		return x;
	};
	
	this.component.getY = function(){
		var y = this.p1.bounds.y;
		
		return y;
	};
	
	this.component.getWidth = function(){
		var w = this.p1.bounds.width;
		
		return w;
	};
	
	this.component.getHeight = function(){
		var h = this.p1.bounds.height;
		
		return h;
	};
    
    this.posicionaMenu = function(){
		var dados={
			y: 20,
			w: 300,
			h: 100
		};
		this.component.mudaCoisas(dados);
	};
};


//importar Create
function impCreate(idCR, textoCR, classeCR, atributoCR, operacaoCR, xCR, yCR, wCR, hCR){
	
	contador = contador + 1;
	contCreate = contCreate + 1;

	//rectangulo principal 
	this.p1 = new paper.Path.Rectangle(new paper.Point(xCR, yCR), new paper.Size(wCR, hCR));
    this.p1.strokeColor = "black";
    this.p1.name = idCR;

	this.p3 = new paper.PointText({		//texto e cor do texto
        content: textoCR,		
        fillColor: 'black',
		fontSize: 15
    });
	
	// linha da seta "/"
	this.p2 = new paper.Path();  
	this.p2.add(new paper.Point(this.p1.bounds.x + 10, this.p1.bounds.y + 45));
	this.p2.add(new paper.Point(this.p1.bounds.x + 43.5, this.p1.bounds.y + 15));
	this.p2.strokeColor = "black";
	this.p2.strokeWidth = 2;

	this.p3.point = leftTextos(			//alinhar texto ? esquerda
            this.p1.bounds.width-90, 20,
            this.p1.bounds.x, this.p1.bounds.y,
            this.p3.bounds.width, this.p3.bounds.height
            );
	//tri?ngulo - ponta da seta		
	var center = new paper.Point(this.p1.bounds.x + 45, this.p1.bounds.y + 15);
	var sides = 3;
	var radius = 7;
	this.p4 = new paper.Path.RegularPolygon(center, sides, radius);
	this.p4.fillColor = 'black';	
	this.p4.rotate(45);	
	
	//estrela
	var centerstar = new paper.Point(this.p1.bounds.x + 60, this.p1.bounds.y + 10);
	var points = 5;
	var radius1 = 4;
	var radius2 = 7;
	this.p5 = new paper.Path.Star(centerstar, points, radius1, radius2);
	this.p5.fillColor = 'black';
	
			
	this.component = new paper.Group([this.p1, this.p3, this.p2, this.p4, this.p5]);
    this.component.data ={
            nome:true,
            texto:true,
            size:0,
			classe: true
    };
	
	this.component.propriedades={
        classe : classeCR,
		atributo : " ",
		operacao : operacaoCR
        
    };
	
		this.component.mudaCoisas = function(dados){
        this.p1 = this.children[0];
        this.p3 = this.children[1];
		this.p2 = this.children[2];
        this.p4 = this.children[3];
		this.p5 = this.children[4];
		
        if(dados["nome"]) this.p1.name = dados["nome"];
        if(dados["texto"]) this.p3.content = dados["texto"];

        if(dados["x"]) this.p1.bounds.x = dados["x"];
        if(dados["y"]) this.p1.bounds.y = dados["y"];

        if(dados["w"]) this.p1.bounds.width = dados["w"];
        if(dados["h"]) this.p1.bounds.height = dados["h"];
		
		if(dados["classe"]) this.propriedades["classe"] = dados["classe"]; 
		if(dados["atributo"]) this.propriedades["atributo"] = dados["atributo"]; 
		if(dados["operacao"]) this.propriedades["operacao"] = dados["operacao"];
		}; 
		
	this.component.getXML = function(){
        this.p1 = this.children[0];
        this.p3 = this.children[1];
		this.p2 = this.children[2];
        this.p4 = this.children[3];
		this.p5 = this.children[4];
		
		xml = "<CallCreateOp id='"+ this.p1.name +"' text='" + this.p3.content + "' x='"+ this.p1.bounds.x +"' y='"+ this.p1.bounds.y + "' w='" + this.p1.bounds.width + "' h='" +this.p1.bounds.height + "' classe='" + this.propriedades["classe"] + "' operacao='Create" + /*this.propriedades["operacao"] +*/ "'>\n" +
                "</CallCreateOp> \n";
        return xml;
    };
	
	this.component.getElement = function(doc){    	
        this.p1 = this.children[0];
        this.p3 = this.children[1];
		this.p2 = this.children[2];
        this.p4 = this.children[3];
		this.p5 = this.children[4];
		
		var element = doc.createElement("CallCreateOp");
		element.setAttribute("id", this.p1.name);
		element.setAttribute("text", this.p3.content);
		element.setAttribute("x", this.p1.bounds.x);
		element.setAttribute("y", this.p1.bounds.y);
		element.setAttribute("w", this.p1.bounds.width);
		element.setAttribute("h", this.p1.bounds.height);
		element.setAttribute("classe", this.propriedades["classe"]);
		element.setAttribute("operacao", "Create");
        return element;
    };	
	
    var type = TYPES.ACTION_AIO;
	this.component.getType = function(){		
		return type;
	};  
		
	//novo GETs
	this.component.getX = function(){
		var x = this.p1.bounds.x;
		
		return x;
	};
	
	this.component.getY = function(){
		var y = this.p1.bounds.y;
		
		return y;
	};
	
	this.component.getWidth = function(){
		var w = this.p1.bounds.width;
		
		return w;
	};
	
	this.component.getHeight = function(){
		var h = this.p1.bounds.height;
		
		return h;
	};
    
    this.posicionaMenu = function(){
		var dados={
			y: 20,
			w: 300,
			h: 100
		};
		this.component.mudaCoisas(dados);
	};
};

//Importar DeleteErase
function impDeleteErase(idDE, textoDE, classeDE, atributoDE, operacaoDE, xDE, yDE, wDE, hDE){
		
	contador = contador + 1;
	contDeleteErase = contDeleteErase + 1;

	//rectangulo principal 
	this.p1 = new paper.Path.Rectangle(new paper.Point(xDE, yDE), new paper.Size(wDE, hDE));
    this.p1.strokeColor = "black";
    this.p1.name = idDE;

	this.p3 = new paper.PointText({		//texto e cor do texto
        content: textoDE,		
        fillColor: 'black',
		fontSize: 15
    });
	
	// linha da seta "/"
	this.p2 = new paper.Path();  
	this.p2.add(new paper.Point(this.p1.bounds.x + 10, this.p1.bounds.y + 45));
	this.p2.add(new paper.Point(this.p1.bounds.x + 43.5, this.p1.bounds.y + 15));
	this.p2.strokeColor = "black";
	this.p2.strokeWidth = 2;

	this.p3.point = leftTextos(			//alinhar texto ? esquerda
            this.p1.bounds.width-90, 20,
            this.p1.bounds.x, this.p1.bounds.y,
            this.p3.bounds.width, this.p3.bounds.height
            );

	//tri?ngulo - ponta da seta		
	var center = new paper.Point(this.p1.bounds.x + 45, this.p1.bounds.y + 15);
	var sides = 3;
	var radius = 7;
	this.p4 = new paper.Path.RegularPolygon(center, sides, radius);
	this.p4.fillColor = 'black';	
	this.p4.rotate(45);	
	
	// linha do X "/"
	this.p5 = new paper.Path();  
	this.p5.add(new paper.Point(this.p1.bounds.x + 55, this.p1.bounds.y + 15));
	this.p5.add(new paper.Point(this.p1.bounds.x + 65, this.p1.bounds.y + 5));
	this.p5.strokeColor = "black";
	this.p5.strokeWidth = 2;
	
	// linha do X "\"
	this.p6 = new paper.Path();  
	this.p6.add(new paper.Point(this.p1.bounds.x + 55, this.p1.bounds.y + 5));
	this.p6.add(new paper.Point(this.p1.bounds.x + 65, this.p1.bounds.y + 15));
	this.p6.strokeColor = "black";
	this.p6.strokeWidth = 2;

	
	this.component = new paper.Group([this.p1, this.p3, this.p2, this.p4, this.p5, this.p6]);
    this.component.data ={
            nome:true,
            texto:true,
            size:0,
			classe: true
    };
	
	this.component.propriedades={
        classe : classeDE,
		atributo : " ",
		operacao : operacaoDE
        
    };
	
		this.component.mudaCoisas = function(dados){
        this.p1 = this.children[0];
        this.p3 = this.children[1];
		this.p2 = this.children[2];
        this.p4 = this.children[3];
		this.p5 = this.children[4];
		this.p6 = this.children[5];
		
        if(dados["nome"]) this.p1.name = dados["nome"];
        if(dados["texto"]) this.p3.content = dados["texto"];

        if(dados["x"]) this.p1.bounds.x = dados["x"];
        if(dados["y"]) this.p1.bounds.y = dados["y"];

        if(dados["w"]) this.p1.bounds.width = dados["w"];
        if(dados["h"]) this.p1.bounds.height = dados["h"];
		
		if(dados["classe"]) this.propriedades["classe"] = dados["classe"]; 
		if(dados["atributo"]) this.propriedades["atributo"] = dados["atributo"]; 
		if(dados["operacao"]) this.propriedades["operacao"] = dados["operacao"];
		};
		
	this.component.getXML = function(){
        this.p1 = this.children[0];
        this.p3 = this.children[1];
		this.p2 = this.children[2];
        this.p4 = this.children[3];
		this.p5 = this.children[4];
		this.p6 = this.children[5];
		
		xml = "<CallDeleteOp id='"+ this.p1.name +"' text='" + this.p3.content + "' x='"+ this.p1.bounds.x +"' y='"+ this.p1.bounds.y + "' w='" + this.p1.bounds.width + "' h='" +this.p1.bounds.height + "' classe='" + this.propriedades["classe"] + "' operacao='Delete" + /*this.propriedades["operacao"] +*/"'>\n" +
                "</CallDeleteOp> \n";
        return xml;
    };
    
    this.component.getElement = function(doc){    	
        this.p1 = this.children[0];
        this.p3 = this.children[1];
		this.p2 = this.children[2];
        this.p4 = this.children[3];
		this.p5 = this.children[4];
		this.p6 = this.children[5];
		
		var element = doc.createElement("CallDeleteOp");
		element.setAttribute("id", this.p1.name);
		element.setAttribute("text", this.p3.content);
		element.setAttribute("x", this.p1.bounds.x);
		element.setAttribute("y", this.p1.bounds.y);
		element.setAttribute("w", this.p1.bounds.width);
		element.setAttribute("h", this.p1.bounds.height);
		element.setAttribute("classe", this.propriedades["classe"]);
		element.setAttribute("operacao", "Delete");
        return element;
    };	
	
    var type = TYPES.ACTION_AIO;
	this.component.getType = function(){		
		return type;
	}; 
	    
	//novo GETs
	this.component.getX = function(){
		var x = this.p1.bounds.x;
		
		return x;
	};
	
	this.component.getY = function(){
		var y = this.p1.bounds.y;
		
		return y;
	};
	
	this.component.getWidth = function(){
		var w = this.p1.bounds.width;
		
		return w;
	};
	
	this.component.getHeight = function(){
		var h = this.p1.bounds.height;
		
		return h;
	};
	
    this.posicionaMenu = function(){
		var dados={
			y: 20,
			w: 300,
			h: 100
		};
		this.component.mudaCoisas(dados);
	};
};

var myDuplicate = function(){
	contador = contador + 1;
	contDuplicate = contDuplicate + 1;
	
	//rectangulo principal 
	this.p1 = new paper.Path.Rectangle(new paper.Point(200, 100), new paper.Size(200, 60));
    this.p1.strokeColor = "black";
    this.p1.name = "duplicate" + contDuplicate;

	this.p3 = new paper.PointText({		//texto e cor do texto
        content: 'Duplicate',		
        fillColor: 'black',
		fontSize: 15
    });
	
	// linha da seta "/"
	this.p2 = new paper.Path();  
	this.p2.add(new paper.Point(this.p1.bounds.x + 10, this.p1.bounds.y + 45));
	this.p2.add(new paper.Point(this.p1.bounds.x + 43.5, this.p1.bounds.y + 15));
	this.p2.strokeColor = "black";
	this.p2.strokeWidth = 2;

	this.p3.point = leftTextos(			//alinhar texto ? esquerda
            this.p1.bounds.width-90, 20,
            this.p1.bounds.x, this.p1.bounds.y,
            this.p3.bounds.width, this.p3.bounds.height
            );
			
	//tri?ngulo - ponta da seta		
	var center = new paper.Point(this.p1.bounds.x + 45, this.p1.bounds.y + 15);
	var sides = 3;
	var radius = 7;
	this.p4 = new paper.Path.RegularPolygon(center, sides, radius);
	this.p4.fillColor = 'black';	
	this.p4.rotate(45);	
	this.p4.name = "duplicate_symbol";
	
	//segundo rectangulo
	this.p6 = new paper.Path.Rectangle(new paper.Point(this.p1.bounds.x + 60, this.p1.bounds.y + 15), new paper.Size(20, 6));
    this.p6.strokeColor = "black";
	this.p6.fillColor = "black";
	
	//primeiro rectangulo
	this.p5 = new paper.Path.Rectangle(new paper.Point(this.p1.bounds.x + 55, this.p1.bounds.y + 10), new paper.Size(20, 6));
    this.p5.strokeColor = "black";
	this.p5.fillColor = "white";
				
	this.component = new paper.Group([this.p1, this.p3, this.p2, this.p4, this.p5, this.p6]);
    this.component.data ={
            nome:true,
            texto:true,
            accao:false,
            valores:false,
            selected:false,
            size:0,
			classe: true
    };
	
	this.component.propriedades={
        classe : ""
        
    };
	
		this.component.mudaCoisas = function(dados){
        this.p1 = this.children[0];
        this.p3 = this.children[1];
		this.p2 = this.children[2];
        this.p4 = this.children[3];
		this.p5 = this.children[4];
		this.p6 = this.children[5];
		
        if(dados["nome"]) this.p1.name = dados["nome"];
        if(dados["texto"]) this.p3.content = dados["texto"];

        if(dados["x"]) this.p1.bounds.x = dados["x"];
        if(dados["y"]) this.p1.bounds.y = dados["y"];

        if(dados["w"]) this.p1.bounds.width = dados["w"];
        if(dados["h"]) this.p1.bounds.height = dados["h"];
		
		if(dados["classe"]) this.propriedades["classe"] = dados["classe"]; 
		}; 
		
	this.component.getXML = function(){
        this.p1 = this.children[0];
        this.p3 = this.children[1];
		this.p2 = this.children[2];
        this.p4 = this.children[3];
		this.p5 = this.children[4];
		this.p6 = this.children[5];
		
		xml = "<Duplicate id='"+ this.p1.name +"' text='" + this.p3.content + "' x='"+ this.p1.bounds.x +"' y='"+ this.p1.bounds.y + "' w='" + this.p1.bounds.width + "' h='" +this.p1.bounds.height + "' classe='" + this.propriedades["classe"] + "'>\n" +
                "</Duplicate> \n";
        return xml;
    };
	
		//novo GETs
	this.component.getX = function(){
		var x = this.p1.bounds.x;
		
		return x;
	};
	
	this.component.getY = function(){
		var y = this.p1.bounds.y;
		
		return y;
	};
	
	this.component.getWidth = function(){
		var w = this.p1.bounds.width;
		
		return w;
	};
	
	this.component.getHeight = function(){
		var h = this.p1.bounds.height;
		
		return h;
	};
    
	//NOVO 08-04-2015
	this.component.getTipo = function(){
		var t = this.p4.name;
		
		return t;
	};
	
    this.posicionaMenu = function(){
		var dados={
			y: 20,
			w: 300,
			h: 100
		};
		this.component.mudaCoisas(dados);
	};	
};

//importar Duplicate
function impDuplicate(idD, textoD, classeD, xD, yD, wD, hD){
	contador = contador + 1;
	contDuplicate = contDuplicate + 1;
	
	//rectangulo principal 
	this.p1 = new paper.Path.Rectangle(new paper.Point(xD, yD), new paper.Size(wD, hD));
    this.p1.strokeColor = "black";
    this.p1.name = idD;

	this.p3 = new paper.PointText({		//texto e cor do texto
        content: textoD,		
        fillColor: 'black',
		fontSize: 15
    });
	
	// linha da seta "/"
	this.p2 = new paper.Path();  
	this.p2.add(new paper.Point(this.p1.bounds.x + 10, this.p1.bounds.y + 45));
	this.p2.add(new paper.Point(this.p1.bounds.x + 43.5, this.p1.bounds.y + 15));
	this.p2.strokeColor = "black";
	this.p2.strokeWidth = 2;

	this.p3.point = leftTextos(			//alinhar texto ? esquerda
            this.p1.bounds.width-90, 20,
            this.p1.bounds.x, this.p1.bounds.y,
            this.p3.bounds.width, this.p3.bounds.height
            );
			
	//tri?ngulo - ponta da seta		
	var center = new paper.Point(this.p1.bounds.x + 45, this.p1.bounds.y + 15);
	var sides = 3;
	var radius = 7;
	this.p4 = new paper.Path.RegularPolygon(center, sides, radius);
	this.p4.fillColor = 'black';	
	this.p4.rotate(45);	
	
	//segundo rectangulo
	this.p6 = new paper.Path.Rectangle(new paper.Point(this.p1.bounds.x + 60, this.p1.bounds.y + 15), new paper.Size(20, 6));
    this.p6.strokeColor = "black";
	this.p6.fillColor = "black";
	
	//primeiro rectangulo
	this.p5 = new paper.Path.Rectangle(new paper.Point(this.p1.bounds.x + 55, this.p1.bounds.y + 10), new paper.Size(20, 6));
    this.p5.strokeColor = "black";
	this.p5.fillColor = "white";
				
	this.component = new paper.Group([this.p1, this.p3, this.p2, this.p4, this.p5, this.p6]);
    this.component.data ={
            nome:true,
            texto:true,
            accao:false,
            valores:false,
            selected:false,
            size:0,
			classe: true
    };
	
	this.component.propriedades={
        classe : classeD
        
    };
	
		this.component.mudaCoisas = function(dados){
        this.p1 = this.children[0];
        this.p3 = this.children[1];
		this.p2 = this.children[2];
        this.p4 = this.children[3];
		this.p5 = this.children[4];
		this.p6 = this.children[5];
		
        if(dados["nome"]) this.p1.name = dados["nome"];
        if(dados["texto"]) this.p3.content = dados["texto"];

        if(dados["x"]) this.p1.bounds.x = dados["x"];
        if(dados["y"]) this.p1.bounds.y = dados["y"];

        if(dados["w"]) this.p1.bounds.width = dados["w"];
        if(dados["h"]) this.p1.bounds.height = dados["h"];
		
		if(dados["classe"]) this.propriedades["classe"] = dados["classe"]; 
		}; 
		
	this.component.getXML = function(){
        this.p1 = this.children[0];
        this.p3 = this.children[1];
		this.p2 = this.children[2];
        this.p4 = this.children[3];
		this.p5 = this.children[4];
		this.p6 = this.children[5];
		
		xml = "<Duplicate id='"+ this.p1.name +"' text='" + this.p3.content + "' x='"+ this.p1.bounds.x +"' y='"+ this.p1.bounds.y + "' w='" + this.p1.bounds.width + "' h='" +this.p1.bounds.height + "' classe='" + this.propriedades["classe"] + "'>\n" +
                "</Duplicate> \n";
        return xml;
    };
	
		//novo GETs
	this.component.getX = function(){
		var x = this.p1.bounds.x;
		
		return x;
	};
	
	this.component.getY = function(){
		var y = this.p1.bounds.y;
		
		return y;
	};
	
	this.component.getWidth = function(){
		var w = this.p1.bounds.width;
		
		return w;
	};
	
	this.component.getHeight = function(){
		var h = this.p1.bounds.height;
		
		return h;
	};
    
    this.posicionaMenu = function(){
		var dados={
			y: 20,
			w: 300,
			h: 100
		};
		this.component.mudaCoisas(dados);
	};
};

//importar Modify
function impModify(idM, textoM, classeM, atributoM, operacaoM, xM, yM, wM, hM){
	
	contador = contador + 1;
	contModify = contModify + 1;

	//rectangulo principal 
	this.p1 = new paper.Path.Rectangle(new paper.Point(xM, yM), new paper.Size(wM, hM));
    this.p1.strokeColor = "black";
    this.p1.name = idM;

	this.p3 = new paper.PointText({		//texto e cor do texto
        content: textoM,		
        fillColor: 'black',
		fontSize: 15
    });
	
	// linha da seta "/"
	this.p2 = new paper.Path();  
	this.p2.add(new paper.Point(this.p1.bounds.x + 10, this.p1.bounds.y + 45));
	this.p2.add(new paper.Point(this.p1.bounds.x + 43.5, this.p1.bounds.y + 15));
	this.p2.strokeColor = "black";
	this.p2.strokeWidth = 2;

	this.p3.point = leftTextos(			//alinhar texto ? esquerda
            this.p1.bounds.width-90, 20,
            this.p1.bounds.x, this.p1.bounds.y,
            this.p3.bounds.width, this.p3.bounds.height
            );
	//tri?ngulo - ponta da seta		
	var center = new paper.Point(this.p1.bounds.x + 45, this.p1.bounds.y + 15);
	var sides = 3;
	var radius = 7;
	this.p4 = new paper.Path.RegularPolygon(center, sides, radius);
	this.p4.fillColor = 'black';	
	this.p4.rotate(45);	
	
	//s?mbolo "~"
	this.p5 = new paper.PointText(new paper.Point(this.p1.bounds.x + 50, this.p1.bounds.y + 20));		
    this.p5.content = '~';		
    this.p5.fillColor = 'black';
	this.p5.fontSize = 30;
    			
	this.component = new paper.Group([this.p1, this.p3, this.p2, this.p4, this.p5]);
    this.component.data ={
            nome:true,
            texto:true,
            accao:false,
            valores:false,
            selected:false,
            size:0,
			classe: true
    };
	
	this.component.propriedades={
        classe : classeM,
		atributo : " ",
		operacao : operacaoM
        
    };
	
		this.component.mudaCoisas = function(dados){
        this.p1 = this.children[0];
        this.p3 = this.children[1];
		this.p2 = this.children[2];
        this.p4 = this.children[3];
		this.p5 = this.children[4];
				
        if(dados["nome"]) this.p1.name = dados["nome"];
        if(dados["texto"]) this.p3.content = dados["texto"];

        if(dados["x"]) this.p1.bounds.x = dados["x"];
        if(dados["y"]) this.p1.bounds.y = dados["y"];

        if(dados["w"]) this.p1.bounds.width = dados["w"];
        if(dados["h"]) this.p1.bounds.height = dados["h"];
		
		if(dados["classe"]) this.propriedades["classe"] = dados["classe"]; 
		if(dados["atributo"]) this.propriedades["atributo"] = dados["atributo"]; 
		if(dados["operacao"]) this.propriedades["operacao"] = dados["operacao"];
		}; 
		
	this.component.getXML = function(){
        this.p1 = this.children[0];
        this.p3 = this.children[1];
		this.p2 = this.children[2];
        this.p4 = this.children[3];
		this.p5 = this.children[4];
			
		xml = "<CallUpdateOp id='"+ this.p1.name +"' text='" + this.p3.content + "' x='"+ this.p1.bounds.x +"' y='"+ this.p1.bounds.y + "' w='" + this.p1.bounds.width + "' h='" +this.p1.bounds.height + "' classe='" + this.propriedades["classe"] + "' operacao='Update" + /*this.propriedades["operacao"] +*/ "'>\n" +
                "</CallUpdateOp> \n";
        return xml;
    };
	
    this.component.getElement = function(doc){    	
        this.p1 = this.children[0];
        this.p3 = this.children[1];
		this.p2 = this.children[2];
        this.p4 = this.children[3];
		this.p5 = this.children[4];
		
		var element = doc.createElement("CallUpdateOp");
		element.setAttribute("id", this.p1.name);
		element.setAttribute("text", this.p3.content);
		element.setAttribute("x", this.p1.bounds.x);
		element.setAttribute("y", this.p1.bounds.y);
		element.setAttribute("w", this.p1.bounds.width);
		element.setAttribute("h", this.p1.bounds.height);
		element.setAttribute("classe", this.propriedades["classe"]);
		element.setAttribute("operacao", "Update");
        return element;
    };	
	
    var type = TYPES.ACTION_AIO;
	this.component.getType = function(){		
		return type;
	}; 
		
	//novo GETs
	this.component.getX = function(){
		var x = this.p1.bounds.x;
		
		return x;
	};
	
	this.component.getY = function(){
		var y = this.p1.bounds.y;
		
		return y;
	};
	
	this.component.getWidth = function(){
		var w = this.p1.bounds.width;
		
		return w;
	};
	
	this.component.getHeight = function(){
		var h = this.p1.bounds.height;
		
		return h;
	};
    
    this.posicionaMenu = function(){
		var dados={
			y: 20,
			w: 300,
			h: 100
		};
		this.component.mudaCoisas(dados);
	};
};

//importar Modify
function impModify2(idM, textoM, classeM, atributoM, operacaoM, xM, yM, wM, hM){
	
	contador = contador + 1;
	contModify = contModify + 1;

	//rectangulo principal 
	this.p1 = new paper.Path.Rectangle(new paper.Point(xM, yM), new paper.Size(wM, hM));
    this.p1.strokeColor = "black";
    this.p1.name = idM;

	this.p3 = new paper.PointText({		//texto e cor do texto
        content: textoM,		
        fillColor: 'black',
		fontSize: 15
    });
	
	// linha da seta "/"
	this.p2 = new paper.Path();  
	this.p2.add(new paper.Point(this.p1.bounds.x + 10, this.p1.bounds.y + 45));
	this.p2.add(new paper.Point(this.p1.bounds.x + 43.5, this.p1.bounds.y + 15));
	this.p2.strokeColor = "black";
	this.p2.strokeWidth = 2;

	this.p3.point = leftTextos(			//alinhar texto ? esquerda
            this.p1.bounds.width-90, 20,
            this.p1.bounds.x, this.p1.bounds.y,
            this.p3.bounds.width, this.p3.bounds.height
            );
	//tri?ngulo - ponta da seta		
	var center = new paper.Point(this.p1.bounds.x + 45, this.p1.bounds.y + 15);
	var sides = 3;
	var radius = 7;
	this.p4 = new paper.Path.RegularPolygon(center, sides, radius);
	this.p4.fillColor = 'black';	
	this.p4.rotate(45);	
	
	//s?mbolo "~"
	this.p5 = new paper.PointText(new paper.Point(this.p1.bounds.x + 50, this.p1.bounds.y + 20));		
    this.p5.content = '~';		
    this.p5.fillColor = 'black';
	this.p5.fontSize = 30;
    			
	this.component = new paper.Group([this.p1, this.p3, this.p2, this.p4, this.p5]);
    this.component.data ={
            nome:true,
            texto:true,
            accao:false,
            valores:false,
            selected:false,
            size:0,
			classe: true
    };
	
	this.component.propriedades={
        classe : classeM,
		atributo : " ",
		operacao : operacaoM
        
    };
	
		this.component.mudaCoisas = function(dados){
        this.p1 = this.children[0];
        this.p3 = this.children[1];
		this.p2 = this.children[2];
        this.p4 = this.children[3];
		this.p5 = this.children[4];
				
        if(dados["nome"]) this.p1.name = dados["nome"];
        if(dados["texto"]) this.p3.content = dados["texto"];

        if(dados["x"]) this.p1.bounds.x = dados["x"];
        if(dados["y"]) this.p1.bounds.y = dados["y"];

        if(dados["w"]) this.p1.bounds.width = dados["w"];
        if(dados["h"]) this.p1.bounds.height = dados["h"];
		
		if(dados["classe"]) this.propriedades["classe"] = dados["classe"]; 
		if(dados["atributo"]) this.propriedades["atributo"] = dados["atributo"]; 
		if(dados["operacao"]) this.propriedades["operacao"] = dados["operacao"];
		}; 
		
	this.component.getXML = function(){
        this.p1 = this.children[0];
        this.p3 = this.children[1];
		this.p2 = this.children[2];
        this.p4 = this.children[3];
		this.p5 = this.children[4];
			
		xml = "<CallLinkOp id='"+ this.p1.name +"' text='" + this.p3.content + "' x='"+ this.p1.bounds.x +"' y='"+ this.p1.bounds.y + "' w='" + this.p1.bounds.width + "' h='" +this.p1.bounds.height + "' classe='" + this.propriedades["classe"] + "' operacao='Link" + /*this.propriedades["operacao"] +*/ "'>\n" +
                "</CallLinkOp> \n";
        return xml;
    };
	
    this.component.getElement = function(doc){    	
        this.p1 = this.children[0];
        this.p3 = this.children[1];
		this.p2 = this.children[2];
        this.p4 = this.children[3];
		this.p5 = this.children[4];
		
		var element = doc.createElement("CallLinkOp");
		element.setAttribute("id", this.p1.name);
		element.setAttribute("text", this.p3.content);
		element.setAttribute("x", this.p1.bounds.x);
		element.setAttribute("y", this.p1.bounds.y);
		element.setAttribute("w", this.p1.bounds.width);
		element.setAttribute("h", this.p1.bounds.height);
		element.setAttribute("classe", this.propriedades["classe"]);
		element.setAttribute("operacao", "Link");
        return element;
    };	
	
    var type = TYPES.ACTION_AIO;
	this.component.getType = function(){		
		return type;
	};
		
	//novo GETs
	this.component.getX = function(){
		var x = this.p1.bounds.x;
		
		return x;
	};
	
	this.component.getY = function(){
		var y = this.p1.bounds.y;
		
		return y;
	};
	
	this.component.getWidth = function(){
		var w = this.p1.bounds.width;
		
		return w;
	};
	
	this.component.getHeight = function(){
		var h = this.p1.bounds.height;
		
		return h;
	};
    
    this.posicionaMenu = function(){
		var dados={
			y: 20,
			w: 300,
			h: 100
		};
		this.component.mudaCoisas(dados);
	};
};

//importar Modify
function impModify3(idM, textoM, classeM, atributoM, operacaoM, xM, yM, wM, hM){
	
	contador = contador + 1;
	contModify = contModify + 1;

	//rectangulo principal 
	this.p1 = new paper.Path.Rectangle(new paper.Point(xM, yM), new paper.Size(wM, hM));
    this.p1.strokeColor = "black";
    this.p1.name = idM;

	this.p3 = new paper.PointText({		//texto e cor do texto
        content: textoM,		
        fillColor: 'black',
		fontSize: 15
    });
	
	// linha da seta "/"
	this.p2 = new paper.Path();  
	this.p2.add(new paper.Point(this.p1.bounds.x + 10, this.p1.bounds.y + 45));
	this.p2.add(new paper.Point(this.p1.bounds.x + 43.5, this.p1.bounds.y + 15));
	this.p2.strokeColor = "black";
	this.p2.strokeWidth = 2;

	this.p3.point = leftTextos(			//alinhar texto ? esquerda
            this.p1.bounds.width-90, 20,
            this.p1.bounds.x, this.p1.bounds.y,
            this.p3.bounds.width, this.p3.bounds.height
            );
	//tri?ngulo - ponta da seta		
	var center = new paper.Point(this.p1.bounds.x + 45, this.p1.bounds.y + 15);
	var sides = 3;
	var radius = 7;
	this.p4 = new paper.Path.RegularPolygon(center, sides, radius);
	this.p4.fillColor = 'black';	
	this.p4.rotate(45);	
	
	//s?mbolo "~"
	this.p5 = new paper.PointText(new paper.Point(this.p1.bounds.x + 50, this.p1.bounds.y + 20));		
    this.p5.content = '~';		
    this.p5.fillColor = 'black';
	this.p5.fontSize = 30;
    			
	this.component = new paper.Group([this.p1, this.p3, this.p2, this.p4, this.p5]);
    this.component.data ={
            nome:true,
            texto:true,
            accao:false,
            valores:false,
            selected:false,
            size:0,
			classe: true
    };
	
	this.component.propriedades={
        classe : classeM,
		atributo : " ",
		operacao : operacaoM
        
    };
	
		this.component.mudaCoisas = function(dados){
        this.p1 = this.children[0];
        this.p3 = this.children[1];
		this.p2 = this.children[2];
        this.p4 = this.children[3];
		this.p5 = this.children[4];
				
        if(dados["nome"]) this.p1.name = dados["nome"];
        if(dados["texto"]) this.p3.content = dados["texto"];

        if(dados["x"]) this.p1.bounds.x = dados["x"];
        if(dados["y"]) this.p1.bounds.y = dados["y"];

        if(dados["w"]) this.p1.bounds.width = dados["w"];
        if(dados["h"]) this.p1.bounds.height = dados["h"];
		
		if(dados["classe"]) this.propriedades["classe"] = dados["classe"]; 
		if(dados["atributo"]) this.propriedades["atributo"] = dados["atributo"]; 
		if(dados["operacao"]) this.propriedades["operacao"] = dados["operacao"];
		}; 
		
	this.component.getXML = function(){
        this.p1 = this.children[0];
        this.p3 = this.children[1];
		this.p2 = this.children[2];
        this.p4 = this.children[3];
		this.p5 = this.children[4];
			
		xml = "<CallUnlinkOp id='"+ this.p1.name +"' text='" + this.p3.content + "' x='"+ this.p1.bounds.x +"' y='"+ this.p1.bounds.y + "' w='" + this.p1.bounds.width + "' h='" +this.p1.bounds.height + "' classe='" + this.propriedades["classe"] + "' operacao='Unlink" + /*this.propriedades["operacao"] + */"'>\n" +
                "</CallUnlinkOp> \n";
        return xml;
    };
		
    this.component.getElement = function(doc){    	
        this.p1 = this.children[0];
        this.p3 = this.children[1];
		this.p2 = this.children[2];
        this.p4 = this.children[3];
		this.p5 = this.children[4];
		
		var element = doc.createElement("CallUnlinkOp");
		element.setAttribute("id", this.p1.name);
		element.setAttribute("text", this.p3.content);
		element.setAttribute("x", this.p1.bounds.x);
		element.setAttribute("y", this.p1.bounds.y);
		element.setAttribute("w", this.p1.bounds.width);
		element.setAttribute("h", this.p1.bounds.height);
		element.setAttribute("classe", this.propriedades["classe"]);
		element.setAttribute("operacao", "Unlink");
        return element;
    };	
	
    var type = TYPES.ACTION_AIO;
	this.component.getType = function(){		
		return type;
	};  
			
	//novo GETs
	this.component.getX = function(){
		var x = this.p1.bounds.x;
		
		return x;
	};
	
	this.component.getY = function(){
		var y = this.p1.bounds.y;
		
		return y;
	};
	
	this.component.getWidth = function(){
		var w = this.p1.bounds.width;
		
		return w;
	};
	
	this.component.getHeight = function(){
		var h = this.p1.bounds.height;
		
		return h;
	};
    
    this.posicionaMenu = function(){
		var dados={
			y: 20,
			w: 300,
			h: 100
		};
		this.component.mudaCoisas(dados);
	};
};

var myMove = function(){
	contador = contador + 1;
	contMove = contMove + 1;
	
	//rectangulo principal 
	this.p1 = new paper.Path.Rectangle(new paper.Point(200, 100), new paper.Size(200, 60));
    this.p1.strokeColor = "black";
    this.p1.name = "move" + contMove;

	this.p3 = new paper.PointText({		//texto e cor do texto
        content: 'Move',		
        fillColor: 'black',
		fontSize: 15
    });
	
	// linha da seta "/"
	this.p2 = new paper.Path();  
	this.p2.add(new paper.Point(this.p1.bounds.x + 10, this.p1.bounds.y + 45));
	this.p2.add(new paper.Point(this.p1.bounds.x + 43.5, this.p1.bounds.y + 15));
	this.p2.strokeColor = "black";
	this.p2.strokeWidth = 2;

	this.p3.point = leftTextos(			//alinhar texto ? esquerda
            this.p1.bounds.width-90, 20,
            this.p1.bounds.x, this.p1.bounds.y,
            this.p3.bounds.width, this.p3.bounds.height
            );
			
	//tri?ngulo - ponta da seta		
	var center = new paper.Point(this.p1.bounds.x + 45, this.p1.bounds.y + 15);
	var sides = 3;
	var radius = 7;
	this.p4 = new paper.Path.RegularPolygon(center, sides, radius);
	this.p4.fillColor = 'black';	
	this.p4.rotate(45);	
	this.p4.name = "move_symbol";
	
	// linha da seta "-" 2
	this.p5 = new paper.Path();  
	this.p5.add(new paper.Point(this.p1.bounds.x + 50, this.p1.bounds.y + 10));
	this.p5.add(new paper.Point(this.p1.bounds.x + 65, this.p1.bounds.y + 10));
	this.p5.strokeColor = "black";
	this.p5.strokeWidth = 3;
	
	//tri?ngulo - ponta da seta 2
	var center2 = new paper.Point(this.p1.bounds.x + 65, this.p1.bounds.y + 11);
	var sides2 = 3;
	var radius2 = 5;
	this.p6 = new paper.Path.RegularPolygon(center2, sides2, radius2);
	this.p6.fillColor = 'black';	
	this.p6.rotate(90);
	
    this.component = new paper.Group([this.p1, this.p3, this.p2, this.p4, this.p5, this.p6]);
    this.component.data ={
            nome:true,
            texto:true,
            size:0,
			classe: true
    };
	
	this.component.propriedades={
        classe : ""
        
    };
	
		this.component.mudaCoisas = function(dados){
        this.p1 = this.children[0];
        this.p3 = this.children[1];
		this.p2 = this.children[2];
        this.p4 = this.children[3];
		this.p5 = this.children[4];
		this.p6 = this.children[5];
				
        if(dados["nome"]) this.p1.name = dados["nome"];
        if(dados["texto"]) this.p3.content = dados["texto"];

        if(dados["x"]) this.p1.bounds.x = dados["x"];
        if(dados["y"]) this.p1.bounds.y = dados["y"];

        if(dados["w"]) this.p1.bounds.width = dados["w"];
        if(dados["h"]) this.p1.bounds.height = dados["h"];
		
		if(dados["classe"]) this.propriedades["classe"] = dados["classe"]; 
		}; 
		
	this.component.getXML = function(){
        this.p1 = this.children[0];
        this.p3 = this.children[1];
		this.p2 = this.children[2];
        this.p4 = this.children[3];
		this.p5 = this.children[4];
		this.p6 = this.children[5];
			
		xml = "<Move id='"+ this.p1.name +"' text='" + this.p3.content + "' x='"+ this.p1.bounds.x +"' y='"+ this.p1.bounds.y + "' w='" + this.p1.bounds.width + "' h='" +this.p1.bounds.height + "' classe='" + this.propriedades["classe"] + "'>\n" +
                "</Move> \n";
        return xml;
    };
	
		//novo GETs
	this.component.getX = function(){
		var x = this.p1.bounds.x;
		
		return x;
	};
	
	this.component.getY = function(){
		var y = this.p1.bounds.y;
		
		return y;
	};
	
	this.component.getWidth = function(){
		var w = this.p1.bounds.width;
		
		return w;
	};
	
	this.component.getHeight = function(){
		var h = this.p1.bounds.height;
		
		return h;
	};
	
	//NOVO 08-04-2015
	this.component.getTipo = function(){
		var t = this.p4.name;
		
		return t;
	};
    
    this.posicionaMenu = function(){
		var dados={
			y: 20,
			w: 300,
			h: 100
		};
		this.component.mudaCoisas(dados);
	};	
};

//importar Move
function impMove(idMV, textoMV, classeMV, xMV, yMV, wMV, hMV){
	contador = contador + 1;
	contMove = contMove + 1;
	
	//rectangulo principal 
	this.p1 = new paper.Path.Rectangle(new paper.Point(xMV, yMV), new paper.Size(wMV, hMV));
    this.p1.strokeColor = "black";
    this.p1.name = idMV;

	this.p3 = new paper.PointText({		//texto e cor do texto
        content: textoMV,		
        fillColor: 'black',
		fontSize: 15
    });
	
	// linha da seta "/"
	this.p2 = new paper.Path();  
	this.p2.add(new paper.Point(this.p1.bounds.x + 10, this.p1.bounds.y + 45));
	this.p2.add(new paper.Point(this.p1.bounds.x + 43.5, this.p1.bounds.y + 15));
	this.p2.strokeColor = "black";
	this.p2.strokeWidth = 2;

	this.p3.point = leftTextos(			//alinhar texto ? esquerda
            this.p1.bounds.width-90, 20,
            this.p1.bounds.x, this.p1.bounds.y,
            this.p3.bounds.width, this.p3.bounds.height
            );
			
	//tri?ngulo - ponta da seta		
	var center = new paper.Point(this.p1.bounds.x + 45, this.p1.bounds.y + 15);
	var sides = 3;
	var radius = 7;
	this.p4 = new paper.Path.RegularPolygon(center, sides, radius);
	this.p4.fillColor = 'black';	
	this.p4.rotate(45);	
	
	// linha da seta "-" 2
	this.p5 = new paper.Path();  
	this.p5.add(new paper.Point(this.p1.bounds.x + 50, this.p1.bounds.y + 10));
	this.p5.add(new paper.Point(this.p1.bounds.x + 65, this.p1.bounds.y + 10));
	this.p5.strokeColor = "black";
	this.p5.strokeWidth = 3;
	
	//tri?ngulo - ponta da seta 2
	var center2 = new paper.Point(this.p1.bounds.x + 65, this.p1.bounds.y + 11);
	var sides2 = 3;
	var radius2 = 5;
	this.p6 = new paper.Path.RegularPolygon(center2, sides2, radius2);
	this.p6.fillColor = 'black';	
	this.p6.rotate(90);
	
    this.component = new paper.Group([this.p1, this.p3, this.p2, this.p4, this.p5, this.p6]);
    this.component.data ={
            nome:true,
            texto:true,
            size:0,
			classe: true
    };
	
	this.component.propriedades={
        classe : classeMV
        
    };
	
		this.component.mudaCoisas = function(dados){
        this.p1 = this.children[0];
        this.p3 = this.children[1];
		this.p2 = this.children[2];
        this.p4 = this.children[3];
		this.p5 = this.children[4];
		this.p6 = this.children[5];
				
        if(dados["nome"]) this.p1.name = dados["nome"];
        if(dados["texto"]) this.p3.content = dados["texto"];

        if(dados["x"]) this.p1.bounds.x = dados["x"];
        if(dados["y"]) this.p1.bounds.y = dados["y"];

        if(dados["w"]) this.p1.bounds.width = dados["w"];
        if(dados["h"]) this.p1.bounds.height = dados["h"];
		
		if(dados["classe"]) this.propriedades["classe"] = dados["classe"]; 
		}; 
		
	this.component.getXML = function(){
        this.p1 = this.children[0];
        this.p3 = this.children[1];
		this.p2 = this.children[2];
        this.p4 = this.children[3];
		this.p5 = this.children[4];
		this.p6 = this.children[5];
			
		xml = "<Move id='"+ this.p1.name +"' text='" + this.p3.content + "' x='"+ this.p1.bounds.x +"' y='"+ this.p1.bounds.y + "' w='" + this.p1.bounds.width + "' h='" +this.p1.bounds.height + "' classe='" + this.propriedades["classe"] + "'>\n" +
                "</Move> \n";
        return xml;
    };
	
	//novo GETs
	this.component.getX = function(){
		var x = this.p1.bounds.x;
		
		return x;
	};
	
	this.component.getY = function(){
		var y = this.p1.bounds.y;
		
		return y;
	};
	
	this.component.getWidth = function(){
		var w = this.p1.bounds.width;
		
		return w;
	};
	
	this.component.getHeight = function(){
		var h = this.p1.bounds.height;
		
		return h;
	};
    
    this.posicionaMenu = function(){
		var dados={
			y: 20,
			w: 300,
			h: 100
		};
		this.component.mudaCoisas(dados);
	};	
};

//importar Perform
function impPerform(idP, textoP, classeP, atributoP, operacaoP, xP, yP, wP, hP){
	contador = contador + 1;
	contPerform = contPerform +1;

	//rectangulo principal 
	this.p1 = new paper.Path.Rectangle(new paper.Point(xP, yP), new paper.Size(wP, hP));
    this.p1.strokeColor = "black";
    this.p1.name = idP;

	this.p3 = new paper.PointText({		//texto e cor do texto
        content: textoP,		
        fillColor: 'black',
		fontSize: 15
    });

	// linha da seta "/"
	this.p2 = new paper.Path();  
	this.p2.add(new paper.Point(this.p1.bounds.x + 10, this.p1.bounds.y + 45));
	this.p2.add(new paper.Point(this.p1.bounds.x + 43.5, this.p1.bounds.y + 15));
	this.p2.strokeColor = "black";
	this.p2.strokeWidth = 2;

	this.p3.point = leftTextos(			//alinhar texto ? esquerda
            this.p1.bounds.width-90, 20,
            this.p1.bounds.x, this.p1.bounds.y,
            this.p3.bounds.width, this.p3.bounds.height
            );
			
	//tri?ngulo - ponta da seta		
	var center = new paper.Point(this.p1.bounds.x + 45, this.p1.bounds.y + 15);
	var sides = 3;
	var radius = 7;
	this.p4 = new paper.Path.RegularPolygon(center, sides, radius);
	this.p4.fillColor = 'black';	
	this.p4.rotate(45);	
	
	//tri?ngulo - ponta da seta 2
	var center2 = new paper.Point(this.p1.bounds.x + 11, this.p1.bounds.y + 47);
	var sides2 = 3;
	var radius2 = 7;
	this.p5 = new paper.Path.RegularPolygon(center2, sides2, radius2);
	this.p5.fillColor = 'black';	
	this.p5.rotate(117);
	
    this.component = new paper.Group([this.p1, this.p3, this.p2, this.p4, this.p5]);
    this.component.data ={
            nome:true,
            texto:true,
            size:0,
			classe: true
    };
	
	this.component.propriedades={
        classe : classeP,
		atributo : " ",
		operacao : operacaoP
        
    };
	
		this.component.mudaCoisas = function(dados){
        this.p1 = this.children[0];
        this.p3 = this.children[1];
		this.p2 = this.children[2];
        this.p4 = this.children[3];
		this.p5 = this.children[4];
				
        if(dados["nome"]) this.p1.name = dados["nome"];
        if(dados["texto"]) this.p3.content = dados["texto"];

        if(dados["x"]) this.p1.bounds.x = dados["x"];
        if(dados["y"]) this.p1.bounds.y = dados["y"];

        if(dados["w"]) this.p1.bounds.width = dados["w"];
        if(dados["h"]) this.p1.bounds.height = dados["h"];
		
		if(dados["classe"]) this.propriedades["classe"] = dados["classe"]; 
		if(dados["atributo"]) this.propriedades["atributo"] = dados["atributo"]; 
		if(dados["operacao"]) this.propriedades["operacao"] = dados["operacao"];
		}; 
		
	this.component.getXML = function(){
        this.p1 = this.children[0];
        this.p3 = this.children[1];
		this.p2 = this.children[2];
        this.p4 = this.children[3];
		this.p5 = this.children[4];
			
		xml = "<CallOp id='"+ this.p1.name +"' text='" + this.p3.content + "' x='"+ this.p1.bounds.x +"' y='"+ this.p1.bounds.y + "' w='" + this.p1.bounds.width + "' h='" +this.p1.bounds.height + "' classe='" + this.propriedades["classe"] + "' operacao='User Defined" + /*this.propriedades["operacao"] +*/ "'>\n" +
                "</CallOp> \n";
        return xml;
    };
	
    this.component.getElement = function(doc){    	
        this.p1 = this.children[0];
        this.p3 = this.children[1];
		this.p2 = this.children[2];
        this.p4 = this.children[3];
		this.p5 = this.children[4];
		
		var element = doc.createElement("CallOp");
		element.setAttribute("id", this.p1.name);
		element.setAttribute("text", this.p3.content);
		element.setAttribute("x", this.p1.bounds.x);
		element.setAttribute("y", this.p1.bounds.y);
		element.setAttribute("w", this.p1.bounds.width);
		element.setAttribute("h", this.p1.bounds.height);
		element.setAttribute("classe", this.propriedades["classe"]);
		element.setAttribute("operacao", "User Defined");
        return element;
    };	
	
    var type = TYPES.ACTION_AIO;
	this.component.getType = function(){		
		return type;
	};
	
	//novo GETs
	this.component.getX = function(){
		var x = this.p1.bounds.x;
		
		return x;
	};
	
	this.component.getY = function(){
		var y = this.p1.bounds.y;
		
		return y;
	};
	
	this.component.getWidth = function(){
		var w = this.p1.bounds.width;
		
		return w;
	};
	
	this.component.getHeight = function(){
		var h = this.p1.bounds.height;
		
		return h;
	};
    
    this.posicionaMenu = function(){
		var dados={
			y: 20,
			w: 300,
			h: 100
		};
		this.component.mudaCoisas(dados);
	};
};

//importar Select
function impSelect(idS, textoS, classeS, atributoS, xS, yS, wS, hS){
	contador = contador + 1;
	contSelect = contSelect + 1;

	//rectangulo principal 
	this.p1 = new paper.Path.Rectangle(new paper.Point(xS, yS), new paper.Size(wS, hS));
    this.p1.strokeColor = "black";
    this.p1.name = idS;

	this.p3 = new paper.PointText({		//texto e cor do texto
        content: textoS,		
        fillColor: 'black',
		fontSize: 15
    });

	// linha da seta "/"
	this.p2 = new paper.Path();  
	this.p2.add(new paper.Point(this.p1.bounds.x + 10, this.p1.bounds.y + 45));
	this.p2.add(new paper.Point(this.p1.bounds.x + 43.5, this.p1.bounds.y + 15));
	this.p2.strokeColor = "black";
	this.p2.strokeWidth = 2;

	this.p3.point = leftTextos(			//alinhar texto ? esquerda
            this.p1.bounds.width-90, 20,
            this.p1.bounds.x, this.p1.bounds.y,
            this.p3.bounds.width, this.p3.bounds.height
            );
			
	//tri?ngulo - ponta da seta		
	var center = new paper.Point(this.p1.bounds.x + 45, this.p1.bounds.y + 15);
	var sides = 3;
	var radius = 7;
	this.p4 = new paper.Path.RegularPolygon(center, sides, radius);
	this.p4.fillColor = 'black';	
	this.p4.rotate(45);	
	
	// linha "-" 2
	this.p5 = new paper.Path();  
	this.p5.add(new paper.Point(this.p1.bounds.x + 50, this.p1.bounds.y + 10));
	this.p5.add(new paper.Point(this.p1.bounds.x + 75, this.p1.bounds.y + 10));
	this.p5.strokeColor = "black";
	this.p5.strokeWidth = 3;
		
    this.component = new paper.Group([this.p1, this.p3, this.p2, this.p4, this.p5]);
    this.component.data ={
            nome:true,
            texto:true,
            size:0,
			classe: true
    };
	
	this.component.propriedades={
        classe : classeS,
		atributo : " "
        
    };
	
		this.component.mudaCoisas = function(dados){
        this.p1 = this.children[0];
        this.p3 = this.children[1];
		this.p2 = this.children[2];
        this.p4 = this.children[3];
		this.p5 = this.children[4];
				
        if(dados["nome"]) this.p1.name = dados["nome"];
        if(dados["texto"]) this.p3.content = dados["texto"];

        if(dados["x"]) this.p1.bounds.x = dados["x"];
        if(dados["y"]) this.p1.bounds.y = dados["y"];

        if(dados["w"]) this.p1.bounds.width = dados["w"];
        if(dados["h"]) this.p1.bounds.height = dados["h"];
		
		if(dados["classe"]) this.propriedades["classe"] = dados["classe"]; 
		if(dados["atributo"]) this.propriedades["atributo"] = dados["atributo"]; 
		}; 
		
	this.component.getXML = function(){
        this.p1 = this.children[0];
        this.p3 = this.children[1];
		this.p2 = this.children[2];
        this.p4 = this.children[3];
		this.p5 = this.children[4];
			
		xml = "<SelectOKOp id='"+ this.p1.name +"' text='" + this.p3.content + "' x='"+ this.p1.bounds.x +"' y='"+ this.p1.bounds.y + "' w='" + this.p1.bounds.width + "' h='" +this.p1.bounds.height + "' classe='" + this.propriedades["classe"] + "'>\n" +
                "</SelectOKOp> \n";
        return xml;
    };
	
    this.component.getElement = function(doc){    	
        this.p1 = this.children[0];
        this.p3 = this.children[1];
		this.p2 = this.children[2];
        this.p4 = this.children[3];
		this.p5 = this.children[4];
		
		var element = doc.createElement("SelectOKOp");
		element.setAttribute("id", this.p1.name);
		element.setAttribute("text", this.p3.content);
		element.setAttribute("x", this.p1.bounds.x);
		element.setAttribute("y", this.p1.bounds.y);
		element.setAttribute("w", this.p1.bounds.width);
		element.setAttribute("h", this.p1.bounds.height);
		element.setAttribute("classe", this.propriedades["classe"]);
        return element;
    };	
	
    var type = TYPES.ACTION_AIO;
	this.component.getType = function(){		
		return type;
	};	
	
	//novo GETs
	this.component.getX = function(){
		var x = this.p1.bounds.x;
		
		return x;
	};
	
	this.component.getY = function(){
		var y = this.p1.bounds.y;
		
		return y;
	};
	
	this.component.getWidth = function(){
		var w = this.p1.bounds.width;
		
		return w;
	};
	
	this.component.getHeight = function(){
		var h = this.p1.bounds.height;
		
		return h;
	};
    
    this.posicionaMenu = function(){
		var dados={
			y: 20,
			w: 300,
			h: 100
		};
		this.component.mudaCoisas(dados);
	};
};

//importar MENUITEM StartGoTo
function impStartGoTo(idSGT, textoSGT, classeSGT, atributoSGT, xSGT, ySGT, wSGT, hSGT, targetSGT){	
	var target = targetSGT; // The target of the Menu Itemp
	contador = contador + 1;
	contStartGoTo = contStartGoTo +1;
	
	//rectangulo principal 
	this.p1 = new paper.Path.Rectangle(new paper.Point(xSGT, ySGT), new paper.Size(wSGT, hSGT));
    this.p1.strokeColor = "black";
    this.p1.name = idSGT;

	this.p3 = new paper.PointText({		//texto e cor do texto
        content: textoSGT,		
        fillColor: 'black',
		fontSize: 15
    });
	
	// linha da seta "/"
	this.p2 = new paper.Path();  
	this.p2.add(new paper.Point(this.p1.bounds.x + 10, this.p1.bounds.y + 45));
	this.p2.add(new paper.Point(this.p1.bounds.x + 43.5, this.p1.bounds.y + 15));
	this.p2.strokeColor = "black";
	this.p2.strokeWidth = 2;

	this.p3.point = leftTextos(			//alinhar texto ? esquerda
            this.p1.bounds.width-90, 20,
            this.p1.bounds.x, this.p1.bounds.y,
            this.p3.bounds.width, this.p3.bounds.height
            );
	//triangulo - ponta da seta		
	var center = new paper.Point(this.p1.bounds.x + 45, this.p1.bounds.y + 15);
	var sides = 3;
	var radius = 7;
	this.p4 = new paper.Path.RegularPolygon(center, sides, radius);
	this.p4.fillColor = 'black';	
	this.p4.rotate(45);	
	
	//circulo
	var center = new paper.Point(this.p1.bounds.x + 60, this.p1.bounds.y + 10);
	//var points = 5;
	var radius = 5;
	//var radius2 = 7;
	this.p5 = new paper.Path.Circle(center, radius);
	this.p5.fillColor = 'black';
	
			
	this.component = new paper.Group([this.p1, this.p3, this.p2, this.p4, this.p5]);
    this.component.data ={
            nome:true,
            texto:true,
            accao:false,
            valores:false,
            selected:false,
            size:0,
			classe: true
    };
	
	this.component.propriedades={
        classe : classeSGT,
		atributo : " "
        
    };
	
		this.component.mudaCoisas = function(dados){
        this.p1 = this.children[0];
        this.p3 = this.children[1];
		this.p2 = this.children[2];
        this.p4 = this.children[3];
		this.p5 = this.children[4];
		
		if(dados["target"]) target = dados["target"];		
        if(dados["nome"]) this.p1.name = dados["nome"];
        if(dados["texto"]) this.p3.content = dados["texto"];

        if(dados["x"]) this.p1.bounds.x = dados["x"];
        if(dados["y"]) this.p1.bounds.y = dados["y"];

        if(dados["w"]) this.p1.bounds.width = dados["w"];
        if(dados["h"]) this.p1.bounds.height = dados["h"];
		
		if(dados["classe"]) this.propriedades["classe"] = dados["classe"]; 
		if(dados["atributo"]) this.propriedades["atributo"] = dados["atributo"]; 
		}; 
		
	this.component.getXML = function(){
        this.p1 = this.children[0];
        this.p3 = this.children[1];
		this.p2 = this.children[2];
        this.p4 = this.children[3];
		this.p5 = this.children[4];
			
		xml = "<MenuItem id='"+ this.p1.name +"' text='" + this.p3.content + "' x='"+ this.p1.bounds.x +"' y='"+ this.p1.bounds.y + "' w='" + this.p1.bounds.width + "' h='" +this.p1.bounds.height + "' classe='" + this.propriedades["classe"] + "'>\n" +
                "</MenuItem> \n";
        return xml;
    };
	
    this.component.getElement = function(doc){    	
        this.p1 = this.children[0];
        this.p3 = this.children[1];
		this.p2 = this.children[2];
        this.p4 = this.children[3];
		this.p5 = this.children[4];
		
		var element = doc.createElement("MenuItem");
		element.setAttribute("id", this.p1.name);
		element.setAttribute("text", this.p3.content);
		element.setAttribute("x", this.p1.bounds.x);
		element.setAttribute("y", this.p1.bounds.y);
		element.setAttribute("w", this.p1.bounds.width);
		element.setAttribute("h", this.p1.bounds.height);
		element.setAttribute("classe", this.propriedades["classe"]);
		element.setAttribute("target", target);
        return element;
    };	
	
    var type = TYPES.MENU_ITEM;
	this.component.getType = function(){		
		return type;
	};
	
	this.component.getTarget = function(){		
		return target;
	}; 		
	
	//novo GETs
	this.component.getX = function(){
		var x = this.p1.bounds.x;
		
		return x;
	};
	
	this.component.getY = function(){
		var y = this.p1.bounds.y;
		
		return y;
	};
	
	this.component.getWidth = function(){
		var w = this.p1.bounds.width;
		
		return w;
	};
	
	this.component.getHeight = function(){
		var h = this.p1.bounds.height;
		
		return h;
	};
    
    this.posicionaMenu = function(){
		var dados={
			y: 20,
			w: 300,
			h: 100
		};
		this.component.mudaCoisas(dados);
	};
};

//importar StartGoTo
function impStartGoTo2(idSGT, textoSGT, classeSGT, atributoSGT, xSGT, ySGT, wSGT, hSGT, targetSGT){
	var target = targetSGT;
	contador = contador + 1;
	contStartGoTo = contStartGoTo +1;
	
	//rectangulo principal 
	this.p1 = new paper.Path.Rectangle(new paper.Point(xSGT, ySGT), new paper.Size(wSGT, hSGT));
    this.p1.strokeColor = "black";
    this.p1.name = idSGT;

	this.p3 = new paper.PointText({		//texto e cor do texto
        content: textoSGT,		
        fillColor: 'black',
		fontSize: 15
    });
	
	// linha da seta "/"
	this.p2 = new paper.Path();  
	this.p2.add(new paper.Point(this.p1.bounds.x + 10, this.p1.bounds.y + 45));
	this.p2.add(new paper.Point(this.p1.bounds.x + 43.5, this.p1.bounds.y + 15));
	this.p2.strokeColor = "black";
	this.p2.strokeWidth = 2;

	this.p3.point = leftTextos(			//alinhar texto ? esquerda
            this.p1.bounds.width-90, 20,
            this.p1.bounds.x, this.p1.bounds.y,
            this.p3.bounds.width, this.p3.bounds.height
            );
	//tri?ngulo - ponta da seta		
	var center = new paper.Point(this.p1.bounds.x + 45, this.p1.bounds.y + 15);
	var sides = 3;
	var radius = 7;
	this.p4 = new paper.Path.RegularPolygon(center, sides, radius);
	this.p4.fillColor = 'black';	
	this.p4.rotate(45);	
	
	//circulo
	var center = new paper.Point(this.p1.bounds.x + 60, this.p1.bounds.y + 10);
	//var points = 5;
	var radius = 5;
	//var radius2 = 7;
	this.p5 = new paper.Path.Circle(center, radius);
	this.p5.fillColor = 'black';
	
			
	this.component = new paper.Group([this.p1, this.p3, this.p2, this.p4, this.p5]);
    this.component.data ={
            nome:true,
            texto:true,
            accao:false,
            valores:false,
            selected:false,
            size:0,
			classe: true
    };
	
	this.component.propriedades={
        classe : classeSGT,
		atributo : " "
        
    };
	
		this.component.mudaCoisas = function(dados){
        this.p1 = this.children[0];
        this.p3 = this.children[1];
		this.p2 = this.children[2];
        this.p4 = this.children[3];
		this.p5 = this.children[4];
		
		if(dados["target"]) target = dados["target"];
        if(dados["nome"]) this.p1.name = dados["nome"];
        if(dados["texto"]) this.p3.content = dados["texto"];

        if(dados["x"]) this.p1.bounds.x = dados["x"];
        if(dados["y"]) this.p1.bounds.y = dados["y"];

        if(dados["w"]) this.p1.bounds.width = dados["w"];
        if(dados["h"]) this.p1.bounds.height = dados["h"];
		
		if(dados["classe"]) this.propriedades["classe"] = dados["classe"]; 
		if(dados["atributo"]) this.propriedades["atributo"] = dados["atributo"]; 
		}; 
		
	this.component.getXML = function(){
        this.p1 = this.children[0];
        this.p3 = this.children[1];
		this.p2 = this.children[2];
        this.p4 = this.children[3];
		this.p5 = this.children[4];
			
		xml = "<ToCreateInstance id='"+ this.p1.name +"' text='" + this.p3.content + "' x='"+ this.p1.bounds.x +"' y='"+ this.p1.bounds.y + "' w='" + this.p1.bounds.width + "' h='" +this.p1.bounds.height + "' classe='" + this.propriedades["classe"] + "'>\n" +
                "</ToCreateInstance> \n";
        return xml;
    };
	
    this.component.getElement = function(doc){    	
        this.p1 = this.children[0];
        this.p3 = this.children[1];
		this.p2 = this.children[2];
        this.p4 = this.children[3];
		this.p5 = this.children[4];
		
		var element = doc.createElement("ToCreateInstance");
		element.setAttribute("id", this.p1.name);
		element.setAttribute("text", this.p3.content);
		element.setAttribute("x", this.p1.bounds.x);
		element.setAttribute("y", this.p1.bounds.y);
		element.setAttribute("w", this.p1.bounds.width);
		element.setAttribute("h", this.p1.bounds.height);
		element.setAttribute("classe", this.propriedades["classe"]);
		element.setAttribute("target", target);
		
        return element;
    };	
	
    var type = TYPES.ACTION_AIO_TARGET;
	this.component.getType = function(){		
		return type;
	};
	
	this.component.getTarget = function(){		
		return target;
	};	
	
	//novo GETs
	this.component.getX = function(){
		var x = this.p1.bounds.x;
		
		return x;
	};
	
	this.component.getY = function(){
		var y = this.p1.bounds.y;
		
		return y;
	};
	
	this.component.getWidth = function(){
		var w = this.p1.bounds.width;
		
		return w;
	};
	
	this.component.getHeight = function(){
		var h = this.p1.bounds.height;
		
		return h;
	};
    
    this.posicionaMenu = function(){
		var dados={
			y: 20,
			w: 300,
			h: 100
		};
		this.component.mudaCoisas(dados);
	};
};

//importar StartGoTo
function impStartGoTo3(idSGT, textoSGT, classeSGT, atributoSGT, xSGT, ySGT, wSGT, hSGT, targetSGT){
	var target = targetSGT;
	contador = contador + 1;
	contStartGoTo = contStartGoTo +1;
	
	//rectangulo principal 
	this.p1 = new paper.Path.Rectangle(new paper.Point(xSGT, ySGT), new paper.Size(wSGT, hSGT));
    this.p1.strokeColor = "black";
    this.p1.name = idSGT;

	this.p3 = new paper.PointText({		//texto e cor do texto
        content: textoSGT,		
        fillColor: 'black',
		fontSize: 15
    });
	
	// linha da seta "/"
	this.p2 = new paper.Path();  
	this.p2.add(new paper.Point(this.p1.bounds.x + 10, this.p1.bounds.y + 45));
	this.p2.add(new paper.Point(this.p1.bounds.x + 43.5, this.p1.bounds.y + 15));
	this.p2.strokeColor = "black";
	this.p2.strokeWidth = 2;

	this.p3.point = leftTextos(			//alinhar texto ? esquerda
            this.p1.bounds.width-90, 20,
            this.p1.bounds.x, this.p1.bounds.y,
            this.p3.bounds.width, this.p3.bounds.height
            );
	//tri?ngulo - ponta da seta		
	var center = new paper.Point(this.p1.bounds.x + 45, this.p1.bounds.y + 15);
	var sides = 3;
	var radius = 7;
	this.p4 = new paper.Path.RegularPolygon(center, sides, radius);
	this.p4.fillColor = 'black';	
	this.p4.rotate(45);	
	
	//circulo
	var center = new paper.Point(this.p1.bounds.x + 60, this.p1.bounds.y + 10);
	//var points = 5;
	var radius = 5;
	//var radius2 = 7;
	this.p5 = new paper.Path.Circle(center, radius);
	this.p5.fillColor = 'black';
	
			
	this.component = new paper.Group([this.p1, this.p3, this.p2, this.p4, this.p5]);
    this.component.data ={
            nome:true,
            texto:true,
            accao:false,
            valores:false,
            selected:false,
            size:0,
			classe: true
    };
	
	this.component.propriedades={
        classe : classeSGT,
		atributo : " "
        
    };
	
		this.component.mudaCoisas = function(dados){
        this.p1 = this.children[0];
        this.p3 = this.children[1];
		this.p2 = this.children[2];
        this.p4 = this.children[3];
		this.p5 = this.children[4];
		
		if(dados["target"]) target = dados["target"];		
        if(dados["nome"]) this.p1.name = dados["nome"];
        if(dados["texto"]) this.p3.content = dados["texto"];

        if(dados["x"]) this.p1.bounds.x = dados["x"];
        if(dados["y"]) this.p1.bounds.y = dados["y"];

        if(dados["w"]) this.p1.bounds.width = dados["w"];
        if(dados["h"]) this.p1.bounds.height = dados["h"];
		
		if(dados["classe"]) this.propriedades["classe"] = dados["classe"]; 
		if(dados["atributo"]) this.propriedades["atributo"] = dados["atributo"]; 
		}; 
		
	this.component.getXML = function(){
        this.p1 = this.children[0];
        this.p3 = this.children[1];
		this.p2 = this.children[2];
        this.p4 = this.children[3];
		this.p5 = this.children[4];
			
		xml = "<ToUpdateInstance id='"+ this.p1.name +"' text='" + this.p3.content + "' x='"+ this.p1.bounds.x +"' y='"+ this.p1.bounds.y + "' w='" + this.p1.bounds.width + "' h='" +this.p1.bounds.height + "' classe='" + this.propriedades["classe"] + "'>\n" +
                "</ToUpdateInstance> \n";
        return xml;
    };
	
    this.component.getElement = function(doc){    	
        this.p1 = this.children[0];
        this.p3 = this.children[1];
		this.p2 = this.children[2];
        this.p4 = this.children[3];
		this.p5 = this.children[4];
		
		var element = doc.createElement("ToUpdateInstance");
		element.setAttribute("id", this.p1.name);
		element.setAttribute("text", this.p3.content);
		element.setAttribute("x", this.p1.bounds.x);
		element.setAttribute("y", this.p1.bounds.y);
		element.setAttribute("w", this.p1.bounds.width);
		element.setAttribute("h", this.p1.bounds.height);
		element.setAttribute("classe", this.propriedades["classe"]);
		element.setAttribute("target", target);
        return element;
    };	
	
    var type = TYPES.ACTION_AIO_TARGET;
	this.component.getType = function(){		
		return type;
	};
		
	this.component.getTarget = function(){		
		return target;
	};
			
	//novo GETs
	this.component.getX = function(){
		var x = this.p1.bounds.x;
		
		return x;
	};
	
	this.component.getY = function(){
		var y = this.p1.bounds.y;
		
		return y;
	};
	
	this.component.getWidth = function(){
		var w = this.p1.bounds.width;
		
		return w;
	};
	
	this.component.getHeight = function(){
		var h = this.p1.bounds.height;
		
		return h;
	};
    
    this.posicionaMenu = function(){
		var dados={
			y: 20,
			w: 300,
			h: 100
		};
		this.component.mudaCoisas(dados);
	};
};

//importar StopEndComplete
function impStopEndComplete(idSEC, textoSEC, classeSEC, atributoSEC, operacaoSEC, xSEC, ySEC, wSEC, hSEC){
	contador = contador + 1;
	contStopEndComplete = contStopEndComplete + 1;
	
	//rectangulo principal 
	this.p1 = new paper.Path.Rectangle(new paper.Point(xSEC, ySEC), new paper.Size(wSEC, hSEC));
    this.p1.strokeColor = "black";
    this.p1.name = idSEC;

	this.p3 = new paper.PointText({		//texto e cor do texto
        content: textoSEC,		
        fillColor: 'black',
		fontSize: 15
    });

	// linha da seta "/"
	this.p2 = new paper.Path();  
	this.p2.add(new paper.Point(this.p1.bounds.x + 10, this.p1.bounds.y + 45));
	this.p2.add(new paper.Point(this.p1.bounds.x + 43.5, this.p1.bounds.y + 15));
	this.p2.strokeColor = "black";
	this.p2.strokeWidth = 2;

	this.p3.point = leftTextos(			//alinhar texto ? esquerda
            this.p1.bounds.width-90, 20,
            this.p1.bounds.x, this.p1.bounds.y,
            this.p3.bounds.width, this.p3.bounds.height
            );
			
	//tri?ngulo - ponta da seta		
	var center = new paper.Point(this.p1.bounds.x + 45, this.p1.bounds.y + 15);
	var sides = 3;
	var radius = 7;
	this.p4 = new paper.Path.RegularPolygon(center, sides, radius);
	this.p4.fillColor = 'black';	
	this.p4.rotate(45);	
	
	// linha "|" 2
	this.p5 = new paper.Path();  
	this.p5.add(new paper.Point(this.p1.bounds.x + 50, this.p1.bounds.y + 10));
	this.p5.add(new paper.Point(this.p1.bounds.x + 50, this.p1.bounds.y + 40));
	this.p5.strokeColor = "black";
	this.p5.strokeWidth = 2;
		
    this.component = new paper.Group([this.p1, this.p3, this.p2, this.p4, this.p5]);
    this.component.data ={
            nome:true,
            texto:true,
            size:0,
			classe: true
    };
	
	this.component.propriedades={
        classe : classeSEC,
		atributo : " ",
		operacao : operacaoSEC
        
    };

		this.component.mudaCoisas = function(dados){
        this.p1 = this.children[0];
        this.p3 = this.children[1];
		this.p2 = this.children[2];
        this.p4 = this.children[3];
		this.p5 = this.children[4];
				
        if(dados["nome"]) this.p1.name = dados["nome"];
        if(dados["texto"]) this.p3.content = dados["texto"];

        if(dados["x"]) this.p1.bounds.x = dados["x"];
        if(dados["y"]) this.p1.bounds.y = dados["y"];

        if(dados["w"]) this.p1.bounds.width = dados["w"];
        if(dados["h"]) this.p1.bounds.height = dados["h"];
		
		if(dados["classe"]) this.propriedades["classe"] = dados["classe"]; 
		if(dados["atributo"]) this.propriedades["atributo"] = dados["atributo"]; 
		if(dados["operacao"]) this.propriedades["operacao"] = dados["operacao"]; 
		}; 
		
	this.component.getXML = function(){
        this.p1 = this.children[0];
        this.p3 = this.children[1];
		this.p2 = this.children[2];
        this.p4 = this.children[3];
		this.p5 = this.children[4];
			
		xml = "<CancelOp id='"+ this.p1.name +"' text='" + this.p3.content + "' x='"+ this.p1.bounds.x +"' y='"+ this.p1.bounds.y + "' w='" + this.p1.bounds.width + "' h='" +this.p1.bounds.height + "' classe='" + this.propriedades["classe"] + "'>\n" +
                "</CancelOp> \n";
        return xml;
    };
	
	this.component.getElement = function(doc){    	
        this.p1 = this.children[0];
        this.p3 = this.children[1];
		this.p2 = this.children[2];
        this.p4 = this.children[3];
		this.p5 = this.children[4];
		
		var element = doc.createElement("CancelOp");
		element.setAttribute("id", this.p1.name);
		element.setAttribute("text", this.p3.content);
		element.setAttribute("x", this.p1.bounds.x);
		element.setAttribute("y", this.p1.bounds.y);
		element.setAttribute("w", this.p1.bounds.width);
		element.setAttribute("h", this.p1.bounds.height);
		element.setAttribute("classe", this.propriedades["classe"]);
        return element;
    };	
	
    var type = TYPES.ACTION_AIO;
	this.component.getType = function(){		
		return type;
	};
		
	//novo GETs
	this.component.getX = function(){
		var x = this.p1.bounds.x;
		
		return x;
	};
	
	this.component.getY = function(){
		var y = this.p1.bounds.y;
		
		return y;
	};
	
	this.component.getWidth = function(){
		var w = this.p1.bounds.width;
		
		return w;
	};
	
	this.component.getHeight = function(){
		var h = this.p1.bounds.height;
		
		return h;
	};
    
    this.posicionaMenu = function(){
		var dados={
			y: 20,
			w: 300,
			h: 100
		};
		this.component.mudaCoisas(dados);
	};
};

//importar StopEndComplete
function impStopEndComplete2(idSEC, textoSEC, classeSEC, atributoSEC, operacaoSEC, xSEC, ySEC, wSEC, hSEC){
	contador = contador + 1;
	contStopEndComplete = contStopEndComplete + 1;
	
	//rectangulo principal 
	this.p1 = new paper.Path.Rectangle(new paper.Point(xSEC, ySEC), new paper.Size(wSEC, hSEC));
    this.p1.strokeColor = "black";
    this.p1.name = idSEC;

	this.p3 = new paper.PointText({		//texto e cor do texto
        content: textoSEC,		
        fillColor: 'black',
		fontSize: 15
    });

	// linha da seta "/"
	this.p2 = new paper.Path();  
	this.p2.add(new paper.Point(this.p1.bounds.x + 10, this.p1.bounds.y + 45));
	this.p2.add(new paper.Point(this.p1.bounds.x + 43.5, this.p1.bounds.y + 15));
	this.p2.strokeColor = "black";
	this.p2.strokeWidth = 2;

	this.p3.point = leftTextos(			//alinhar texto ? esquerda
            this.p1.bounds.width-90, 20,
            this.p1.bounds.x, this.p1.bounds.y,
            this.p3.bounds.width, this.p3.bounds.height
            );
			
	//tri?ngulo - ponta da seta		
	var center = new paper.Point(this.p1.bounds.x + 45, this.p1.bounds.y + 15);
	var sides = 3;
	var radius = 7;
	this.p4 = new paper.Path.RegularPolygon(center, sides, radius);
	this.p4.fillColor = 'black';	
	this.p4.rotate(45);	
	
	// linha "|" 2
	this.p5 = new paper.Path();  
	this.p5.add(new paper.Point(this.p1.bounds.x + 50, this.p1.bounds.y + 10));
	this.p5.add(new paper.Point(this.p1.bounds.x + 50, this.p1.bounds.y + 40));
	this.p5.strokeColor = "black";
	this.p5.strokeWidth = 2;
		
    this.component = new paper.Group([this.p1, this.p3, this.p2, this.p4, this.p5]);
    this.component.data ={
            nome:true,
            texto:true,
            size:0,
			classe: true
    };
	
	this.component.propriedades={
        classe : classeSEC,
		atributo : " ",
		operacao : operacaoSEC
        
    };

		this.component.mudaCoisas = function(dados){
        this.p1 = this.children[0];
        this.p3 = this.children[1];
		this.p2 = this.children[2];
        this.p4 = this.children[3];
		this.p5 = this.children[4];
				
        if(dados["nome"]) this.p1.name = dados["nome"];
        if(dados["texto"]) this.p3.content = dados["texto"];

        if(dados["x"]) this.p1.bounds.x = dados["x"];
        if(dados["y"]) this.p1.bounds.y = dados["y"];

        if(dados["w"]) this.p1.bounds.width = dados["w"];
        if(dados["h"]) this.p1.bounds.height = dados["h"];
		
		if(dados["classe"]) this.propriedades["classe"] = dados["classe"]; 
		if(dados["atributo"]) this.propriedades["atributo"] = dados["atributo"]; 
		if(dados["operacao"]) this.propriedades["operacao"] = dados["operacao"]; 
		}; 
		
	this.component.getXML = function(){
        this.p1 = this.children[0];
        this.p3 = this.children[1];
		this.p2 = this.children[2];
        this.p4 = this.children[3];
		this.p5 = this.children[4];
			
		xml = "<CloseOp id='"+ this.p1.name +"' text='" + this.p3.content + "' x='"+ this.p1.bounds.x +"' y='"+ this.p1.bounds.y + "' w='" + this.p1.bounds.width + "' h='" +this.p1.bounds.height + "' classe='" + this.propriedades["classe"] + "'>\n" +
                "</CloseOp> \n";
        return xml;
    };
	
    this.component.getElement = function(doc){    	
        this.p1 = this.children[0];
        this.p3 = this.children[1];
		this.p2 = this.children[2];
        this.p4 = this.children[3];
		this.p5 = this.children[4];
		
		var element = doc.createElement("CloseOp");
		element.setAttribute("id", this.p1.name);
		element.setAttribute("text", this.p3.content);
		element.setAttribute("x", this.p1.bounds.x);
		element.setAttribute("y", this.p1.bounds.y);
		element.setAttribute("w", this.p1.bounds.width);
		element.setAttribute("h", this.p1.bounds.height);
		element.setAttribute("classe", this.propriedades["classe"]);
        return element;
    };	
	
    var type = TYPES.ACTION_AIO;
	this.component.getType = function(){		
		return type;
	};
		
	//novo GETs
	this.component.getX = function(){
		var x = this.p1.bounds.x;
		
		return x;
	};
	
	this.component.getY = function(){
		var y = this.p1.bounds.y;
		
		return y;
	};
	
	this.component.getWidth = function(){
		var w = this.p1.bounds.width;
		
		return w;
	};
	
	this.component.getHeight = function(){
		var h = this.p1.bounds.height;
		
		return h;
	};
    
    this.posicionaMenu = function(){
		var dados={
			y: 20,
			w: 300,
			h: 100
		};
		this.component.mudaCoisas(dados);
	};
};

var myToggle = function(){
	contador = contador + 1;
	contToggle = contToggle + 1;
	
	//rectangulo principal 
	this.p1 = new paper.Path.Rectangle(new paper.Point(200, 100), new paper.Size(200, 60));
    this.p1.strokeColor = "black";
    this.p1.name = "toggle" + contToggle;

	this.p3 = new paper.PointText({		//texto e cor do texto
        content: 'Toggle',		
        fillColor: 'black',
		fontSize: 15
    });
	
	// linha da seta "/"
	this.p2 = new paper.Path();  
	this.p2.add(new paper.Point(this.p1.bounds.x + 10, this.p1.bounds.y + 45));
	this.p2.add(new paper.Point(this.p1.bounds.x + 43.5, this.p1.bounds.y + 15));
	this.p2.strokeColor = "black";
	this.p2.strokeWidth = 2;

	this.p3.point = leftTextos(			//alinhar texto ? esquerda
            this.p1.bounds.width-90, 20,
            this.p1.bounds.x, this.p1.bounds.y,
            this.p3.bounds.width, this.p3.bounds.height
            );
			
	//tri?ngulo - ponta da seta		
	var center = new paper.Point(this.p1.bounds.x + 45, this.p1.bounds.y + 15);
	var sides = 3;
	var radius = 7;
	this.p4 = new paper.Path.RegularPolygon(center, sides, radius);
	this.p4.fillColor = 'black';	
	this.p4.rotate(45);	
	this.p4.name = "toggle_symbol";
	
	// linha da seta "\"
	this.p5 = new paper.Path();  
	this.p5.add(new paper.Point(this.p1.bounds.x + 43.5, this.p1.bounds.y + 45));
	this.p5.add(new paper.Point(this.p1.bounds.x + 10, this.p1.bounds.y + 15));
	this.p5.strokeColor = "black";
	this.p5.strokeWidth = 2;
	
	//tri?ngulo - ponta da seta	2	
	var center2 = new paper.Point(this.p1.bounds.x + 10, this.p1.bounds.y + 15);
	var sides2 = 3;
	var radius2 = 7;
	this.p6 = new paper.Path.RegularPolygon(center2, sides2, radius2);
	this.p6.fillColor = 'black';	
	this.p6.rotate(-45);	
		
    this.component = new paper.Group([this.p1, this.p3, this.p2, this.p4, this.p5, this.p6]);
    this.component.data ={
            nome:true,
            texto:true,
            size:0,
			classe: true
    };
	
	this.component.propriedades={
        classe : ""
        
    };
	
		this.component.mudaCoisas = function(dados){
        this.p1 = this.children[0];
        this.p3 = this.children[1];
		this.p2 = this.children[2];
        this.p4 = this.children[3];
		this.p5 = this.children[4];
		this.p6 = this.children[5];
				
        if(dados["nome"]) this.p1.name = dados["nome"];
        if(dados["texto"]) this.p3.content = dados["texto"];

        if(dados["x"]) this.p1.bounds.x = dados["x"];
        if(dados["y"]) this.p1.bounds.y = dados["y"];

        if(dados["w"]) this.p1.bounds.width = dados["w"];
        if(dados["h"]) this.p1.bounds.height = dados["h"];
		
		if(dados["classe"]) this.propriedades["classe"] = dados["classe"]; 
		}; 
		
	this.component.getXML = function(){
        this.p1 = this.children[0];
        this.p3 = this.children[1];
		this.p2 = this.children[2];
        this.p4 = this.children[3];
		this.p5 = this.children[4];
		this.p6 = this.children[5];
			
		xml = "<Toggle id='"+ this.p1.name +"' text='" + this.p3.content + "' x='"+ this.p1.bounds.x +"' y='"+ this.p1.bounds.y + "' w='" + this.p1.bounds.width + "' h='" +this.p1.bounds.height + "' classe='" + this.propriedades["classe"] + "'>\n" +
                "</Toggle> \n";
        return xml;
    };
	
		//novo GETs
	this.component.getX = function(){
		var x = this.p1.bounds.x;
		
		return x;
	};
	
	this.component.getY = function(){
		var y = this.p1.bounds.y;
		
		return y;
	};
	
	this.component.getWidth = function(){
		var w = this.p1.bounds.width;
		
		return w;
	};
	
	this.component.getHeight = function(){
		var h = this.p1.bounds.height;
		
		return h;
	};
	
	//NOVO 08-04-2015
	this.component.getTipo = function(){
		var t = this.p4.name;
		
		return t;
	};
    
    this.posicionaMenu = function(){
		var dados={
			y: 20,
			w: 300,
			h: 100
		};
		this.component.mudaCoisas(dados);
	};
};

//importar Toggle
function impToggle(idT, textoT, classeT, xT, yT, wT, hT){
	contador = contador + 1;
	contToggle = contToggle + 1;
	
	//rectangulo principal 
	this.p1 = new paper.Path.Rectangle(new paper.Point(xT, yT), new paper.Size(wT, hT));
    this.p1.strokeColor = "black";
    this.p1.name = idT;

	this.p3 = new paper.PointText({		//texto e cor do texto
        content: textoT,		
        fillColor: 'black',
		fontSize: 15
    });
	
	// linha da seta "/"
	this.p2 = new paper.Path();  
	this.p2.add(new paper.Point(this.p1.bounds.x + 10, this.p1.bounds.y + 45));
	this.p2.add(new paper.Point(this.p1.bounds.x + 43.5, this.p1.bounds.y + 15));
	this.p2.strokeColor = "black";
	this.p2.strokeWidth = 2;

	this.p3.point = leftTextos(			//alinhar texto ? esquerda
            this.p1.bounds.width-90, 20,
            this.p1.bounds.x, this.p1.bounds.y,
            this.p3.bounds.width, this.p3.bounds.height
            );
			
	//tri?ngulo - ponta da seta		
	var center = new paper.Point(this.p1.bounds.x + 45, this.p1.bounds.y + 15);
	var sides = 3;
	var radius = 7;
	this.p4 = new paper.Path.RegularPolygon(center, sides, radius);
	this.p4.fillColor = 'black';	
	this.p4.rotate(45);	
	
	// linha da seta "\"
	this.p5 = new paper.Path();  
	this.p5.add(new paper.Point(this.p1.bounds.x + 43.5, this.p1.bounds.y + 45));
	this.p5.add(new paper.Point(this.p1.bounds.x + 10, this.p1.bounds.y + 15));
	this.p5.strokeColor = "black";
	this.p5.strokeWidth = 2;
	
	//tri?ngulo - ponta da seta	2	
	var center2 = new paper.Point(this.p1.bounds.x + 10, this.p1.bounds.y + 15);
	var sides2 = 3;
	var radius2 = 7;
	this.p6 = new paper.Path.RegularPolygon(center2, sides2, radius2);
	this.p6.fillColor = 'black';	
	this.p6.rotate(-45);	
		
    this.component = new paper.Group([this.p1, this.p3, this.p2, this.p4, this.p5, this.p6]);
    this.component.data ={
            nome:true,
            texto:true,
            size:0,
			classe: true
    };
	
	this.component.propriedades={
        classe : classeT
        
    };
	
		this.component.mudaCoisas = function(dados){
        this.p1 = this.children[0];
        this.p3 = this.children[1];
		this.p2 = this.children[2];
        this.p4 = this.children[3];
		this.p5 = this.children[4];
		this.p6 = this.children[5];
				
        if(dados["nome"]) this.p1.name = dados["nome"];
        if(dados["texto"]) this.p3.content = dados["texto"];

        if(dados["x"]) this.p1.bounds.x = dados["x"];
        if(dados["y"]) this.p1.bounds.y = dados["y"];

        if(dados["w"]) this.p1.bounds.width = dados["w"];
        if(dados["h"]) this.p1.bounds.height = dados["h"];
		
		if(dados["classe"]) this.propriedades["classe"] = dados["classe"]; 
		}; 
		
	this.component.getXML = function(){
        this.p1 = this.children[0];
        this.p3 = this.children[1];
		this.p2 = this.children[2];
        this.p4 = this.children[3];
		this.p5 = this.children[4];
		this.p6 = this.children[5];
			
		xml = "<Toggle id='"+ this.p1.name +"' text='" + this.p3.content + "' x='"+ this.p1.bounds.x +"' y='"+ this.p1.bounds.y + "' w='" + this.p1.bounds.width + "' h='" +this.p1.bounds.height + "' classe='" + this.propriedades["classe"] + "'>\n" +
                "</Toggle> \n";
        return xml;
    };
	
	//novo GETs
	this.component.getX = function(){
		var x = this.p1.bounds.x;
		
		return x;
	};
	
	this.component.getY = function(){
		var y = this.p1.bounds.y;
		
		return y;
	};
	
	this.component.getWidth = function(){
		var w = this.p1.bounds.width;
		
		return w;
	};
	
	this.component.getHeight = function(){
		var h = this.p1.bounds.height;
		
		return h;
	};
    
    this.posicionaMenu = function(){
		var dados={
			y: 20,
			w: 300,
			h: 100
		};
		this.component.mudaCoisas(dados);
	};
};

//importar View ToViewInstance
function impView(idV, textoV, classeV, atributoV, xV, yV, wV, hV, targetV){
	var target = targetV;
	contador = contador + 1;
	contView = contView + 1;
	
	//rectangulo principal 
	this.p1 = new paper.Path.Rectangle(new paper.Point(xV, yV), new paper.Size(wV, hV));
    this.p1.strokeColor = "black";
    this.p1.name = idV;

	this.p3 = new paper.PointText({		//texto e cor do texto
        content: textoV,		
        fillColor: 'black',
		fontSize: 15
    });
	
	// linha da seta "/"
	this.p2 = new paper.Path();  
	this.p2.add(new paper.Point(this.p1.bounds.x + 10, this.p1.bounds.y + 45));
	this.p2.add(new paper.Point(this.p1.bounds.x + 43.5, this.p1.bounds.y + 15));
	this.p2.strokeColor = "black";
	this.p2.strokeWidth = 2;

	this.p3.point = leftTextos(			//alinhar texto ? esquerda
            this.p1.bounds.width-90, 20,
            this.p1.bounds.x, this.p1.bounds.y,
            this.p3.bounds.width, this.p3.bounds.height
            );
			
	//tri?ngulo - ponta da seta		
	var center = new paper.Point(this.p1.bounds.x + 45, this.p1.bounds.y + 15);
	var sides = 3;
	var radius = 7;
	this.p4 = new paper.Path.RegularPolygon(center, sides, radius);
	this.p4.fillColor = 'black';	
	this.p4.rotate(45);	
	
	//quadrado
	this.p5 = new paper.Path.Rectangle(new paper.Point(this.p1.bounds.x + 55, this.p1.bounds.y + 5), new paper.Size(12, 12));
    this.p5.strokeColor = "black"; 
			
	this.component = new paper.Group([this.p1, this.p3, this.p2, this.p4, this.p5]);
    this.component.data ={
            nome:true,
            texto:true,
            size:0,
			classe: true
    };
	
	this.component.propriedades={
        classe : classeV,
		atributo : " "
        
    };
	
		this.component.mudaCoisas = function(dados){
        this.p1 = this.children[0];
        this.p3 = this.children[1];
		this.p2 = this.children[2];
        this.p4 = this.children[3];
		this.p5 = this.children[4];
		
		if(dados["target"]) target = dados["target"];
        if(dados["nome"]) this.p1.name = dados["nome"];
        if(dados["texto"]) this.p3.content = dados["texto"];

        if(dados["x"]) this.p1.bounds.x = dados["x"];
        if(dados["y"]) this.p1.bounds.y = dados["y"];

        if(dados["w"]) this.p1.bounds.width = dados["w"];
        if(dados["h"]) this.p1.bounds.height = dados["h"];
		
		if(dados["classe"]) this.propriedades["classe"] = dados["classe"]; 
		if(dados["atributo"]) this.propriedades["atributo"] = dados["atributo"];
		}; 
		
	this.component.getXML = function(){
        this.p1 = this.children[0];
        this.p3 = this.children[1];
		this.p2 = this.children[2];
        this.p4 = this.children[3];
		this.p5 = this.children[4];
			
		xml = "<ToViewInstance id='"+ this.p1.name +"' text='" + this.p3.content + "' x='"+ this.p1.bounds.x +"' y='"+ this.p1.bounds.y + "' w='" + this.p1.bounds.width + "' h='" +this.p1.bounds.height + "' classe='" + this.propriedades["classe"] + "'>\n" +
                "</ToViewInstance> \n";
        return xml;
    };
	
    this.component.getElement = function(doc){    	
        this.p1 = this.children[0];
        this.p3 = this.children[1];
		this.p2 = this.children[2];
        this.p4 = this.children[3];
		this.p5 = this.children[4];
		
		var element = doc.createElement("ToViewInstance");
		element.setAttribute("id", this.p1.name);
		element.setAttribute("text", this.p3.content);
		element.setAttribute("x", this.p1.bounds.x);
		element.setAttribute("y", this.p1.bounds.y);
		element.setAttribute("w", this.p1.bounds.width);
		element.setAttribute("h", this.p1.bounds.height);
		element.setAttribute("classe", this.propriedades["classe"]);
		element.setAttribute("target", target);
        return element;
    };	
	
    var type = TYPES.ACTION_AIO_TARGET;
	this.component.getType = function(){		
		return type;
	};
	
	this.component.getTarget = function(){		
		return target;
	};	
		
	//novo GETs
	this.component.getX = function(){
		var x = this.p1.bounds.x;
		
		return x;
	};
	
	this.component.getY = function(){
		var y = this.p1.bounds.y;
		
		return y;
	};
	
	this.component.getWidth = function(){
		var w = this.p1.bounds.width;
		
		return w;
	};
	
	this.component.getHeight = function(){
		var h = this.p1.bounds.height;
		
		return h;
	};
    
    this.posicionaMenu = function(){
		var dados={
			y: 20,
			w: 300,
			h: 100
		};
		this.component.mudaCoisas(dados);
	};
};

//importar View
function impView2(idV, textoV, classeV, atributoV, operacaoV, xV, yV, wV, hV){
	contador = contador + 1;
	contView = contView + 1;
	
	//rectangulo principal 
	this.p1 = new paper.Path.Rectangle(new paper.Point(xV, yV), new paper.Size(wV, hV));
    this.p1.strokeColor = "black";
    this.p1.name = idV;

	this.p3 = new paper.PointText({		//texto e cor do texto
        content: textoV,		
        fillColor: 'black',
		fontSize: 15
    });
	
	// linha da seta "/"
	this.p2 = new paper.Path();  
	this.p2.add(new paper.Point(this.p1.bounds.x + 10, this.p1.bounds.y + 45));
	this.p2.add(new paper.Point(this.p1.bounds.x + 43.5, this.p1.bounds.y + 15));
	this.p2.strokeColor = "black";
	this.p2.strokeWidth = 2;

	this.p3.point = leftTextos(			//alinhar texto ? esquerda
            this.p1.bounds.width-90, 20,
            this.p1.bounds.x, this.p1.bounds.y,
            this.p3.bounds.width, this.p3.bounds.height
            );
			
	//tri?ngulo - ponta da seta		
	var center = new paper.Point(this.p1.bounds.x + 45, this.p1.bounds.y + 15);
	var sides = 3;
	var radius = 7;
	this.p4 = new paper.Path.RegularPolygon(center, sides, radius);
	this.p4.fillColor = 'black';	
	this.p4.rotate(45);	
	
	//quadrado
	this.p5 = new paper.Path.Rectangle(new paper.Point(this.p1.bounds.x + 55, this.p1.bounds.y + 5), new paper.Size(12, 12));
    this.p5.strokeColor = "black"; 
			
	this.component = new paper.Group([this.p1, this.p3, this.p2, this.p4, this.p5]);
    this.component.data ={
            nome:true,
            texto:true,
            size:0,
			classe: true
    };
	
	this.component.propriedades={
        classe : classeV,
		atributo : " ",
		operacao : operacaoV
        
    };
	
		this.component.mudaCoisas = function(dados){
        this.p1 = this.children[0];
        this.p3 = this.children[1];
		this.p2 = this.children[2];
        this.p4 = this.children[3];
		this.p5 = this.children[4];
					
        if(dados["nome"]) this.p1.name = dados["nome"];
        if(dados["texto"]) this.p3.content = dados["texto"];

        if(dados["x"]) this.p1.bounds.x = dados["x"];
        if(dados["y"]) this.p1.bounds.y = dados["y"];

        if(dados["w"]) this.p1.bounds.width = dados["w"];
        if(dados["h"]) this.p1.bounds.height = dados["h"];
		
		if(dados["classe"]) this.propriedades["classe"] = dados["classe"]; 
		if(dados["atributo"]) this.propriedades["atributo"] = dados["atributo"];
		if(dados["operacao"]) this.propriedades["operacao"] = dados["operacao"];
		}; 
		
	this.component.getXML = function(){
        this.p1 = this.children[0];
        this.p3 = this.children[1];
		this.p2 = this.children[2];
        this.p4 = this.children[3];
		this.p5 = this.children[4];
			
		xml = "<CallRetrieveOp id='"+ this.p1.name +"' text='" + this.p3.content + "' x='"+ this.p1.bounds.x +"' y='"+ this.p1.bounds.y + "' w='" + this.p1.bounds.width + "' h='" +this.p1.bounds.height + "' classe='" + this.propriedades["classe"] + "' operacao='Retrieve" + /*this.propriedades["operacao"] +*/ "'>\n" +
                "</CallRetrieveOp> \n";
        return xml;
    };
		
    this.component.getElement = function(doc){    	
        this.p1 = this.children[0];
        this.p3 = this.children[1];
		this.p2 = this.children[2];
        this.p4 = this.children[3];
		this.p5 = this.children[4];
		
		var element = doc.createElement("CallRetrieveOp");
		element.setAttribute("id", this.p1.name);
		element.setAttribute("text", this.p3.content);
		element.setAttribute("x", this.p1.bounds.x);
		element.setAttribute("y", this.p1.bounds.y);
		element.setAttribute("w", this.p1.bounds.width);
		element.setAttribute("h", this.p1.bounds.height);
		element.setAttribute("classe", this.propriedades["classe"]);
		element.setAttribute("operacao", "Retrieve");
        return element;
    };	
	
    var type = TYPES.ACTION_AIO;
	this.component.getType = function(){		
		return type;
	};
		
	//novo GETs
	this.component.getX = function(){
		var x = this.p1.bounds.x;
		
		return x;
	};
	
	this.component.getY = function(){
		var y = this.p1.bounds.y;
		
		return y;
	};
	
	this.component.getWidth = function(){
		var w = this.p1.bounds.width;
		
		return w;
	};
	
	this.component.getHeight = function(){
		var h = this.p1.bounds.height;
		
		return h;
	};
    
    this.posicionaMenu = function(){
		var dados={
			y: 20,
			w: 300,
			h: 100
		};
		this.component.mudaCoisas(dados);
	};
};

//ACTIVE MATERIALS
var myActiveMaterial = function(){
	contador = contador + 1;	
	contActiveMaterial = contActiveMaterial + 1;

    //rectangulo principal 
	this.p1 = new paper.Path.Rectangle(new paper.Point(200, 180), new paper.Size(200, 60));
    this.p1.strokeColor = "black";
    this.p1.name = "activematerial" + contActiveMaterial;

	this.p3 = new paper.PointText({		//texto e cor do texto
        content: 'Active Material',		
        fillColor: 'black',
		fontSize: 15
    });
	
	//quadrado  
	this.p5 = new paper.Path.Rectangle(new paper.Point(this.p1.bounds.x + 10, this.p1.bounds.y + 10), new paper.Size(40, 40));
    this.p5.strokeColor = "black";
    this.p5.name = "actmt_symbol";
	
	// linha da seta "/"
	this.p2 = new paper.Path();  
	this.p2.add(new paper.Point(this.p1.bounds.x + 3, this.p1.bounds.y + 55));
	this.p2.add(new paper.Point(this.p1.bounds.x + 25, this.p1.bounds.y + 30));
	this.p2.strokeColor = "black";
	this.p2.strokeWidth = 2;

	this.p3.point = leftTextos(			//alinhar texto ? esquerda
            this.p1.bounds.width-90, 20,
            this.p1.bounds.x, this.p1.bounds.y,
            this.p3.bounds.width, this.p3.bounds.height
            );
	//tri?ngulo - ponta da seta		
	var center = new paper.Point(this.p1.bounds.x + 26, this.p1.bounds.y + 31);
	var sides = 3;
	var radius = 6;
	this.p4 = new paper.Path.RegularPolygon(center, sides, radius);
	this.p4.fillColor = 'black';	
	this.p4.rotate(45);	
			
	this.component = new paper.Group([this.p1, this.p3, this.p2, this.p4, this.p5]);
    this.component.data ={
            nome:true,
            texto:true,
            size:0,
			classe: true
    };
	
	this.component.propriedades={
        classe : ""
        
    };
	
		this.component.mudaCoisas = function(dados){
        this.p1 = this.children[0];
        this.p3 = this.children[1];
		this.p2 = this.children[2];
        this.p4 = this.children[3];
		this.p5 = this.children[4];
					
        if(dados["nome"]) this.p1.name = dados["nome"];
        if(dados["texto"]) this.p3.content = dados["texto"];

        if(dados["x"]) this.p1.bounds.x = dados["x"];
        if(dados["y"]) this.p1.bounds.y = dados["y"];

        if(dados["w"]) this.p1.bounds.width = dados["w"];
        if(dados["h"]) this.p1.bounds.height = dados["h"];
		
		if(dados["classe"]) this.propriedades["classe"] = dados["classe"]; 
		}; 
		
	this.component.getXML = function(){
        this.p1 = this.children[0];
        this.p3 = this.children[1];
		this.p2 = this.children[2];
        this.p4 = this.children[3];
		this.p5 = this.children[4];
			
		xml = "<ActiveMaterial id='"+ this.p1.name +"' text='" + this.p3.content + "' x='"+ this.p1.bounds.x +"' y='"+ this.p1.bounds.y + "' w='" + this.p1.bounds.width + "' h='" +this.p1.bounds.height + "' classe='" + this.propriedades["classe"] + "'>\n" +
                "</ActiveMaterial> \n";
        return xml;
    };
	
		//novo GETs
	this.component.getX = function(){
		var x = this.p1.bounds.x;
		
		return x;
	};
	
	this.component.getY = function(){
		var y = this.p1.bounds.y;
		
		return y;
	};
	
	this.component.getWidth = function(){
		var w = this.p1.bounds.width;
		
		return w;
	};
	
	this.component.getHeight = function(){
		var h = this.p1.bounds.height;
		
		return h;
	};
	
	//NOVO 08-04-2015
	this.component.getTipo = function(){
		var t = this.p5.name;
		
		return t;
	};
    
    this.posicionaMenu = function(){
		var dados={
			y: 20,
			w: 300,
			h: 100
		};
		this.component.mudaCoisas(dados);
	};
};

//importar ActiveMaterial
function impActiveMaterial(idAM, textoAM, classeAM, xAM, yAM, wAM, hAM){
	contador = contador + 1;	
	contActiveMaterial = contActiveMaterial + 1;

    //rectangulo principal 
	this.p1 = new paper.Path.Rectangle(new paper.Point(xAM, yAM), new paper.Size(wAM, hAM));
    this.p1.strokeColor = "black";
    this.p1.name = idAM;

	this.p3 = new paper.PointText({		//texto e cor do texto
        content: textoAM,		
        fillColor: 'black',
		fontSize: 15
    });
	
	//quadrado  
	this.p5 = new paper.Path.Rectangle(new paper.Point(this.p1.bounds.x + 10, this.p1.bounds.y + 10), new paper.Size(40, 40));
    this.p5.strokeColor = "black";
    this.p5.name = "actmt_symbol";
	
	// linha da seta "/"
	this.p2 = new paper.Path();  
	this.p2.add(new paper.Point(this.p1.bounds.x + 3, this.p1.bounds.y + 55));
	this.p2.add(new paper.Point(this.p1.bounds.x + 25, this.p1.bounds.y + 30));
	this.p2.strokeColor = "black";
	this.p2.strokeWidth = 2;

	this.p3.point = leftTextos(			//alinhar texto ? esquerda
            this.p1.bounds.width-90, 20,
            this.p1.bounds.x, this.p1.bounds.y,
            this.p3.bounds.width, this.p3.bounds.height
            );
	//tri?ngulo - ponta da seta		
	var center = new paper.Point(this.p1.bounds.x + 26, this.p1.bounds.y + 31);
	var sides = 3;
	var radius = 6;
	this.p4 = new paper.Path.RegularPolygon(center, sides, radius);
	this.p4.fillColor = 'black';	
	this.p4.rotate(45);	
			
	this.component = new paper.Group([this.p1, this.p3, this.p2, this.p4, this.p5]);
    this.component.data ={
            nome:true,
            texto:true,
            size:0,
			classe: true
    };
	
	this.component.propriedades={
        classe : classeAM
        
    };
	
		this.component.mudaCoisas = function(dados){
        this.p1 = this.children[0];
        this.p3 = this.children[1];
		this.p2 = this.children[2];
        this.p4 = this.children[3];
		this.p5 = this.children[4];
					
        if(dados["nome"]) this.p1.name = dados["nome"];
        if(dados["texto"]) this.p3.content = dados["texto"];

        if(dados["x"]) this.p1.bounds.x = dados["x"];
        if(dados["y"]) this.p1.bounds.y = dados["y"];

        if(dados["w"]) this.p1.bounds.width = dados["w"];
        if(dados["h"]) this.p1.bounds.height = dados["h"];
		
		if(dados["classe"]) this.propriedades["classe"] = dados["classe"]; 
		}; 
		
	this.component.getXML = function(){
        this.p1 = this.children[0];
        this.p3 = this.children[1];
		this.p2 = this.children[2];
        this.p4 = this.children[3];
		this.p5 = this.children[4];
			
		xml = "<ActiveMaterial id='"+ this.p1.name +"' text='" + this.p3.content + "' x='"+ this.p1.bounds.x +"' y='"+ this.p1.bounds.y + "' w='" + this.p1.bounds.width + "' h='" +this.p1.bounds.height + "' classe='" + this.propriedades["classe"] + "'>\n" +
                "</ActiveMaterial> \n";
        return xml;
    };
	
		//novo GETs
	this.component.getX = function(){
		var x = this.p1.bounds.x;
		
		return x;
	};
	
	this.component.getY = function(){
		var y = this.p1.bounds.y;
		
		return y;
	};
	
	this.component.getWidth = function(){
		var w = this.p1.bounds.width;
		
		return w;
	};
	
	this.component.getHeight = function(){
		var h = this.p1.bounds.height;
		
		return h;
	};
    
    this.posicionaMenu = function(){
		var dados={
			y: 20,
			w: 300,
			h: 100
		};
		this.component.mudaCoisas(dados);
	};
};

// IMPORTAR _ DATA AIO _ InputOnly
function impInputAccepter(idIA, textoIA, classeIA, atributoIA, xIA, yIA, wIA, hIA){
	contador = contador + 1;
	contInputAccepter = contInputAccepter + 1;
	
    //rectangulo principal 
	this.p1 = new paper.Path.Rectangle(new paper.Point(xIA, yIA), new paper.Size(wIA, hIA));
    this.p1.strokeColor = "black";
    this.p1.name = idIA;

	this.p3 = new paper.PointText({		//texto e cor do texto
        content: textoIA,		
        fillColor: 'black',
		fontSize: 15
    });
	
	//quadrado  
	this.p5 = new paper.Path.Rectangle(new paper.Point(this.p1.bounds.x + 10, this.p1.bounds.y + 10), new paper.Size(40, 40));
    this.p5.strokeColor = "black";
    this.p5.name = "actmt_symbol";
	
	// linha da seta "/"
	this.p2 = new paper.Path();  
	this.p2.add(new paper.Point(this.p1.bounds.x + 3, this.p1.bounds.y + 55));
	this.p2.add(new paper.Point(this.p1.bounds.x + 25, this.p1.bounds.y + 30));
	this.p2.strokeColor = "black";
	this.p2.strokeWidth = 2;

	this.p3.point = leftTextos(			//alinhar texto ? esquerda
            this.p1.bounds.width-90, 20,
            this.p1.bounds.x, this.p1.bounds.y,
            this.p3.bounds.width, this.p3.bounds.height
            );
	//tri?ngulo - ponta da seta		
	var center = new paper.Point(this.p1.bounds.x + 26, this.p1.bounds.y + 31);
	var sides = 3;
	var radius = 6;
	this.p4 = new paper.Path.RegularPolygon(center, sides, radius);
	this.p4.fillColor = 'black';	
	this.p4.rotate(45);	
	
	//estrela
	var centerstar = new paper.Point(this.p1.bounds.x + 35, this.p1.bounds.y + 29);
	var points = 5;
	var radius1 = 3;
	var radius2 = 6;
	this.p6 = new paper.Path.Star(centerstar, points, radius1, radius2);
	this.p6.fillColor = 'black';
			
	this.component = new paper.Group([this.p1, this.p3, this.p2, this.p4, this.p5, this.p6]);
    this.component.data ={
            nome:true,
            texto:true,
            size:0,
			classe: true
    };
	
	this.component.propriedades={
        classe : classeIA,
		atributo : atributoIA
        
    };
	
		this.component.mudaCoisas = function(dados){
        this.p1 = this.children[0];
        this.p3 = this.children[1];
		this.p2 = this.children[2];
        this.p4 = this.children[3];
		this.p5 = this.children[4];
		this.p6 = this.children[5];
					
        if(dados["nome"]) this.p1.name = dados["nome"];
        if(dados["texto"]) this.p3.content = dados["texto"];

        if(dados["x"]) this.p1.bounds.x = dados["x"];
        if(dados["y"]) this.p1.bounds.y = dados["y"];

        if(dados["w"]) this.p1.bounds.width = dados["w"];
        if(dados["h"]) this.p1.bounds.height = dados["h"];
		
		if(dados["classe"]) this.propriedades["classe"] = dados["classe"]; 
		if(dados["atributo"]) this.propriedades["atributo"] = dados["atributo"]; 
		}; 
		
	this.component.getXML = function(){
        this.p1 = this.children[0];
        this.p3 = this.children[1];
		this.p2 = this.children[2];
        this.p4 = this.children[3];
		this.p5 = this.children[4];
		this.p6 = this.children[5];
			
		xml = "<InputOnly id='"+ this.p1.name +"' text='" + this.p3.content + "' x='"+ this.p1.bounds.x +"' y='"+ this.p1.bounds.y + "' w='" + this.p1.bounds.width + "' h='" +this.p1.bounds.height + "' classe='" + this.propriedades["classe"] + "' atributo='" + this.propriedades["atributo"] + "'>\n" +
                "</InputOnly> \n";
        return xml;
    };
	
    this.component.getElement = function(doc){    	
        this.p1 = this.children[0];
        this.p3 = this.children[1];
		this.p2 = this.children[2];
        this.p4 = this.children[3];
		this.p5 = this.children[4];
		this.p6 = this.children[5];
		
		var element = doc.createElement("InputOnly");
		element.setAttribute("id", this.p1.name);
		element.setAttribute("text", this.p3.content);
		element.setAttribute("x", this.p1.bounds.x);
		element.setAttribute("y", this.p1.bounds.y);
		element.setAttribute("w", this.p1.bounds.width);
		element.setAttribute("h", this.p1.bounds.height);
		element.setAttribute("classe", this.propriedades["classe"]);
		element.setAttribute("atributo", this.propriedades["atributo"]);		
        return element;
    };	
	
    var type = TYPES.DATA_AIO;
	this.component.getType = function(){		
		return type;
	};	
	
	//novo GETs
	this.component.getX = function(){
		var x = this.p1.bounds.x;
		
		return x;
	};
	
	this.component.getY = function(){
		var y = this.p1.bounds.y;
		
		return y;
	};
	
	this.component.getWidth = function(){
		var w = this.p1.bounds.width;
		
		return w;
	};
	
	this.component.getHeight = function(){
		var h = this.p1.bounds.height;
		
		return h;
	};
    
    this.posicionaMenu = function(){
		var dados={
			y: 20,
			w: 300,
			h: 100
		};
		this.component.mudaCoisas(dados);
	};
};



//importar EditableElement
function impEditableElement(idEE, textoEE, classeEE, atributoEE, xEE, yEE, wEE, hEE){
	contador = contador + 1;
	contEditableElement = contEditableElement + 1;

    //rectangulo principal 
	this.p1 = new paper.Path.Rectangle(new paper.Point(xEE, yEE), new paper.Size(wEE, hEE));
    this.p1.strokeColor = "black";
    this.p1.name = idEE;

	this.p3 = new paper.PointText({		//texto e cor do texto
        content: textoEE,		
        fillColor: 'black',
		fontSize: 15
    });
	
	//quadrado  
	this.p5 = new paper.Path.Rectangle(new paper.Point(this.p1.bounds.x + 10, this.p1.bounds.y + 10), new paper.Size(40, 40));
    this.p5.strokeColor = "black";
    this.p5.name = "actmt_symbol";
	
	// linha da seta "/"
	this.p2 = new paper.Path();  
	this.p2.add(new paper.Point(this.p1.bounds.x + 3, this.p1.bounds.y + 55));
	this.p2.add(new paper.Point(this.p1.bounds.x + 25, this.p1.bounds.y + 30));
	this.p2.strokeColor = "black";
	this.p2.strokeWidth = 2;

	this.p3.point = leftTextos(			//alinhar texto ? esquerda
            this.p1.bounds.width-90, 20,
            this.p1.bounds.x, this.p1.bounds.y,
            this.p3.bounds.width, this.p3.bounds.height
            );
	//tri?ngulo - ponta da seta		
	var center = new paper.Point(this.p1.bounds.x + 26, this.p1.bounds.y + 31);
	var sides = 3;
	var radius = 6;
	this.p4 = new paper.Path.RegularPolygon(center, sides, radius);
	this.p4.fillColor = 'black';	
	this.p4.rotate(45);	
	
	//s?mbolo "~"
	this.p6 = new paper.PointText(new paper.Point(this.p1.bounds.x + 30, this.p1.bounds.y + 33));		
    this.p6.content = '~';		
    this.p6.fillColor = 'black';
	this.p6.fontSize = 25;
			
	this.component = new paper.Group([this.p1, this.p3, this.p2, this.p4, this.p5, this.p6]);
    this.component.data ={
            nome:true,
            texto:true,
            size:0,
			classe:true
    };
	
	this.component.propriedades={
        classe : classeEE,
		atributo : atributoEE
        
    };
	
		this.component.mudaCoisas = function(dados){
        this.p1 = this.children[0];
        this.p3 = this.children[1];
		this.p2 = this.children[2];
        this.p4 = this.children[3];
		this.p5 = this.children[4];
		this.p6 = this.children[5];
					
        if(dados["nome"]) this.p1.name = dados["nome"];
        if(dados["texto"]) this.p3.content = dados["texto"];

        if(dados["x"]) this.p1.bounds.x = dados["x"];
        if(dados["y"]) this.p1.bounds.y = dados["y"];

        if(dados["w"]) this.p1.bounds.width = dados["w"];
        if(dados["h"]) this.p1.bounds.height = dados["h"];
		
		if(dados["classe"]) this.propriedades["classe"] = dados["classe"]; 
		if(dados["atributo"]) this.propriedades["atributo"] = dados["atributo"]; 
		}; 
		
	this.component.getXML = function(){
        this.p1 = this.children[0];
        this.p3 = this.children[1];
		this.p2 = this.children[2];
        this.p4 = this.children[3];
		this.p5 = this.children[4];
		this.p6 = this.children[5];
			
		xml = "<Editting id='"+ this.p1.name +"' text='" + this.p3.content + "' x='"+ this.p1.bounds.x +"' y='"+ this.p1.bounds.y + "' w='" + this.p1.bounds.width + "' h='" +this.p1.bounds.height + "' classe='" + this.propriedades["classe"] + "' atributo='" + this.propriedades["atributo"] + "'>\n" +
                "</Editting> \n";
        return xml;
    };
	
    this.component.getElement = function(doc){    	
        this.p1 = this.children[0];
        this.p3 = this.children[1];
		this.p2 = this.children[2];
        this.p4 = this.children[3];
		this.p5 = this.children[4];
		this.p6 = this.children[5];
		
		var element = doc.createElement("Editting");
		element.setAttribute("id", this.p1.name);
		element.setAttribute("text", this.p3.content);
		element.setAttribute("x", this.p1.bounds.x);
		element.setAttribute("y", this.p1.bounds.y);
		element.setAttribute("w", this.p1.bounds.width);
		element.setAttribute("h", this.p1.bounds.height);
		element.setAttribute("classe", this.propriedades["classe"]);
		element.setAttribute("atributo", this.propriedades["atributo"]);		
        return element;
    };	
	
    var type = TYPES.DATA_AIO;
	this.component.getType = function(){		
		return type;
	};
		//novo GETs
	this.component.getX = function(){
		var x = this.p1.bounds.x;
		
		return x;
	};
	
	this.component.getY = function(){
		var y = this.p1.bounds.y;
		
		return y;
	};
	
	this.component.getWidth = function(){
		var w = this.p1.bounds.width;
		
		return w;
	};
	
	this.component.getHeight = function(){
		var h = this.p1.bounds.height;
		
		return h;
	};
    
    this.posicionaMenu = function(){
		var dados={
			y: 20,
			w: 300,
			h: 100
		};
		this.component.mudaCoisas(dados);
	};
};

var myEditableCollection = function(){
	contador = contador + 1;
    contEditableCollection = contEditableCollection + 1;
	
	//rectangulo principal 
	this.p1 = new paper.Path.Rectangle(new paper.Point(200, 180), new paper.Size(200, 60));
    this.p1.strokeColor = "black";
    this.p1.name = "editablecollection" + contEditableCollection;

	this.p3 = new paper.PointText({		//texto e cor do texto
        content: 'Editable Collection',		
        fillColor: 'black',
		fontSize: 15
    });
	
	//quadrado  
	this.p5 = new paper.Path.Rectangle(new paper.Point(this.p1.bounds.x + 10, this.p1.bounds.y + 10), new paper.Size(40, 40));
    this.p5.strokeColor = "black";
    this.p5.name = "editablecollection_symbol";
	
	// linhas dentro do quadrado collection
	this.p8 = new paper.Path();
	this.p8.add(new paper.Point(this.p5.bounds.x + 7.5, this.p5.bounds.y + 25)); // primeiro ponto - vai buscar posi??o (bounds) de p1 - rectangulo e acresce 20 ao y (para baixo) 
	this.p8.add(new paper.Point(this.p5.bounds.x + 32.5, this.p5.bounds.y + 25)); // segundo ponto - vai buscar posi??o (bounds) de p1 - rectangulo e acresce 20 ao y (para baixo) e utiliza a width de p1 
	this.p8.strokeColor = "black";
	
	// linha da seta "/"
	this.p2 = new paper.Path();  
	this.p2.add(new paper.Point(this.p1.bounds.x + 3, this.p1.bounds.y + 55));
	this.p2.add(new paper.Point(this.p1.bounds.x + 20, this.p1.bounds.y + 25));
	this.p2.strokeColor = "black";
	this.p2.strokeWidth = 2;

	this.p3.point = leftTextos(			//alinhar texto ? esquerda
            this.p1.bounds.width-90, 20,
            this.p1.bounds.x, this.p1.bounds.y,
            this.p3.bounds.width, this.p3.bounds.height
            );
	
	//tri?ngulo - ponta da seta		
	var center = new paper.Point(this.p1.bounds.x + 22, this.p1.bounds.y + 26);
	var sides = 3;
	var radius = 6;
	this.p4 = new paper.Path.RegularPolygon(center, sides, radius);
	this.p4.fillColor = 'black';	
	this.p4.rotate(45);	
	
	//s?mbolo "~"
	this.p6 = new paper.PointText(new paper.Point(this.p5.bounds.x + 17, this.p5.bounds.y + 20));		
    this.p6.content = '~';		
    this.p6.fillColor = 'black';
	this.p6.fontSize = 25;
			
	this.component = new paper.Group([this.p1, this.p3, this.p2, this.p4, this.p5, this.p6, this.p8]);
    this.component.data ={
            nome:true,
            texto:true,
            size:0,
			classe:true
    };
	
	this.component.propriedades={
        classe : ""
        
    };
	
	this.component.mudaCoisas = function(dados){
        this.p1 = this.children[0];
        this.p3 = this.children[1];
		this.p2 = this.children[2];
        this.p4 = this.children[3];
		this.p5 = this.children[4];
		this.p6 = this.children[5];
		this.p8 = this.children[6];
					
        if(dados["nome"]) this.p1.name = dados["nome"];
        if(dados["texto"]) this.p3.content = dados["texto"];

        if(dados["x"]) this.p1.bounds.x = dados["x"];
        if(dados["y"]) this.p1.bounds.y = dados["y"];

        if(dados["w"]) this.p1.bounds.width = dados["w"];
        if(dados["h"]) this.p1.bounds.height = dados["h"];
		
		if(dados["classe"]) this.propriedades["classe"] = dados["classe"]; 
	}; 
		
	this.component.getXML = function(){
        this.p1 = this.children[0];
        this.p3 = this.children[1];
		this.p2 = this.children[2];
        this.p4 = this.children[3];
		this.p5 = this.children[4];
		this.p6 = this.children[5];
		this.p8 = this.children[6];
			
		xml = "<EditableCollection id='"+ this.p1.name +"' text='" + this.p3.content + "' x='"+ this.p1.bounds.x +"' y='"+ this.p1.bounds.y + "' w='" + this.p1.bounds.width + "' h='" +this.p1.bounds.height + "' classe='" + this.propriedades["classe"] + "'>\n" +
                "</EditableCollection> \n";
        return xml;
    };
	
		//novo GETs
	this.component.getX = function(){
		var x = this.p1.bounds.x;
		
		return x;
	};
	
	this.component.getY = function(){
		var y = this.p1.bounds.y;
		
		return y;
	};
	
	this.component.getWidth = function(){
		var w = this.p1.bounds.width;
		
		return w;
	};
	
	this.component.getHeight = function(){
		var h = this.p1.bounds.height;
		
		return h;
	};
	
	//NOVO 08-04-2015
	this.component.getTipo = function(){
		var t = this.p5.name;
		
		return t;
	};
    
    this.posicionaMenu = function(){
		var dados={
			y: 20,
			w: 300,
			h: 100
		};
		this.component.mudaCoisas(dados);
	};
};

//importar EditableCollection
function impEditableCollection(idEC, textoEC, classeEC, xEC, yEC, wEC, hEC){
	contador = contador + 1;
    contEditableCollection = contEditableCollection + 1;
	
	//rectangulo principal 
	this.p1 = new paper.Path.Rectangle(new paper.Point(xEC, yEC), new paper.Size(wEC, hEC));
    this.p1.strokeColor = "black";
    this.p1.name = idEC;

	this.p3 = new paper.PointText({		//texto e cor do texto
        content: textoEC,		
        fillColor: 'black',
		fontSize: 15
    });
	
	//quadrado  
	this.p5 = new paper.Path.Rectangle(new paper.Point(this.p1.bounds.x + 10, this.p1.bounds.y + 10), new paper.Size(40, 40));
    this.p5.strokeColor = "black";
    this.p5.name = "actmt_symbol";
	
	// linhas dentro do quadrado collection
	this.p8 = new paper.Path();
	this.p8.add(new paper.Point(this.p5.bounds.x + 7.5, this.p5.bounds.y + 25)); // primeiro ponto - vai buscar posi??o (bounds) de p1 - rectangulo e acresce 20 ao y (para baixo) 
	this.p8.add(new paper.Point(this.p5.bounds.x + 32.5, this.p5.bounds.y + 25)); // segundo ponto - vai buscar posi??o (bounds) de p1 - rectangulo e acresce 20 ao y (para baixo) e utiliza a width de p1 
	this.p8.strokeColor = "black";
	
	// linha da seta "/"
	this.p2 = new paper.Path();  
	this.p2.add(new paper.Point(this.p1.bounds.x + 3, this.p1.bounds.y + 55));
	this.p2.add(new paper.Point(this.p1.bounds.x + 20, this.p1.bounds.y + 25));
	this.p2.strokeColor = "black";
	this.p2.strokeWidth = 2;

	this.p3.point = leftTextos(			//alinhar texto ? esquerda
            this.p1.bounds.width-90, 20,
            this.p1.bounds.x, this.p1.bounds.y,
            this.p3.bounds.width, this.p3.bounds.height
            );
	
	//tri?ngulo - ponta da seta		
	var center = new paper.Point(this.p1.bounds.x + 22, this.p1.bounds.y + 26);
	var sides = 3;
	var radius = 6;
	this.p4 = new paper.Path.RegularPolygon(center, sides, radius);
	this.p4.fillColor = 'black';	
	this.p4.rotate(45);	
	
	//s?mbolo "~"
	this.p6 = new paper.PointText(new paper.Point(this.p5.bounds.x + 17, this.p5.bounds.y + 20));		
    this.p6.content = '~';		
    this.p6.fillColor = 'black';
	this.p6.fontSize = 25;
	
	
			
	this.component = new paper.Group([this.p1, this.p3, this.p2, this.p4, this.p5, this.p6, this.p8]);
    this.component.data ={
            nome:true,
            texto:true,
            size:0,
			classe:true
    };
	
	this.component.propriedades={
        classe : classeEC
        
    };
	
	this.component.mudaCoisas = function(dados){
        this.p1 = this.children[0];
        this.p3 = this.children[1];
		this.p2 = this.children[2];
        this.p4 = this.children[3];
		this.p5 = this.children[4];
		this.p6 = this.children[5];
		this.p8 = this.children[6];
					
        if(dados["nome"]) this.p1.name = dados["nome"];
        if(dados["texto"]) this.p3.content = dados["texto"];

        if(dados["x"]) this.p1.bounds.x = dados["x"];
        if(dados["y"]) this.p1.bounds.y = dados["y"];

        if(dados["w"]) this.p1.bounds.width = dados["w"];
        if(dados["h"]) this.p1.bounds.height = dados["h"];
		
		if(dados["classe"]) this.propriedades["classe"] = dados["classe"]; 
	}; 
		
	this.component.getXML = function(){
        this.p1 = this.children[0];
        this.p3 = this.children[1];
		this.p2 = this.children[2];
        this.p4 = this.children[3];
		this.p5 = this.children[4];
		this.p6 = this.children[5];
		this.p8 = this.children[6];
			
		xml = "<EditableCollection id='"+ this.p1.name +"' text='" + this.p3.content + "' x='"+ this.p1.bounds.x +"' y='"+ this.p1.bounds.y + "' w='" + this.p1.bounds.width + "' h='" +this.p1.bounds.height + "' classe='" + this.propriedades["classe"] + "'>\n" +
                "</EditableCollection> \n";
        return xml;
    };
	
		//novo GETs
	this.component.getX = function(){
		var x = this.p1.bounds.x;
		
		return x;
	};
	
	this.component.getY = function(){
		var y = this.p1.bounds.y;
		
		return y;
	};
	
	this.component.getWidth = function(){
		var w = this.p1.bounds.width;
		
		return w;
	};
	
	this.component.getHeight = function(){
		var h = this.p1.bounds.height;
		
		return h;
	};
    
    this.posicionaMenu = function(){
		var dados={
			y: 20,
			w: 300,
			h: 100
		};
		this.component.mudaCoisas(dados);
	};
};

//importar SelectableCollection
function impSelectableCollection(idSC, textoSC, classeSC, atributoSC, xSC, ySC, wSC, hSC){
	contador = contador + 1;
	contSelectableCollection = contSelectableCollection + 1;
	
    //rectangulo principal 
	this.p1 = new paper.Path.Rectangle(new paper.Point(xSC, ySC), new paper.Size(wSC, hSC));
    this.p1.strokeColor = "black";
    this.p1.name = idSC;

	this.p3 = new paper.PointText({		//texto e cor do texto
        content: textoSC,		
        fillColor: 'black',
		fontSize: 15
    });
	
	//quadrado  
	this.p5 = new paper.Path.Rectangle(new paper.Point(this.p1.bounds.x + 10, this.p1.bounds.y + 10), new paper.Size(40, 40));
    this.p5.strokeColor = "black";
    this.p5.name = "actmt_symbol";
	
	// linhas dentro do quadrado collection
	this.p8 = new paper.Path();
	this.p8.add(new paper.Point(this.p5.bounds.x + 7.5, this.p5.bounds.y + 25)); // primeiro ponto - vai buscar posi??o (bounds) de p1 - rectangulo e acresce 20 ao y (para baixo) 
	this.p8.add(new paper.Point(this.p5.bounds.x + 32.5, this.p5.bounds.y + 25)); // segundo ponto - vai buscar posi??o (bounds) de p1 - rectangulo e acresce 20 ao y (para baixo) e utiliza a width de p1 
	this.p8.strokeColor = "black";
	
	// linha da seta "/"
	this.p2 = new paper.Path();  
	this.p2.add(new paper.Point(this.p1.bounds.x + 3, this.p1.bounds.y + 55));
	this.p2.add(new paper.Point(this.p1.bounds.x + 20, this.p1.bounds.y + 25));
	this.p2.strokeColor = "black";
	this.p2.strokeWidth = 2;

	this.p3.point = leftTextos(			//alinhar texto ? esquerda
            this.p1.bounds.width-90, 20,
            this.p1.bounds.x, this.p1.bounds.y,
            this.p3.bounds.width, this.p3.bounds.height
            );
	
	//tri?ngulo - ponta da seta		
	var center = new paper.Point(this.p1.bounds.x + 22, this.p1.bounds.y + 26);
	var sides = 3;
	var radius = 6;
	this.p4 = new paper.Path.RegularPolygon(center, sides, radius);
	this.p4.fillColor = 'black';	
	this.p4.rotate(45);	

	// linha "-" 2
	this.p6 = new paper.Path();  
	this.p6.add(new paper.Point(this.p5.bounds.x + 15, this.p5.bounds.y + 10));
	this.p6.add(new paper.Point(this.p5.bounds.x + 32.5, this.p5.bounds.y + 10));
	this.p6.strokeColor = "black";
	this.p6.strokeWidth = 3;
	
	//NOVO 06-07-15
	// linha da lista
	
	this.s1 = new paper.Path();
	this.s1.strokeColor = 'black';
	this.s1.add(new paper.Point(this.p1.bounds.x + (this.p1.bounds.width/2)-19, this.p1.bounds.y + (this.p1.bounds.height)-25));
	this.s1.add(new paper.Point(this.p1.bounds.x + (this.p1.bounds.width/2), this.p1.bounds.y + (this.p1.bounds.height)-5));
	this.s1.add(new paper.Point(this.p1.bounds.x + (this.p1.bounds.width/2)+19, this.p1.bounds.y + (this.p1.bounds.height)-25));

	this.s2 = new paper.Path();
	this.s2.strokeColor = 'black';
	this.s2.add(new paper.Point(this.p1.bounds.x + (this.p1.bounds.width/2)-19, this.p1.bounds.y +(this.p1.bounds.height)-30));
	this.s2.add(new paper.Point(this.p1.bounds.x + (this.p1.bounds.width/2), this.p1.bounds.y + (this.p1.bounds.height)-10));
	this.s2.add(new paper.Point(this.p1.bounds.x + (this.p1.bounds.width/2)+19, this.p1.bounds.y + (this.p1.bounds.height)-30));

	this.s3 = new paper.Path();
	this.s3.strokeColor = 'black';
	this.s3.add(new paper.Point(this.p1.bounds.x + (this.p1.bounds.width/2)-19, this.p1.bounds.y +(this.p1.bounds.height)-35));
	this.s3.add(new paper.Point(this.p1.bounds.x + (this.p1.bounds.width/2), this.p1.bounds.y + (this.p1.bounds.height)-15));
	this.s3.add(new paper.Point(this.p1.bounds.x + (this.p1.bounds.width/2)+19, this.p1.bounds.y + (this.p1.bounds.height)-35));
			
	this.component = new paper.Group([this.p1, this.p3, this.p2, this.p4, this.p5, this.p6, this.p8, this.s1, this.s2, this.s3]);
    this.component.data ={
            nome:true,
            texto:true,
            size:0,
			classe:true
    };
	
	this.component.propriedades={
        classe : classeSC,
		atributo : " "
        
    };
	
	this.component.mudaCoisas = function(dados){
        this.p1 = this.children[0];
        this.p3 = this.children[1];
		this.p2 = this.children[2];
        this.p4 = this.children[3];
		this.p5 = this.children[4];
		this.p6 = this.children[5];
		this.p8 = this.children[6];
		
		this.s1 = this.children[7];
		this.s2 = this.children[8];
		this.s3 = this.children[9];
					
        if(dados["nome"]) this.p1.name = dados["nome"];
        if(dados["texto"]) this.p3.content = dados["texto"];

        if(dados["x"]) this.p1.bounds.x = dados["x"];
        if(dados["y"]) this.p1.bounds.y = dados["y"];

        if(dados["w"]) this.p1.bounds.width = dados["w"];
        if(dados["h"]) this.p1.bounds.height = dados["h"];
		
		if(dados["classe"]) this.propriedades["classe"] = dados["classe"]; 
		if(dados["atributo"]) this.propriedades["atributo"] = dados["atributo"]; 
		
				//ALTERA??O DA POSI??O DOS TRI?NGULOS AQUI
		// Fazer uma c?pia dos tri?ngulos
		this.s1copy = this.s1.clone();
		this.s2copy = this.s2.clone();
		this.s3copy = this.s3.clone();
		
		// mover a c?pia para o centro e fundo do elemnto
		this.s1copy.position = new paper.Point(this.p1.bounds.x + ((this.p1.bounds.width)/2), this.p1.bounds.y + (this.p1.bounds.height)-20);
		this.s2copy.position = new paper.Point(this.p1.bounds.x + ((this.p1.bounds.width)/2), this.p1.bounds.y + (this.p1.bounds.height)-25);
		this.s3copy.position = new paper.Point(this.p1.bounds.x + ((this.p1.bounds.width)/2), this.p1.bounds.y + (this.p1.bounds.height)-30);
				
		//remover o original
		this.s1.remove();
		this.s2.remove();
		this.s3.remove();
	}; 
		
	this.component.getXML = function(){
        this.p1 = this.children[0];
        this.p3 = this.children[1];
		this.p2 = this.children[2];
        this.p4 = this.children[3];
		this.p5 = this.children[4];
		this.p6 = this.children[5];
		this.p8 = this.children[6];
			
		xml = "<ViewListS id='"+ this.p1.name +"' text='" + this.p3.content + "' x='"+ this.p1.bounds.x +"' y='"+ this.p1.bounds.y + "' w='" + this.p1.bounds.width + "' h='" +this.p1.bounds.height + "' classe='" + this.propriedades["classe"] + "'>\n" +
                "</ViewListS> \n";
        return xml;
    };
	
    this.component.getElement = function(doc){    	
        this.p1 = this.children[0];
        this.p3 = this.children[1];
		this.p2 = this.children[2];
        this.p4 = this.children[3];
		this.p5 = this.children[4];
		this.p6 = this.children[5];
		this.p8 = this.children[6];
		this.s1 = this.children[7];
		this.s2 = this.children[8];
		this.s3 = this.children[9];
		
		var element = doc.createElement("ViewListS");
		element.setAttribute("id", this.p1.name);
		element.setAttribute("text", this.p3.content);
		element.setAttribute("x", this.p1.bounds.x);
		element.setAttribute("y", this.p1.bounds.y);
		element.setAttribute("w", this.p1.bounds.width);
		element.setAttribute("h", this.p1.bounds.height);
		element.setAttribute("classe", this.propriedades["classe"]);		
        return element;
    };	
	
    var type = TYPES.INTERACTION_BLOCK;
	this.component.getType = function(){		
		return type;
	};	
	
	//novo GETs
	this.component.getX = function(){
		var x = this.p1.bounds.x;
		
		return x;
	};
	
	this.component.getY = function(){
		var y = this.p1.bounds.y;
		
		return y;
	};
	
	this.component.getWidth = function(){
		var w = this.p1.bounds.width;
		
		return w;
	};
	
	this.component.getHeight = function(){
		var h = this.p1.bounds.height;
		
		return h;
	};
    
    this.posicionaMenu = function(){
		var dados={
			y: 20,
			w: 300,
			h: 100
		};
		this.component.mudaCoisas(dados);
	};
};

//importar SelectableCollection
function impSelectableCollection2(idSC, textoSC, classeSC, atributoSC, xSC, ySC, wSC, hSC){
	contador = contador + 1;
	contSelectableCollection = contSelectableCollection + 1;
	
    //rectangulo principal 
	this.p1 = new paper.Path.Rectangle(new paper.Point(xSC, ySC), new paper.Size(wSC, hSC));
    this.p1.strokeColor = "black";
    this.p1.name = idSC;

	this.p3 = new paper.PointText({		//texto e cor do texto
        content: textoSC,		
        fillColor: 'black',
		fontSize: 15
    });
	
	//quadrado  
	this.p5 = new paper.Path.Rectangle(new paper.Point(this.p1.bounds.x + 10, this.p1.bounds.y + 10), new paper.Size(40, 40));
    this.p5.strokeColor = "black";
    this.p5.name = "actmt_symbol";
	
	// linhas dentro do quadrado collection
	this.p8 = new paper.Path();
	this.p8.add(new paper.Point(this.p5.bounds.x + 7.5, this.p5.bounds.y + 25)); // primeiro ponto - vai buscar posi??o (bounds) de p1 - rectangulo e acresce 20 ao y (para baixo) 
	this.p8.add(new paper.Point(this.p5.bounds.x + 32.5, this.p5.bounds.y + 25)); // segundo ponto - vai buscar posi??o (bounds) de p1 - rectangulo e acresce 20 ao y (para baixo) e utiliza a width de p1 
	this.p8.strokeColor = "black";
	
	// linha da seta "/"
	this.p2 = new paper.Path();  
	this.p2.add(new paper.Point(this.p1.bounds.x + 3, this.p1.bounds.y + 55));
	this.p2.add(new paper.Point(this.p1.bounds.x + 20, this.p1.bounds.y + 25));
	this.p2.strokeColor = "black";
	this.p2.strokeWidth = 2;

	this.p3.point = leftTextos(			//alinhar texto ? esquerda
            this.p1.bounds.width-90, 20,
            this.p1.bounds.x, this.p1.bounds.y,
            this.p3.bounds.width, this.p3.bounds.height
            );
	
	//tri?ngulo - ponta da seta		
	var center = new paper.Point(this.p1.bounds.x + 22, this.p1.bounds.y + 26);
	var sides = 3;
	var radius = 6;
	this.p4 = new paper.Path.RegularPolygon(center, sides, radius);
	this.p4.fillColor = 'black';	
	this.p4.rotate(45);	

	// linha "-" 2
	this.p6 = new paper.Path();  
	this.p6.add(new paper.Point(this.p5.bounds.x + 15, this.p5.bounds.y + 10));
	this.p6.add(new paper.Point(this.p5.bounds.x + 32.5, this.p5.bounds.y + 10));
	this.p6.strokeColor = "black";
	this.p6.strokeWidth = 3;
	
	//NOVO 06-07-15
	// linha da lista
	
	this.s1 = new paper.Path();
	this.s1.strokeColor = 'black';
	this.s1.add(new paper.Point(this.p1.bounds.x + (this.p1.bounds.width/2)-19, this.p1.bounds.y + (this.p1.bounds.height)-25));
	this.s1.add(new paper.Point(this.p1.bounds.x + (this.p1.bounds.width/2), this.p1.bounds.y + (this.p1.bounds.height)-5));
	this.s1.add(new paper.Point(this.p1.bounds.x + (this.p1.bounds.width/2)+19, this.p1.bounds.y + (this.p1.bounds.height)-25));

	this.s2 = new paper.Path();
	this.s2.strokeColor = 'black';
	this.s2.add(new paper.Point(this.p1.bounds.x + (this.p1.bounds.width/2)-19, this.p1.bounds.y +(this.p1.bounds.height)-30));
	this.s2.add(new paper.Point(this.p1.bounds.x + (this.p1.bounds.width/2), this.p1.bounds.y + (this.p1.bounds.height)-10));
	this.s2.add(new paper.Point(this.p1.bounds.x + (this.p1.bounds.width/2)+19, this.p1.bounds.y + (this.p1.bounds.height)-30));

	this.s3 = new paper.Path();
	this.s3.strokeColor = 'black';
	this.s3.add(new paper.Point(this.p1.bounds.x + (this.p1.bounds.width/2)-19, this.p1.bounds.y +(this.p1.bounds.height)-35));
	this.s3.add(new paper.Point(this.p1.bounds.x + (this.p1.bounds.width/2), this.p1.bounds.y + (this.p1.bounds.height)-15));
	this.s3.add(new paper.Point(this.p1.bounds.x + (this.p1.bounds.width/2)+19, this.p1.bounds.y + (this.p1.bounds.height)-35));
			
	this.component = new paper.Group([this.p1, this.p3, this.p2, this.p4, this.p5, this.p6, this.p8, this.s1, this.s2, this.s3]);
    this.component.data ={
            nome:true,
            texto:true,
            size:0,
			classe:true
    };
	
	this.component.propriedades={
        classe : classeSC,
		atributo : " "
        
    };
	
	this.component.mudaCoisas = function(dados){
        this.p1 = this.children[0];
        this.p3 = this.children[1];
		this.p2 = this.children[2];
        this.p4 = this.children[3];
		this.p5 = this.children[4];
		this.p6 = this.children[5];
		this.p8 = this.children[6];
		
		this.s1 = this.children[7];
		this.s2 = this.children[8];
		this.s3 = this.children[9];
					
        if(dados["nome"]) this.p1.name = dados["nome"];
        if(dados["texto"]) this.p3.content = dados["texto"];

        if(dados["x"]) this.p1.bounds.x = dados["x"];
        if(dados["y"]) this.p1.bounds.y = dados["y"];

        if(dados["w"]) this.p1.bounds.width = dados["w"];
        if(dados["h"]) this.p1.bounds.height = dados["h"];
		
		if(dados["classe"]) this.propriedades["classe"] = dados["classe"]; 
		if(dados["atributo"]) this.propriedades["atributo"] = dados["atributo"]; 
		
				//ALTERA??O DA POSI??O DOS TRI?NGULOS AQUI
		// Fazer uma c?pia dos tri?ngulos
		this.s1copy = this.s1.clone();
		this.s2copy = this.s2.clone();
		this.s3copy = this.s3.clone();
		
		// mover a c?pia para o centro e fundo do elemnto
		this.s1copy.position = new paper.Point(this.p1.bounds.x + ((this.p1.bounds.width)/2), this.p1.bounds.y + (this.p1.bounds.height)-20);
		this.s2copy.position = new paper.Point(this.p1.bounds.x + ((this.p1.bounds.width)/2), this.p1.bounds.y + (this.p1.bounds.height)-25);
		this.s3copy.position = new paper.Point(this.p1.bounds.x + ((this.p1.bounds.width)/2), this.p1.bounds.y + (this.p1.bounds.height)-30);
				
		//remover o original
		this.s1.remove();
		this.s2.remove();
		this.s3.remove();
	}; 
		
	this.component.getXML = function(){
        this.p1 = this.children[0];
        this.p3 = this.children[1];
		this.p2 = this.children[2];
        this.p4 = this.children[3];
		this.p5 = this.children[4];
		this.p6 = this.children[5];
		this.p8 = this.children[6];
			
		xml = "<ViewRelatedListS id='"+ this.p1.name +"' text='" + this.p3.content + "' x='"+ this.p1.bounds.x +"' y='"+ this.p1.bounds.y + "' w='" + this.p1.bounds.width + "' h='" +this.p1.bounds.height + "' classe='" + this.propriedades["classe"] + "'>\n" +
                "</ViewRelatedListS> \n";
        return xml;
    };
	
    this.component.getElement = function(doc){    	
        this.p1 = this.children[0];
        this.p3 = this.children[1];
		this.p2 = this.children[2];
        this.p4 = this.children[3];
		this.p5 = this.children[4];
		this.p6 = this.children[5];
		this.p8 = this.children[6];
		
		var element = doc.createElement("ViewRelatedListS");
		element.setAttribute("id", this.p1.name);
		element.setAttribute("text", this.p3.content);
		element.setAttribute("x", this.p1.bounds.x);
		element.setAttribute("y", this.p1.bounds.y);
		element.setAttribute("w", this.p1.bounds.width);
		element.setAttribute("h", this.p1.bounds.height);
		element.setAttribute("classe", this.propriedades["classe"]);		
        return element;
    };	
	
    var type = TYPES.INTERACTION_BLOCK;
	this.component.getType = function(){		
		return type;
	};
		
	//novo GETs
	this.component.getX = function(){
		var x = this.p1.bounds.x;
		
		return x;
	};
	
	this.component.getY = function(){
		var y = this.p1.bounds.y;
		
		return y;
	};
	
	this.component.getWidth = function(){
		var w = this.p1.bounds.width;
		
		return w;
	};
	
	this.component.getHeight = function(){
		var h = this.p1.bounds.height;
		
		return h;
	};
    
    this.posicionaMenu = function(){
		var dados={
			y: 20,
			w: 300,
			h: 100
		};
		this.component.mudaCoisas(dados);
	};
};

//importar SelectableActionSet
function impSelectableActionSet(idSAS, textoSAS, classeSAS, atributoSAS, xSAS, ySAS, wSAS, hSAS){
	contador = contador + 1;
	contSelectableActionSet = contSelectableActionSet + 1;
	
    //rectangulo principal 
	this.p1 = new paper.Path.Rectangle(new paper.Point(xSAS, ySAS), new paper.Size(wSAS, hSAS));
    this.p1.strokeColor = "black";
    this.p1.name = idSAS;

	this.p3 = new paper.PointText({		//texto e cor do texto
        content: textoSAS,		
        fillColor: 'black',
		fontSize: 14
    });
	
	//quadrado  
	this.p5 = new paper.Path.Rectangle(new paper.Point(this.p1.bounds.x + 10, this.p1.bounds.y + 10), new paper.Size(40, 40));
    this.p5.strokeColor = "black";
    this.p5.name = "actmt_symbol";
	
	// linhas dentro do quadrado collection
	this.p8 = new paper.Path();
	this.p8.add(new paper.Point(this.p5.bounds.x + 7.5, this.p5.bounds.y + 25)); // primeiro ponto - vai buscar posi??o (bounds) de p1 - rectangulo e acresce 20 ao y (para baixo) 
	this.p8.add(new paper.Point(this.p5.bounds.x + 32.5, this.p5.bounds.y + 25)); // segundo ponto - vai buscar posi??o (bounds) de p1 - rectangulo e acresce 20 ao y (para baixo) e utiliza a width de p1 
	this.p8.strokeColor = "black";
	
	// linha da seta "/"
	this.p2 = new paper.Path();  
	this.p2.add(new paper.Point(this.p1.bounds.x + 3, this.p1.bounds.y + 55));
	this.p2.add(new paper.Point(this.p1.bounds.x + 20, this.p1.bounds.y + 25));
	this.p2.strokeColor = "black";
	this.p2.strokeWidth = 2;

	this.p3.point = leftTextos(			//alinhar texto ? esquerda
            this.p1.bounds.width-90, 20,
            this.p1.bounds.x, this.p1.bounds.y,
            this.p3.bounds.width, this.p3.bounds.height
            );
			
	//tri?ngulo - ponta da seta		
	var center = new paper.Point(this.p1.bounds.x + 22, this.p1.bounds.y + 26);
	var sides = 3;
	var radius = 6;
	this.p4 = new paper.Path.RegularPolygon(center, sides, radius);
	this.p4.fillColor = 'black';	
	this.p4.rotate(45);	

	//circulo
	var center = new paper.Point(this.p5.bounds.x + 20, this.p5.bounds.y + 13);
	//var points = 5;
	var radius = 4;
	//var radius2 = 7;
	this.p6 = new paper.Path.Circle(center, radius);
	this.p6.fillColor = 'black';
		
	this.component = new paper.Group([this.p1, this.p3, this.p2, this.p4, this.p5, this.p6, this.p8]);
    this.component.data ={
            nome:true,
            texto:true,
            size:0,
			classe: true
    };
	
	this.component.propriedades={
        classe : classeSAS,
		atributo : " "
        
    };
	
	this.component.mudaCoisas = function(dados){
        this.p1 = this.children[0];
        this.p3 = this.children[1];
		this.p2 = this.children[2];
        this.p4 = this.children[3];
		this.p5 = this.children[4];
		this.p6 = this.children[5];
		this.p8 = this.children[6];
					
        if(dados["nome"]) this.p1.name = dados["nome"];
        if(dados["texto"]) this.p3.content = dados["texto"];

        if(dados["x"]) this.p1.bounds.x = dados["x"];
        if(dados["y"]) this.p1.bounds.y = dados["y"];

        if(dados["w"]) this.p1.bounds.width = dados["w"];
        if(dados["h"]) this.p1.bounds.height = dados["h"];
		
		if(dados["classe"]) this.propriedades["classe"] = dados["classe"]; 
		if(dados["atributo"]) this.propriedades["atributo"] = dados["atributo"]; 
	}; 
		
	this.component.getXML = function(){
        this.p1 = this.children[0];
        this.p3 = this.children[1];
		this.p2 = this.children[2];
        this.p4 = this.children[3];
		this.p5 = this.children[4];
		this.p6 = this.children[5];
		this.p8 = this.children[6];
			
		xml = "<Menu id='"+ this.p1.name +"' text='" + this.p3.content + "' x='"+ this.p1.bounds.x +"' y='"+ this.p1.bounds.y + "' w='" + this.p1.bounds.width + "' h='" +this.p1.bounds.height + "' classe='" + this.propriedades["classe"] + "'>\n" +
                "</Menu> \n";
        return xml;
    };
	
    this.component.getElement = function(doc){    	
        this.p1 = this.children[0];
        this.p3 = this.children[1];
		this.p2 = this.children[2];
        this.p4 = this.children[3];
		this.p5 = this.children[4];
		this.p6 = this.children[5];
		this.p8 = this.children[6];
		
		var element = doc.createElement("Menu");
		element.setAttribute("id", this.p1.name);
		element.setAttribute("text", this.p3.content);
		element.setAttribute("x", this.p1.bounds.x);
		element.setAttribute("y", this.p1.bounds.y);
		element.setAttribute("w", this.p1.bounds.width);
		element.setAttribute("h", this.p1.bounds.height);
		element.setAttribute("classe", this.propriedades["classe"]);		
        return element;
    };	
	
    var type = TYPES.MENU;
	this.component.getType = function(){		
		return type;
	};	
	
	//novo GETs
	this.component.getX = function(){
		var x = this.p1.bounds.x;
		
		return x;
	};
	
	this.component.getY = function(){
		var y = this.p1.bounds.y;
		
		return y;
	};
	
	this.component.getWidth = function(){
		var w = this.p1.bounds.width;
		
		return w;
	};
	
	this.component.getHeight = function(){
		var h = this.p1.bounds.height;
		
		return h;
	};
    
    this.posicionaMenu = function(){
		var dados={
			y: 20,
			w: 300,
			h: 100
		};
		this.component.mudaCoisas(dados);
	};
};

var mySelectableViewSet = function(){ 
	contador = contador + 1;
	contSelectableViewSet = contSelectableViewSet + 1;

    //rectangulo principal 
	this.p1 = new paper.Path.Rectangle(new paper.Point(200, 180), new paper.Size(200, 60));
    this.p1.strokeColor = "black";
    this.p1.name = "selectableviewset" + contSelectableViewSet;

	this.p3 = new paper.PointText({		//texto e cor do texto
        content: 'Selectable View Set',		
        fillColor: 'black',
		fontSize: 14
    });
	
	//quadrado  
	this.p5 = new paper.Path.Rectangle(new paper.Point(this.p1.bounds.x + 10, this.p1.bounds.y + 10), new paper.Size(40, 40));
    this.p5.strokeColor = "black";
    this.p5.name = "selectableviewset_symbol";
	
	// linhas dentro do quadrado collection
	this.p8 = new paper.Path();
	this.p8.add(new paper.Point(this.p5.bounds.x + 7.5, this.p5.bounds.y + 25)); // primeiro ponto - vai buscar posi??o (bounds) de p1 - rectangulo e acresce 20 ao y (para baixo) 
	this.p8.add(new paper.Point(this.p5.bounds.x + 32.5, this.p5.bounds.y + 25)); // segundo ponto - vai buscar posi??o (bounds) de p1 - rectangulo e acresce 20 ao y (para baixo) e utiliza a width de p1 
	this.p8.strokeColor = "black";
	
	// linha da seta "/"
	this.p2 = new paper.Path();  
	this.p2.add(new paper.Point(this.p1.bounds.x + 3, this.p1.bounds.y + 55));
	this.p2.add(new paper.Point(this.p1.bounds.x + 20, this.p1.bounds.y + 25));
	this.p2.strokeColor = "black";
	this.p2.strokeWidth = 2;

	this.p3.point = leftTextos(			//alinhar texto ? esquerda
            this.p1.bounds.width-90, 20,
            this.p1.bounds.x, this.p1.bounds.y,
            this.p3.bounds.width, this.p3.bounds.height
            );
	
	//tri?ngulo - ponta da seta		
	var center = new paper.Point(this.p1.bounds.x + 22, this.p1.bounds.y + 26);
	var sides = 3;
	var radius = 6;
	this.p4 = new paper.Path.RegularPolygon(center, sides, radius);
	this.p4.fillColor = 'black';	
	this.p4.rotate(45);	
		
	//quadrado
	this.p6 = new paper.Path.Rectangle(new paper.Point(this.p5.bounds.x + 17, this.p5.bounds.y + 8), new paper.Size(9, 9));
    this.p6.strokeColor = "black"; 
	
	this.component = new paper.Group([this.p1, this.p3, this.p2, this.p4, this.p5, this.p6, this.p8]);
    this.component.data ={
            nome:true,
            texto:true,
            size:0,
			classe: true
    };
	
	this.component.propriedades={
        classe : ""
        
    };
	
	this.component.mudaCoisas = function(dados){
        this.p1 = this.children[0];
        this.p3 = this.children[1];
		this.p2 = this.children[2];
        this.p4 = this.children[3];
		this.p5 = this.children[4];
		this.p6 = this.children[5];
		this.p8 = this.children[6];
					
        if(dados["nome"]) this.p1.name = dados["nome"];
        if(dados["texto"]) this.p3.content = dados["texto"];

        if(dados["x"]) this.p1.bounds.x = dados["x"];
        if(dados["y"]) this.p1.bounds.y = dados["y"];

        if(dados["w"]) this.p1.bounds.width = dados["w"];
        if(dados["h"]) this.p1.bounds.height = dados["h"];
		
		if(dados["classe"]) this.propriedades["classe"] = dados["classe"]; 
	}; 
		
		
	//J? n?o faz falta!!!
	this.component.getXML = function(){
        this.p1 = this.children[0];
        this.p3 = this.children[1];
		this.p2 = this.children[2];
        this.p4 = this.children[3];
		this.p5 = this.children[4];
		this.p6 = this.children[5];
		this.p8 = this.children[6];
			
		xml = "<SelectableViewSet id='"+ this.p1.name +"' text='" + this.p3.content + "' x='"+ this.p1.bounds.x +"' y='"+ this.p1.bounds.y + "' w='" + this.p1.bounds.width + "' h='" +this.p1.bounds.height + "' classe='" + this.propriedades["classe"] + "'>\n" +
                "</SelectableViewSet> \n";
        return xml;
    };
	
		//novo GETs
	this.component.getX = function(){
		var x = this.p1.bounds.x;
		
		return x;
	};
	
	this.component.getY = function(){
		var y = this.p1.bounds.y;
		
		return y;
	};
	
	this.component.getWidth = function(){
		var w = this.p1.bounds.width;
		
		return w;
	};
	
	this.component.getHeight = function(){
		var h = this.p1.bounds.height;
		
		return h;
	};
	
	//NOVO 08-04-2015
	this.component.getTipo = function(){
		var t = this.p5.name;
		
		return t;
	};
    
    this.posicionaMenu = function(){
		var dados={
			y: 20,
			w: 300,
			h: 100
		};
		this.component.mudaCoisas(dados);
	};
};

//importar SelectableViewSet
function impSelectableViewSet(idSVS, textoSVS, classeSVS, xSVS, ySVS, wSVS, hSVS){
	contador = contador + 1;
	contSelectableViewSet = contSelectableViewSet + 1;

    //rectangulo principal 
	this.p1 = new paper.Path.Rectangle(new paper.Point(xSGT, ySVS), new paper.Size(wSVS, hSVS));
    this.p1.strokeColor = "black";
    this.p1.name = idSVS;

	this.p3 = new paper.PointText({		//texto e cor do texto
        content: textoSVS,		
        fillColor: 'black',
		fontSize: 14
    });
	
	//quadrado  
	this.p5 = new paper.Path.Rectangle(new paper.Point(this.p1.bounds.x + 10, this.p1.bounds.y + 10), new paper.Size(40, 40));
    this.p5.strokeColor = "black";
    this.p5.name = "actmt_symbol";
	
	// linhas dentro do quadrado collection
	this.p8 = new paper.Path();
	this.p8.add(new paper.Point(this.p5.bounds.x + 7.5, this.p5.bounds.y + 25)); // primeiro ponto - vai buscar posi??o (bounds) de p1 - rectangulo e acresce 20 ao y (para baixo) 
	this.p8.add(new paper.Point(this.p5.bounds.x + 32.5, this.p5.bounds.y + 25)); // segundo ponto - vai buscar posi??o (bounds) de p1 - rectangulo e acresce 20 ao y (para baixo) e utiliza a width de p1 
	this.p8.strokeColor = "black";
	
	// linha da seta "/"
	this.p2 = new paper.Path();  
	this.p2.add(new paper.Point(this.p1.bounds.x + 3, this.p1.bounds.y + 55));
	this.p2.add(new paper.Point(this.p1.bounds.x + 20, this.p1.bounds.y + 25));
	this.p2.strokeColor = "black";
	this.p2.strokeWidth = 2;

	this.p3.point = leftTextos(			//alinhar texto ? esquerda
            this.p1.bounds.width-90, 20,
            this.p1.bounds.x, this.p1.bounds.y,
            this.p3.bounds.width, this.p3.bounds.height
            );
	
	//tri?ngulo - ponta da seta		
	var center = new paper.Point(this.p1.bounds.x + 22, this.p1.bounds.y + 26);
	var sides = 3;
	var radius = 6;
	this.p4 = new paper.Path.RegularPolygon(center, sides, radius);
	this.p4.fillColor = 'black';	
	this.p4.rotate(45);	
		
	//quadrado
	this.p6 = new paper.Path.Rectangle(new paper.Point(this.p5.bounds.x + 17, this.p5.bounds.y + 8), new paper.Size(9, 9));
    this.p6.strokeColor = "black"; 
	
	this.component = new paper.Group([this.p1, this.p3, this.p2, this.p4, this.p5, this.p6, this.p8]);
    this.component.data ={
            nome:true,
            texto:true,
            size:0,
			classe: true
    };
	
	this.component.propriedades={
        classe : classeSVS
        
    };
	
	this.component.mudaCoisas = function(dados){
        this.p1 = this.children[0];
        this.p3 = this.children[1];
		this.p2 = this.children[2];
        this.p4 = this.children[3];
		this.p5 = this.children[4];
		this.p6 = this.children[5];
		this.p8 = this.children[6];
					
        if(dados["nome"]) this.p1.name = dados["nome"];
        if(dados["texto"]) this.p3.content = dados["texto"];

        if(dados["x"]) this.p1.bounds.x = dados["x"];
        if(dados["y"]) this.p1.bounds.y = dados["y"];

        if(dados["w"]) this.p1.bounds.width = dados["w"];
        if(dados["h"]) this.p1.bounds.height = dados["h"];
		
		if(dados["classe"]) this.propriedades["classe"] = dados["classe"]; 
	}; 
		
		
	//J? n?o faz falta!!!
	this.component.getXML = function(){
        this.p1 = this.children[0];
        this.p3 = this.children[1];
		this.p2 = this.children[2];
        this.p4 = this.children[3];
		this.p5 = this.children[4];
		this.p6 = this.children[5];
		this.p8 = this.children[6];
			
		xml = "<SelectableViewSet id='"+ this.p1.name +"' text='" + this.p3.content + "' x='"+ this.p1.bounds.x +"' y='"+ this.p1.bounds.y + "' w='" + this.p1.bounds.width + "' h='" +this.p1.bounds.height + "' classe='" + this.propriedades["classe"] + "'>\n" +
                "</SelectableViewSet> \n";
        return xml;
    };
	
		//novo GETs
	this.component.getX = function(){
		var x = this.p1.bounds.x;
		
		return x;
	};
	
	this.component.getY = function(){
		var y = this.p1.bounds.y;
		
		return y;
	};
	
	this.component.getWidth = function(){
		var w = this.p1.bounds.width;
		
		return w;
	};
	
	this.component.getHeight = function(){
		var h = this.p1.bounds.height;
		
		return h;
	};
    
    this.posicionaMenu = function(){
		var dados={
			y: 20,
			w: 300,
			h: 100
		};
		this.component.mudaCoisas(dados);
	};
};
 
function leftTextos(wPai, hPai, xPai, yPai, wFilho, hFilho){
    posX = xPai + 60;
	posY = yPai + 35;
    
    return new paper.Point(posX, posY);
}