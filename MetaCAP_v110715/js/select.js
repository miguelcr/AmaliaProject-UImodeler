
			var hitOptions = {
				segments: true,
				stroke: true,
				fill: true,
				tolerance: 5
			};
			
			var text,segment,path;
			var lastColor = '';
			
			function onMouseDown(event) {
				if(segment)	segment.strokeColor = lastColor;
				if(path)	path.strokeColor = lastColor;
				if(text)	text.strokeColor = lastColor;
				segment = path = text = null;
				var hitResult = project.hitTest(event.point, hitOptions	);
				if (!hitResult)
					return;

				if (event.modifiers.shift) {
					if (hitResult.type == 'segment') {
						hitResult.segment.remove();
					};
					return;
				}

				if (hitResult) {
					
					path = hitResult.item;
					path.selected = true;
					lastColor = path.strokeColor;
					path.strokeColor = 'red';
                    preencheValores(path.parent);
				}
				
			}

			function onMouseMove(event) {
				project.activeLayer.selected = false;
                               	if (event.item)
					event.item.selected = true;
			}
			
			function onMouseDrag(event) {
                                    if (path) {
					path.parent.position += event.delta;
					preencheValores(path.parent);
				}
			}

			var btnEliminar = document.getElementById( 'btn_apagar' );
           
 		    btnEliminar.onclick = function(){
                if(path) apagaME(path.parent);
            };

            var btnGravar = document.getElementById( 'btn_gravar' );
            
			btnGravar.onclick = function(){
                if(path) mudaME(path.parent);
            };