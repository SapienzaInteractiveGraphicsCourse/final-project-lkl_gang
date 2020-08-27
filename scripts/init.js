import { GLTFLoader } from "/js/GLTFLoader.js";
import { OrbitControls } from "/js/OrbitControls.js";
import Soldier from "/scripts/Soldier.js";
import Robot from "/scripts/robot.js";
import Stats from "/js/stats.module.js";

//VARIABLES
var scene;
var camera, initCamera;
var renderer, initRenderer;
var controls;
var zero = true;
var num = 0;
var raycaster;
var mouse;
var intersects1, intersects2, intersects3;
var intersectsStart;

var plane, plane1, plane2, plane3, planeStart;
var plane1sel, plane2sel, plane3sel;

var chScene = false;
var bars = false;

//Game logic
var lev = -1;
var scenelv = 0;

var inLevel = false;
var i, j = 0;
var clock = new THREE.Clock();
var ground;
var stats;

//Enemy variables
var modelSoldier, modelRobot;
var soldiers = [];
var numSoldiers = 2;
var arrayOfSoldierMeshesToDetect = [];

//Robot variables
var robot;
var moveForward = false;
var moveBackward = false;
var moveLeft = false;
var moveRight = false;
var attack = false;

//LIGHTS
var ambientLight = new THREE.AmbientLight(0xFFFFFF, 1);

//FUNCTIONS
var onKeyDown = function ( event ) {
	switch ( event.keyCode ) {
		// case 38: // up
		case 87: // w
			moveForward = true;
			break;
		// case 37: // left
		case 65: // a
			moveLeft = true;
			break;
		// case 40: // down
		case 83: // s
			moveBackward = true;
			break;
		// case 39: // right
		case 68: // d
			moveRight = true;
			break;
		case 32:
			attack = true;
			break;
	}
};

var onKeyUp = function ( event ) {
	switch ( event.keyCode ) {
		// case 38: // up
		case 87: // w
			moveForward = false;
			break;
		// case 37: // left
		case 65: // a
			moveLeft = false;
			break;
		// case 40: // down
		case 83: // s
			moveBackward = false;
			break;
		// case 39: // right
		case 68: // d
			moveRight = false;
			break;
		case 32:
			attack = false;
			break;
	}
};

function init(){
	scene = new THREE.Scene();
	camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
			
	renderer = new THREE.WebGLRenderer();
	renderer.setSize(window.innerWidth, window.innerHeight);
	document.body.appendChild(renderer.domElement);
	
	raycaster = new THREE.Raycaster();
	mouse = new THREE.Vector2();

	// stats
    /* stats = new Stats();
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.bottom = '0px';
    stats.domElement.style.zIndex = 100;
    container.appendChild( stats.dom ); */

	initScene();
}

//Get mouse position
function onDocumentMouseMove( event ) {
	event.preventDefault();
    mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
}

function keyListener(event){ 
    event = event || window.event; //capture the event, and ensure we have an event
    var key = event.key || event.which || event.keyCode; //find the key that was pressed
    if(key == ' '){
		var b_num = document.getElementById("bulletsNum");
		var n = parseInt(b_num.textContent);
		if(n > 0)
			b_num.textContent = n-1;
			if(n-1 == 0)
				document.getElementById("recharge").style.visibility = "visible";
	}
	if(key == 'r'){
		var b_num = document.getElementById("bulletsNum");
		b_num.textContent = 10;
		document.getElementById("recharge").style.visibility = "hidden";
	}
}
  
