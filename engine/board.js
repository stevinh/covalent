//engine core
const path = require('path');
const nodebuilder = require(path.join(__dirname, '/node-builder.js'));
const node = require(path.join(__dirname, '/node-object.js'));
const connectorbuilder = require(path.join(__dirname, '/connector-builder.js'));
const connector = require(path.join(__dirname, '/connector.js'));
const fraction = require('fractional').Fraction;
var exports = module.exports = {};

// This function create the board to draw the reactangles on 
class Board{
	constructor(){
	
		// Canvas components 
		this.canvas = document.createElement('canvas');
		document.body.appendChild(this.canvas);
		this.context = this.canvas.getContext('2d');

		// Stack componnets 
		this.nodeStack = [];
		this.connectorStack = [];

		//  Zoom and drag state components  
		this.zoom = 1;
		this.inverseZoom = 1;
		this.dragState = {
			clicked: false,
			isSocket: false,
			global: true,
			node: null
		};


		//  Node and connectors variables  
		this.connectionStarted = {
			bool: false,
		};

		// Node builder, connector builder, and search bar 
		this.nodeBuilder = nodebuilder.create(this.context);
		this.connectorBuilder = connectorbuilder.create(this.context);
		
		// Set canvas width and height. 
		this.canvas.width  = document.body.clientWidth;
		this.canvas.height = document.documentElement.scrollHeight; 
		  
		// Set instances to child class 
		this.connectorBuilder.setConnectorBuilderInstance(this.nodeBuilder, this.nodeStack);  

		// Refresh the board 
		this.tick();
	}

	// Return the context of the canvas 
	getContext(){
		return this.context;
	}

	// This method add a node item to stack 
	addToStack(node){
		var index = this.nodeStack.length;
		node.setNodeIndex(index);
		this.nodeStack.push(node);
		this.tick(); 
	}

	// Refresh the board everytime user moves the mouse 
	tick(){
		this.clear();
		this.update();
		this.render();
	}

	// Return the x and y coordinate of the mouse on the screen 
	getMouse(){
		return {
			x: this.mouseX,
			y: this.mouseY
		};
	}

	// Set the position x and y coordinate of the mouse on the screen 
	setMouse(x,y, diffMouse){
		this.mouseX = x;
		this.mouseY = y;
		this.diffMouse = diffMouse;
	}

	update() {
	}

	// Get the inverse of a decimal 
	getInverse(decimal){
		var f = new fraction(decimal);
		return f.denominator/f.numerator;
	}

	
	// Collision Handling Function 
  collisonHandling(loc, type, i){

		// Loc Type Dictionary 
		var locTypeDict = {
			'args': [loc.args, true],
			'returns': [loc.returns, false], 
			'leftExec': [loc.leftExec, true], 
			'rightExec': [loc.rightExec, false]
		}
		var locType = locTypeDict[type][0]; 
		var isReversedVal = locTypeDict[type][1];
		var j;  

		for (j in locType){

				// Set drag state location 
				if (type == 'args' || type == 'returns'){
					var xVal = locType[j].x; 
					var yVal = locType[j].y; 
					var xBound = locType[j].radius; 
					var yBound = locType[j].radius; 
				} else if (type == 'leftExec' || type == 'rightExec') {
					var xVal = locType[j].x + (locType[j].width/2); 
					var yVal = locType[j].y + (locType[j].height/2); 
					var xBound = locType[j].width; 
					var yBound = locType[j].height; 
				}


			if(this.mouseX >= locType[j].x - xBound && this.mouseX <= locType[j].x + xBound){
				if(this.mouseY >= locType[j].y - yBound && this.mouseY <= locType[j].y + yBound ){

					// Set drag state 
					this.dragState.nodeIndex = i;
					this.dragState.socketType = type;
					this.dragState.global = false;
					this.dragState.isSocket = true;
					this.dragState.socketIndex = j;

					// Set socket location; 
					this.dragState.socketLocation = {
						x: xVal, y: yVal,
						isReversed: isReversedVal
					};
					return;
				}
			}
		}

	}	

	// Global node or drag function 
	globalOrNodeDrag(){
		for(var i in this.nodeStack){
			var loc = this.nodeBuilder.getHitZones(this.nodeStack[i].getJSON());
			console.log("loc",loc);

			this.collisonHandling(loc, 'args', i); 
			this.collisonHandling(loc, 'returns', i); 
			this.collisonHandling(loc, 'leftExec', i); 
			this.collisonHandling(loc, 'rightExec', i); 

			if(this.mouseX >= loc.x && this.mouseX <= loc.x + loc.width){
				if(this.mouseY >= loc.y && this.mouseY <= loc.y + loc.height){
					this.dragState.node = this.nodeStack[i];
					this.dragState.global = false;
					return;
				}
			}
		}
	}

