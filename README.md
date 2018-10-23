# Pyvalent

A drag-and-drop visual scripting language that will compile to Python, built using Electron and ReactJS. 
Modelled after Unreal Engine Blueprint. 

## Mission

You might be wondering, why Python? Isn't Python easy enough? Well, I mean yeah, but there isn't any good drag and drop alternative for young beginners (we're talking elementary, maybe middle school here). The best thing that I can find is Scratch (which is atrocious), so the mission of this project is to create a better alternative, where the program output is actually in a meaningful language (sorry, no company is going to hire you as a Scratch developer). 

The original project, Covalent, compiles to JavaScript/Node.js. As a developer, I find JavaScript to be annoying and outdated (seriously, go look at jQuery, Angular.js, Electron, all of these other tools necessary to fix web development), so I think Python is a better alternative.

Currently this is written in JavaScript and compiles out to Python. I might rewrite this to be all Pythonic in the future, you know.

This is a brand new open source project, and there is still a long way to go, but I hope that you will join us on this adventure.

Join our Discord! - https://discord.gg/VVBMWGG

## File Structure 
This is the folder structure of the project: 

    pyvalent/
    ├── engine/                       
    ├── menubar/
    ├── index.html 
    ├── main.js 
    ├── renderer.js  
    └── gulpfile.js    
    
  1. **Engine**: The engine will contains all the necessary components to create things on the canvas 
  2. **Menubar**: The menubar contains the tree structure to load menu files 
  3. **index.html**: will put together everything on the DOM interface (which is the black menu bar, the red menu bar), load the renderer.js, React and Babel 
  4. **main.js**: This is the modules to control application life and create native browser window (specify width, height, and create window of the application over here)
  5. **renderer.js**: this is the JS file that will first call the master parent class (listener.js), which in turn will create the canvas to draw the nodes on 
  6. **gulpfile.js**: Electron does not have built in live reload, so this project is utilizing gulp to re-render the browser everytime there is a change on the JavaScript file 


     

## Architecture of the Class 
There are currently 8 classes containing within this file, within the engine folder:  

    engine/
    ├── board.js                         # the board that contains all the node object, connectors and sockets 
    ├── connector-builder.js             # this build the connector between the two node 
    ├── connector.js                     # this is the class to create a connector 
    ├── listeners.js                     # this handle all event listeners (mousedown, mouseup..etc.) and is the root class 
    ├── node-builder.js                  # this build the node itself             
    ├── node-object.js                   # this is the class to create a node object itself 
    ├── searchbar.js                     # this is the searchbar to create a node, connector, socket...etc. 
    └── socket.js                        # this is the socket 
    
   
  1. **Node-object**: the most basic object of Covalent is a node, which can be interpreted as a function f(x). The node will contain arguments and returns (args can be intepreted as parameters of a function, returns are return of an argument). LeftExec and RightExec allow a node to keep track of the order of the Node Stack (e.g f(A) -> f(B)) so when a program execute, it knows to go from f(A) -> f(B). 
  2. **Node builder**: a node builder builds a node. It has a parseJSON method to parse the attributes of a node, and then draw the node onto the screen. 
  3. **Connector**: a connector links two node objects together. A connector contains a start point and an endpoint. 
  4. **Connector Builder**: a connector builder contains method to build a connector. It calculates the Belzier Curve in bezierCurveCalc(), and handle the logic to make sure that while a return can be map to multiple parameter, each parameter can only be map to one returns. 
  5. **Searchbar**: a searchbar contains the method to render a search bar every time user right click on the canvas, and it allows user to create node, connector onto the screen by choosing for menu attributes from the searchbar.
  6. **Listeners**: this is the master method that will get called when the Browser Window first open. The listener will render a board, then automatically call the method initEventListeners(), which listen for when user press on key or mouse. 

## To Use
```bash
# Clone this repository
git clone https://github.com/covalent-team/covalent.git 
# Go into the repository
cd covalent 
# Install dependencies
npm install 
npm install --global gulp-cli 
# Run the app
gulp 
```
Make sure you have [Gulp](https://github.com/gulpjs/gulp/blob/v3.9.1/docs/getting-started.md) installed both globally and locally. 

## Resources 
- Live Reload with Electron-Connect: https://github.com/Quramy/electron-connect  


## License

[CC0 1.0 (Public Domain)](LICENSE.md)