function mouseClick( event ) {
	event.preventDefault();
	if(bars == false){
		if (intersects1.length > 0){ 
			//console.log("easy");
			scene.remove(plane1);
			scene.add(plane2);
			scene.add(plane3);
			scene.remove(plane2sel);
			scene.remove(plane3sel);
			scene.add(plane1sel);
			chScene = true;
		}
		if (intersects2.length > 0){ 
			//console.log("medium");
			scene.remove(plane2);
			scene.add(plane1);
			scene.add(plane3);
			scene.remove(plane1sel);
			scene.remove(plane3sel);
			scene.add(plane2sel);
			chScene = true;
		}
		if (intersects3.length > 0){ 
			//console.log("hard");
			scene.remove(plane3);
			scene.add(plane1);
			scene.add(plane2);
			scene.remove(plane1sel);
			scene.remove(plane2sel);
			scene.add(plane3sel);
			chScene = true;
		}
	}
	
	if(intersectsStart.length > 0 && chScene == true){
		bars = true;
		scene.remove(plane1sel);
		scene.remove(plane2sel);
		scene.remove(plane3sel);
		changeScene();
	}
}

function promiseModel(path){
    const loader = new GLTFLoader();
    return new Promise((resolve, reject) => {
        loader.load(path, data => resolve(data), null, reject);
    });
}

function createGround(){
    var groundMaterial = new THREE.MeshPhongMaterial({map: new THREE.TextureLoader().load('textures/floor.png')});

    var groundGeometry = new THREE.PlaneGeometry(120, 120, 100, 100);
    groundGeometry.rotateX(-Math.PI/2);

    groundGeometry.computeFaceNormals();
    groundGeometry.computeVertexNormals();

    ground = new THREE.Mesh(groundGeometry, groundMaterial, 0, 100, 100);
    ground.name = "ground";
    scene.add(ground);
}

//Create the skybox
function createSkybox(){
	window.addEventListener('resize', function()
	{
		var width = window.innerWidth;
		var height = window.innerHeight;
		renderer.setSize(width, height);
		camera.aspect = width / height;
		camera.updateProjectionMatrix();
	})
	
	controls = new OrbitControls(camera, renderer.domElement);
	controls.minDistance = 0;
	controls.maxDistance = 130;
	
	//Change the position of the camera
	camera.position.set(50, 50, 50);
	camera.lookAt(new THREE.Vector3(0, 0, 0));
	
	var geometry = new THREE.CubeGeometry(1000, 1000, 1000);
	var skyboxMaterials = 
	[
		new THREE.MeshBasicMaterial({map: new THREE.TextureLoader().load('./img/skybox/front.png'), side: THREE.DoubleSide}),
		new THREE.MeshBasicMaterial({map: new THREE.TextureLoader().load('./img/skybox/back.png'), side: THREE.DoubleSide}), 
		new THREE.MeshBasicMaterial({map: new THREE.TextureLoader().load('./img/skybox/up.png'), side: THREE.DoubleSide}), 
		new THREE.MeshBasicMaterial({map: new THREE.TextureLoader().load('./img/skybox/down.png'), side: THREE.DoubleSide}), 
		new THREE.MeshBasicMaterial({map: new THREE.TextureLoader().load('./img/skybox/right.png'), side: THREE.DoubleSide}), 
		new THREE.MeshBasicMaterial({map: new THREE.TextureLoader().load('./img/skybox/left.png'), side: THREE.DoubleSide}) 
	];
		
	//Create a material, colour or image texture
	var skyboxMaterial = new THREE.MeshFaceMaterial(skyboxMaterials);
	var skyBox = new THREE.Mesh(geometry, skyboxMaterial);
	scene.add(skyBox);
	scene.add(ambientLight);
}

async function loadModels(){
	//adding the robot to the scene
	var tmp = await promiseModel("models/RobotExpressive.glb");
	modelRobot = tmp.scene;
	robot = new Robot(modelRobot);
	scene.add(robot.model);

	console.log(robot);
	
	//adding the soldiers to the scene
	for(i=0; i < numSoldiers; i++){
		var tmp = await promiseModel("models/Soldier.glb");
		modelSoldier = tmp.scene;
		soldiers[i] = new Soldier(modelSoldier, scene);
		scene.add(soldiers[i].model);
		var vertex = ground.geometry.vertices[Math.floor(Math.random() * ground.geometry.vertices.length)];
		soldiers[i].setPosition(vertex);
		soldiers[i].player = robot;
	}

	//creating the arrayOfSoldierMeshesToDetect taking the box meshes from each soldier
	for(i = 0; i < scene.children.length; i++){
		if(scene.children[i].name == "soldier"){
			arrayOfSoldierMeshesToDetect[j] = scene.children[i].children[0].children[3];
			j++;
		}
	}

	//passing the arrayOfSoldierMeshesToDetect & the player-hitbox to each soldier
	for(i=0; i < numSoldiers; i++){
		soldiers[i].arrayOfSoldierMeshesToDetect = arrayOfSoldierMeshesToDetect;
		soldiers[i].playerMesh = robot.character.children[3];
	}

	robot.arrayOfSoldierMeshesToDetect = arrayOfSoldierMeshesToDetect;

	inLevel = true;
}