	moveNode(node){
		node.addRelativeXY(this.diffMouse.x * this.inverseZoom, this.diffMouse.y * this.inverseZoom);
	}


	// This function render things on the screen 
	render() {

		if (this.dragState.clicked && !this.dragState.global && !this.dragState.isSocket){
			this.moveNode(this.dragState.node);	 // If dragged body of node (not sockets), then drag the node around
		} else if (this.dragState.clicked && !this.dragState.global && this.dragState.isSocket){
			this.spawnConnector(); 	            // If a socket is dragged, spawn connector 
		} else if(!this.dragState.clicked && !this.dragState.global && this.dragState.isSocket){
			this.attachConnector(); 	          // If button released on a socket, and connector was started, then attach it
		}

		// Draw the connector onto the screen and nod stack 
		this.connectorBuilder.buildConnectorOnScreen(this.connectorStack); 
		this.drawNodeStack(); 
	}


	spawnConnector(){
		this.context.beginPath();
		var socketLoc = this.dragState.socketLocation;
		this.connectionStarted.bool = true;
		this.connectionStarted.info = this.dragState;
		var start = {x: socketLoc.x, y: socketLoc.y};
		var end = {x: this.mouseX, y: this.mouseY};
		this.connectorBuilder.makeConnector(start, end, socketLoc.isReversed);
		this.context.stroke();
	}


	attachConnector(){
		if(this.connectionStarted.bool == true){
			var startSoc = this.connectionStarted.info;

			// Start and end needs to have {node, socket, }
			var start = {
				nodeIndex: startSoc.nodeIndex, 
				socketIndex: startSoc.socketIndex, 
				socketType: startSoc.socketType
			};

			var end = {
				nodeIndex: this.dragState.nodeIndex, 
				socketIndex: this.dragState.socketIndex, 
				socketType: this.dragState.socketType
			};

			//validate if can connect to this socket
			if(start.nodeIndex == end.nodeIndex && start.socketIndex == end.socketIndex){
				console.log("same place, dont");
			}
			else if(start.socketType == end.socketType){
				console.log("both sockets are the same type");
			}
			else if(start.socketType == 'leftExec' && end.socketType != 'rightExec'){
				console.log("execs must be connected to eachother");
			}
			else if(start.socketType == 'rightExec' && end.socketType != 'leftExec'){
				console.log("execs must be connected to eachother");
			}
			else if(start.socketType == 'returns' && end.socketType != 'args'){
				console.log("returns must only connect to args");
			}
			else if(start.socketType == 'args' && end.socketType != 'returns'){
				console.log("returns must only connect to args");
			}


			//if validated, connect!
			else{
				this.nodeStack[start.nodeIndex].addConnector(start.socketType, start.socketIndex);
				this.nodeStack[end.nodeIndex].addConnector(end.socketType, end.socketIndex);
				var newConnector = connector.create(start, end, startSoc.socketLocation.isReversed);
				this.connectorStack.push(newConnector);
				console.log("connectorStack", this.connectorStack);
			}
			this.connectionStarted.bool = false;
			this.resetDragState();
		}
	}

	drawNodeStack(){
		for(var i in this.nodeStack){
			var obj = this.nodeStack[i].getJSON();

			//if clicked on global stuff
			if(this.dragState.clicked && this.dragState.global && !this.dragState.isSocket){
				this.moveNode(this.nodeStack[i]);
			}
			this.nodeBuilder.addZoom(this.zoom);
			this.nodeBuilder.parseJSON(obj);
		}
	}

	

	clear() {
		this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
	}

	// Zooming functions 
	mouseWheelZoom(e){
		var value;
		if(e.deltaY > 0){
			if(this.zoom > 0.5){
				if(this.zoom >= 0){
					this.zoom -= 0.10;
				}else{
					this.zoom -= 0.05;
				}
			}
		}else if(e.deltaY < 0){
			if(this.zoom < 2){
				if(this.zoom <= 0){
					this.zoom += 0.05;
				}else{
					this.zoom += 0.10;
				}
			}
		}
		this.zoom = Math.round(this.zoom * 100) / 100;
		this.inverseZoom = this.getInverse(this.zoom);
		this.render();
	}

	resetDragState(){
		this.dragState = {
			clicked: false,
			global: true,
			isSocket: false,
			node: null
		};
	}
}

exports.create = function(){
	return new Board();
}