function initScene(){
	camera.position.set(0, 0, 65);
	var geometry = new THREE.PlaneGeometry( window.innerWidth/7, window.innerHeight/7);
	var texture = new THREE.TextureLoader().load( './img/backgroundMenu.jpg' );
	var material = new THREE.MeshBasicMaterial({map: texture});
	plane = new THREE.Mesh( geometry, material );
	scene.add(plane);

	var geomPlaneStart = new THREE.PlaneGeometry( 16, 8);
	var textPlaneStart = new THREE.TextureLoader().load( './img/start.png' );
	var materialStart = new THREE.MeshBasicMaterial( {map: textPlaneStart} );
	planeStart = new THREE.Mesh( geomPlaneStart, materialStart );
	planeStart.position.y = -20;
	planeStart.position.z = 20;
	scene.add(planeStart);	
	
	var geomPlane1 = new THREE.PlaneGeometry( 20, 20);
	var textPlane1 = new THREE.TextureLoader().load( './img/easy.png' );
	var material1 = new THREE.MeshBasicMaterial( {map: textPlane1} );
	plane1 = new THREE.Mesh( geomPlane1, material1 );
	plane1.position.x = -40;
	plane1.position.z = 20;
	scene.add(plane1);
	
	var geomPlane2 = new THREE.PlaneGeometry( 20, 20);
	var textPlane2 = new THREE.TextureLoader().load( './img/medium.png' );
	var material2 = new THREE.MeshBasicMaterial( {map: textPlane2} );
	plane2 = new THREE.Mesh( geomPlane2, material2 );
	plane2.position.x = 0;
	plane2.position.z = 20;
	scene.add(plane2);
	
	var geomPlane3 = new THREE.PlaneGeometry( 20, 20);
	var textPlane3 = new THREE.TextureLoader().load( './img/hard.png' );
	var material3 = new THREE.MeshBasicMaterial( {map: textPlane3} );
	plane3 = new THREE.Mesh( geomPlane3, material3 );
	plane3.position.x = 40;
	plane3.position.z = 20;
	scene.add(plane3);
	
	var geomPlane1sel = new THREE.PlaneGeometry( 20, 20);
	var textPlane1sel = new THREE.TextureLoader().load( './img/easySel.png' );
	var material1sel = new THREE.MeshBasicMaterial( {map: textPlane1sel} );
	plane1sel = new THREE.Mesh( geomPlane1sel, material1sel );
	plane1sel.position.x = -40;
	plane1sel.position.z = 20;
	
	var geomPlane2sel = new THREE.PlaneGeometry( 20, 20);
	var textPlane2sel = new THREE.TextureLoader().load( './img/mediumSel.png' );
	var material2sel = new THREE.MeshBasicMaterial( {map: textPlane2sel} );
	plane2sel = new THREE.Mesh( geomPlane2sel, material2sel );
	plane2sel.position.x = 0;
	plane2sel.position.z = 20;
	
	var geomPlane3sel = new THREE.PlaneGeometry( 20, 20);
	var textPlane3sel = new THREE.TextureLoader().load( './img/hardSel.png' );
	var material3sel = new THREE.MeshBasicMaterial( {map: textPlane3sel} );
	plane3sel = new THREE.Mesh( geomPlane3sel, material3sel );
	plane3sel.position.x = 40;
	plane3sel.position.z = 20;

	document.addEventListener( 'keydown', onKeyDown, false );
	document.addEventListener( 'keyup', onKeyUp, false );
}

function lowerLifeBarPlayer(value){
	document.getElementById('lifebar').src = './img/lifebar/lifeBar_' + value + '.png'; 
}

function changeLevel(value){
	document.getElementById('level_num').src = './img/lev_' + value + '.png'; 
}

function changeScene(){
	window.removeEventListener( 'mousemove', onDocumentMouseMove, false);
	window.removeEventListener( 'click', mouseClick, false);
	window.removeEventListener( 'keypress', keyListener, false);

	scene.remove(plane);
	scene.remove(plane1);
	scene.remove(plane2);
	scene.remove(plane3);
	scene.remove(plane1sel);
	scene.remove(plane2sel);
	scene.remove(plane3sel);
	scene.remove(planeStart);
	document.getElementById("title").style.visibility = "hidden";
	document.getElementById("Menu").style.visibility="hidden";
	document.getElementById("level").style.visibility="visible";
	document.getElementById("level_num").style.visibility="visible";
	document.getElementById("lifebar").style.visibility="visible";
	document.getElementById("bullets").style.visibility="visible";
	document.getElementById("bulletsNum").style.visibility="visible";

	createGround();
	createSkybox();
	loadModels();
}

function checkDiedSoldiers(soldier){
    return soldier.model.userData.deadFlag != true;
}

var update = function(){
	
	raycaster.setFromCamera( mouse, camera );
    intersects1 = raycaster.intersectObject(plane1);
	intersects2 = raycaster.intersectObject(plane2);
	intersects3 = raycaster.intersectObject(plane3);
	intersectsStart = raycaster.intersectObject(planeStart);
	
	//console.log(lev);
	if(lev < 25){
		//console.log("1");
		plane1.rotation.y += 0.005;
		plane2.rotation.y += 0.005;
		plane3.rotation.y += 0.005;
		plane1sel.rotation.y += 0.005;
		plane2sel.rotation.y += 0.005;
		plane3sel.rotation.y += 0.005;
	}
	else if(lev >= 25 && lev < 75){
		//console.log("2");
		plane1.rotation.y -= 0.005;
		plane2.rotation.y -= 0.005;
		plane3.rotation.y -= 0.005;
		plane1sel.rotation.y -= 0.005;
		plane2sel.rotation.y -= 0.005;
		plane3sel.rotation.y -= 0.005;
	}
	else if(lev >= 75 && lev < 100){
		//console.log("3");
		plane1.rotation.y += 0.005;
		plane2.rotation.y += 0.005;
		plane3.rotation.y += 0.005;
		plane1sel.rotation.y += 0.005;
		plane2sel.rotation.y += 0.005;
		plane3sel.rotation.y += 0.005;
	}
	else if(lev = 100){
		lev = -1;
	}
	if(bars == true && scenelv < 1000){
		scenelv = scenelv + 1;
		lowerLifeBarPlayer(Math.floor((scenelv)/100));
		changeLevel(1 + Math.floor((scenelv)/400));
	}
	
	lev = lev + 1;
};
		
//Draw scene
function render(){
	renderer.clear();
	
	if(inLevel){
		if(robot){
			robot.update(moveForward, moveBackward, moveRight, moveLeft, attack, scene);
		}

		var delta = clock.getDelta();
    
    	//Update the controls
		controls.update(delta);

		//Update the state of the soldiers
		for(i=0; i < numSoldiers; i++){
        	soldiers[i].checkFlags();
        	if(soldiers[i].model.userData.deadFlag){
            	soldiers = soldiers.filter(checkDiedSoldiers);
            	numSoldiers = soldiers.length;
            	console.log(soldiers);
        	}
		}
	}

	TWEEN.update();
	update();
	
	requestAnimationFrame(render);
	renderer.render(scene, camera);
}

//EVENT LISTENERS
window.addEventListener( 'mousemove', onDocumentMouseMove, false);
window.addEventListener( 'click', mouseClick, false);
window.addEventListener( 'keypress', keyListener, false);

init();
render();		
