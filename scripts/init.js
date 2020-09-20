import { GLTFLoader } from "/js/GLTFLoader.js";
import { OrbitControls } from "/js/OrbitControls.js";
import Soldier from "/scripts/Soldier.js";
import Robot from "/scripts/robot.js";
import Stats from "/js/stats.module.js";

//VARIABLES
var scene;
var skyBox;
var walls = [];
var grounds = [];
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

var gameOver = false;

var elem2 = document.getElementById('level_num');

//Countdown variables
var timeLeft = 40;
var elem = document.getElementById('Countdown');
var timerId = setInterval(countdown, 1000);

//Game logic
var currLife = 100;
var rot = -1;
var lev = 1;
var gameDifficulty;

var inLevel = false;
var i = 0;
var clock = new THREE.Clock();
var stats;

//Enemy variables
var modelSoldier, modelRobot;
var soldiers = [];
var numSoldiers = 1;
var arrayOfSoldierMeshesToDetect = [];

//Robot variables
var robot;
var moveForward = false;
var moveBackward = false;
var moveLeft = false;
var moveRight = false;
var attack = false;

//Power-up variables
var heart;
var shield;

//LIGHTS
var ambientLight = new THREE.AmbientLight(0xFFFFFF, 1);

//Countdown function
function countdown() {
	if(inLevel){
		if (timeLeft == -1) {
			clearTimeout(timerId);
			gameOverScene();
		} 
		else{
			elem.innerHTML = timeLeft + ' seconds remaining';
			timeLeft--;
		}
	}
}

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
	if(key == 'r'){
		var b_num = document.getElementById("bulletsNum");
		b_num.textContent = 10;
		robot.n_bullets = 10;
		document.getElementById("recharge").style.visibility = "hidden";
	}
}
  
function mouseClick( event ) {
	event.preventDefault();
	if(bars == false){
		if (intersects1.length > 0){ 
			//console.log("easy");
			gameDifficulty = 0;
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
			gameDifficulty = 1;
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
			gameDifficulty = 2;
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
		gameOver = false;
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

function addBoxLife(){
	/* var cube = new THREE.BoxGeometry(10,10,10);
	var materialCube = new THREE.MeshPhongMaterial({map: new THREE.TextureLoader().load('textures/box_heart_texture.png')});
	var heart = new THREE.Mesh(cube, materialCube);
	heart.position.set(20,5,20);
	heart.name = "heart"; */

	const shape = new THREE.Shape();
    const x = -2.5;
    const y = -5;
    shape.moveTo(x + 2.5, y + 2.5);
    shape.bezierCurveTo(x + 2.5, y + 2.5, x + 2, y, x, y);
    shape.bezierCurveTo(x - 3, y, x - 3, y + 3.5, x - 3, y + 3.5);
    shape.bezierCurveTo(x - 3, y + 5.5, x - 1.5, y + 7.7, x + 2.5, y + 9.5);
    shape.bezierCurveTo(x + 6, y + 7.7, x + 8, y + 4.5, x + 8, y + 3.5);
    shape.bezierCurveTo(x + 8, y + 3.5, x + 8, y, x + 5, y);
    shape.bezierCurveTo(x + 3.5, y, x + 2.5, y + 2.5, x + 2.5, y + 2.5);

    const extrudeSettings = {
      steps: 2,
      depth: 2,
      bevelEnabled: true,
      bevelThickness: 1,
      bevelSize: 1,
      bevelSegments: 2,
    };

	var heartGeometry = new THREE.ExtrudeBufferGeometry(shape, extrudeSettings);
	var heartMaterial = new THREE.MeshLambertMaterial({color: 0xFF4500});
	heart = new THREE.Mesh(heartGeometry, heartMaterial);
	heart.rotation.z = Math.PI;
	heart.name = "heart";

	var vertex = grounds[2].geometry.vertices[Math.floor(Math.random() * grounds[2].geometry.vertices.length)];
	heart.position.set(vertex.x, 5, vertex.z);
  
	setTimeout(function(){
		scene.add(heart);
	}, 10000);

	setTimeout(function(){
		scene.remove(heart);
		addBoxLife();
	}, 20000);
}

function addBoxShield(){
	/* var cube = new THREE.BoxGeometry(10,10,10);
	var materialCube = new THREE.MeshPhongMaterial({map: new THREE.TextureLoader().load('textures/box_shield_texture.jpg')});
	var box_shield = new THREE.Mesh(cube, materialCube);
	box_shield.position.set(-20,5,-20);
	box_shield.name = "box_shield"; */

	var cylinderGeometry = new THREE.CylinderGeometry(4, 4, 10, 6);
    var cylinderMaterial = new THREE.MeshPhongMaterial({color: 0x000080, transparent: false, side: THREE.DoubleSide});
	shield = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
	shield.name = "box_shield";
	
	var vertex = grounds[2].geometry.vertices[Math.floor(Math.random() * grounds[2].geometry.vertices.length)];
	shield.position.set(vertex.x, 5, vertex.z);

	setTimeout(function(){
		scene.add(shield);
	}, 10000);

	setTimeout(function(){
		scene.remove(shield);
		addBoxShield();
	}, 20000);
}

function createGround(){
    var groundMaterial = new THREE.MeshPhongMaterial({map: new THREE.TextureLoader().load('textures/floor.png'), side: THREE.DoubleSide});
	var groundGeometry0 = new THREE.PlaneGeometry(60, 60, 100, 100);
	var groundGeometry1 = new THREE.PlaneGeometry(16, 40, 100, 100);
	var ground2width;
	switch(lev){
		case 1:
			ground2width = 120;
			break;
		case 2:
			ground2width = 180;
			break;
		case 3:
			ground2width = 220;
			break;
	}
	var groundGeometry2 = new THREE.PlaneGeometry(ground2width, ground2width, 100, 100);
	groundGeometry0.rotateX(-Math.PI/2);
	groundGeometry1.rotateX(-Math.PI/2);
	groundGeometry2.rotateX(-Math.PI/2);

	grounds[0] = new THREE.Mesh(groundGeometry0, groundMaterial, 0, 100, 100);
	grounds[1] = new THREE.Mesh(groundGeometry1, groundMaterial, 0, 100, 100);
	grounds[2] = new THREE.Mesh(groundGeometry2, groundMaterial, 0, 100, 100);

	groundGeometry1.translate(0, 0, grounds[0].geometry.parameters.height/2 + grounds[1].geometry.parameters.height/2);
	groundGeometry2.translate(0, 0, 
		grounds[0].geometry.parameters.height/2 + grounds[1].geometry.parameters.height + grounds[2].geometry.parameters.height/2);

	for(i=0; i < grounds.length; i++){
		grounds[i].name = "ground" + i;
		scene.add(grounds[i]);
    }

	createWalls();
}

function createWalls(){
	var boxGeometry1 = new THREE.BoxGeometry( 60, 20, 2 );
	var boxGeometry2 = new THREE.BoxGeometry( 22, 20, 2);
	var boxGeometry3 = new THREE.BoxGeometry( 40, 20, 2);
	var boxGeometry4 = new THREE.BoxGeometry( grounds[2].geometry.parameters.width, 20, 2);
	var boxGeometry5 = new THREE.BoxGeometry( (grounds[2].geometry.parameters.width - 16)/2, 20, 2);
    var boxMaterial = new THREE.MeshPhongMaterial( {map: new THREE.TextureLoader().load('textures/wall.png')} );
    walls[0] = new THREE.Mesh( boxGeometry2, boxMaterial, 0 );
    walls[1] = new THREE.Mesh( boxGeometry1, boxMaterial, 0 );
    walls[2] = new THREE.Mesh( boxGeometry1, boxMaterial, 0 );
	walls[3] = new THREE.Mesh( boxGeometry1, boxMaterial, 0 );
	walls[4] = new THREE.Mesh( boxGeometry2, boxMaterial, 0 );

	walls[5] = new THREE.Mesh( boxGeometry3, boxMaterial, 0 );
	walls[6] = new THREE.Mesh( boxGeometry3, boxMaterial, 0 );

	walls[7] = new THREE.Mesh( boxGeometry5, boxMaterial, 0 );
	walls[8] = new THREE.Mesh( boxGeometry5, boxMaterial, 0 );
	walls[9] = new THREE.Mesh( boxGeometry4, boxMaterial, 0 );
	walls[10] = new THREE.Mesh( boxGeometry4, boxMaterial, 0 );
	walls[11] = new THREE.Mesh( boxGeometry4, boxMaterial, 0);

	var wallsheight = boxGeometry1.parameters.height/2;
	var groundheight0 = grounds[0].geometry.parameters.height;
	var groundwidth1 = grounds[1].geometry.parameters.width;
	var groundheight1 = grounds[1].geometry.parameters.height;
	var groundheight2 = grounds[2].geometry.parameters.height;
	
	//First ground walls
	walls[0].position.set(-20, wallsheight, groundheight0/2);
	walls[4].position.set(20, wallsheight, groundheight0/2);
    walls[1].position.set(0, wallsheight, -groundheight0/2);
    walls[2].position.set(groundheight0/2, wallsheight, 0);
    walls[2].rotateY(Math.PI/2);
    walls[3].position.set(-groundheight0/2, wallsheight, 0);
	walls[3].rotateY(Math.PI/2);
	
	//Second ground walls
	walls[5].position.set(-groundwidth1/2, wallsheight, groundheight0/2 + groundheight1/2);
	walls[5].rotateY(Math.PI/2);
	walls[6].position.set(groundwidth1/2, wallsheight, groundheight0/2 + groundheight1/2);
	walls[6].rotateY(Math.PI/2);

	//Third ground walls
	walls[7].position.set(-((grounds[2].geometry.parameters.width - 16)/4 +8), wallsheight, groundheight0/2 + groundheight1);
	walls[8].position.set(((grounds[2].geometry.parameters.width - 16)/4 +8), wallsheight, groundheight0/2 + groundheight1);
    walls[9].position.set(0, wallsheight, groundheight0/2 + groundheight1 + groundheight2);
    walls[10].position.set(groundheight2/2, wallsheight, groundheight0/2 + groundheight1 + groundheight2/2);
    walls[10].rotateY(Math.PI/2);
    walls[11].position.set(-groundheight2/2, wallsheight, groundheight0/2 + groundheight1 + groundheight2/2);
	walls[11].rotateY(Math.PI/2);


    for(i=0; i < walls.length; i++){
		walls[i].name = "wall";
		scene.add(walls[i]);
	}
}

//Create the skybox
function createSkybox(){
	/* controls = new OrbitControls(camera, renderer.domElement);
	controls.minDistance = 0;
	controls.maxDistance = 130;
	
	controls.saveState(); */
	
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
	skyBox = new THREE.Mesh(geometry, skyboxMaterial);
	scene.add(skyBox);
	scene.add(ambientLight);
}

async function loadModels(){
	//adding the robot to the scene
	var tmp = await promiseModel("models/RobotExpressive.glb");
	modelRobot = tmp.scene;
	robot = new Robot(modelRobot);
	scene.add(robot.model);

	robot.life = currLife;
	console.log(robot.life);
	
	//adding the soldiers to the scene
	for(i=0; i < numSoldiers; i++){
		var tmp = await promiseModel("models/Soldier.glb");
		modelSoldier = tmp.scene;
		soldiers[i] = new Soldier(modelSoldier, scene);
		scene.add(soldiers[i].model);
		soldiers[i].setParameters(gameDifficulty);
		soldiers[i].player = robot;
		soldiers[i].setGround(grounds[2]);
		soldiers[i].setPosition();
	}

	//creating the arrayOfSoldierMeshesToDetect taking the box meshes from each soldier
	for(i = 0; i < soldiers.length; i++)
		arrayOfSoldierMeshesToDetect[i] = soldiers[i].model.children[0].children[3];

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

function changeScene(){
	camera.position.set(0, 70, -70);
	camera.fov = 45;
	camera.lookAt(new THREE.Vector3(0, 0, 0));

	window.removeEventListener( 'mousemove', onDocumentMouseMove, false);
	window.removeEventListener( 'click', mouseClick, false);
	//window.removeEventListener( 'keypress', keyListener, false);

	scene.remove(plane);
	scene.remove(plane1);
	scene.remove(plane2);
	scene.remove(plane3);
	scene.remove(plane1sel);
	scene.remove(plane2sel);
	scene.remove(plane3sel);
	scene.remove(planeStart);
	document.getElementById("Instructions").style.visibility = "hidden";
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
	addBoxLife();
	addBoxShield();
}

function resetGame(event){
	location.reload(false);
}

function gameOverScene(){
	document.getElementById("level").style.visibility="hidden";
	document.getElementById("level_num").style.visibility="hidden";
	document.getElementById("lifebar").style.visibility="hidden";
	document.getElementById("bullets").style.visibility="hidden";
	document.getElementById("bulletsNum").style.visibility="hidden";

	scene.remove(robot.model);
	for(i=0; i < numSoldiers; i++){
		scene.remove(soldiers[i].model);
	}
	
	scene.remove(skyBox);
	scene.remove(ambientLight);

	scene.remove(grounds);
	for(i=0; i < walls.length; i++){
        scene.remove(walls[i]);
    }

	document.getElementById('lifebar').src = './img/lifebar/lifeBar_0.png'; 
	gameOver = true;
	document.getElementById("GameOverImage").style.visibility = "visible";
	document.getElementById("playButton").style.visibility = "visible";
	document.getElementById("playButton").addEventListener('click', resetGame, false);

}

function checkDiedSoldiers(soldier){
    return soldier.model.userData.deadFlag != true;
}

function updateArrayOfSoldierMeshesToDetect(){
	arrayOfSoldierMeshesToDetect = [];
	for(i = 0; i < soldiers.length; i++)
		arrayOfSoldierMeshesToDetect[i] = soldiers[i].model.children[0].children[3];

	for(i=0; i < numSoldiers; i++)
		soldiers[i].arrayOfSoldierMeshesToDetect = arrayOfSoldierMeshesToDetect;
		
	robot.arrayOfSoldierMeshesToDetect = arrayOfSoldierMeshesToDetect;
}

function updateCamera(){
	var relativeCameraOffset = new THREE.Vector3(0, 15, -16);

	var cameraOffset = relativeCameraOffset.applyMatrix4( robot.model.matrixWorld );

	camera.position.x = cameraOffset.x;
	camera.position.y = cameraOffset.y;
	camera.position.z = cameraOffset.z;
	camera.lookAt( robot.model.position );
}

var update = function(){
	
	raycaster.setFromCamera( mouse, camera );
    intersects1 = raycaster.intersectObject(plane1);
	intersects2 = raycaster.intersectObject(plane2);
	intersects3 = raycaster.intersectObject(plane3);
	intersectsStart = raycaster.intersectObject(planeStart);
	
	if(rot < 25){
		plane1.rotation.y += 0.005;
		plane2.rotation.y += 0.005;
		plane3.rotation.y += 0.005;
		plane1sel.rotation.y += 0.005;
		plane2sel.rotation.y += 0.005;
		plane3sel.rotation.y += 0.005;
	}
	else if(rot >= 25 && rot < 75){
		plane1.rotation.y -= 0.005;
		plane2.rotation.y -= 0.005;
		plane3.rotation.y -= 0.005;
		plane1sel.rotation.y -= 0.005;
		plane2sel.rotation.y -= 0.005;
		plane3sel.rotation.y -= 0.005;
	}
	else if(rot >= 75 && rot < 100){
		plane1.rotation.y += 0.005;
		plane2.rotation.y += 0.005;
		plane3.rotation.y += 0.005;
		plane1sel.rotation.y += 0.005;
		plane2sel.rotation.y += 0.005;
		plane3sel.rotation.y += 0.005;
	}
	else if(rot = 100){
		rot = -1;
	}
	
	rot = rot + 1;
};

function resumeGame(){
	document.getElementById("LevelOverImage").style.visibility = "hidden";
	document.getElementById("playLevelButton").style.visibility = "hidden";

	document.getElementById("level").style.visibility="visible";
	document.getElementById("level_num").style.visibility="visible";
	document.getElementById("lifebar").style.visibility="visible";
	document.getElementById("bullets").style.visibility="visible";
	document.getElementById("bulletsNum").style.visibility="visible";

	var b_num = document.getElementById("bulletsNum");
	b_num.textContent = 10;

	scene.remove(robot.model);
	
	if(lev == 2){
		console.log("Lev 2");
		elem2.innerHTML = 2;
		timeLeft = 70;
		numSoldiers = 2;
	}
	
	if(lev == 3){
		console.log("Lev 3");
		elem2.innerHTML = 3;
		timeLeft = 100;
		numSoldiers = 3;
	}

	elem.innerHTML = timeLeft + ' seconds remaining';

	/* console.log("Printing the currLife");
	console.log(currLife);
	console.log("Printed currLife"); */

	camera.position.set(0, 70, -70);
	camera.lookAt(scene.position);
	createGround();
	createSkybox();
	loadModels();
	addBoxLife();
	addBoxShield();
}

function levelCompleted(){

	document.getElementById("level").style.visibility="hidden";
	document.getElementById("level_num").style.visibility="hidden";
	document.getElementById("lifebar").style.visibility="hidden";
	document.getElementById("bullets").style.visibility="hidden";
	document.getElementById("bulletsNum").style.visibility="hidden";

	while(scene.children.length > 0){ 
		scene.remove(scene.children[0]); 
	}
	
	lev = lev + 1;
	
	document.getElementById("LevelOverImage").style.visibility = "visible";
	document.getElementById("playLevelButton").style.visibility = "visible";
	document.getElementById("playLevelButton").addEventListener('click', resumeGame, false);
}

function matchWon(){
	gameOver = true;
	//console.log("Hai vinto");

	document.getElementById("level").style.visibility="hidden";
	document.getElementById("level_num").style.visibility="hidden";
	document.getElementById("lifebar").style.visibility="hidden";
	document.getElementById("bullets").style.visibility="hidden";
	document.getElementById("bulletsNum").style.visibility="hidden";

	for(i = 0; i < scene.children.length; i++){
		console.log("Dentro a canc oggetti");
		scene.remove(scene.children[i]);
	}

	document.getElementById("GameWonImage").style.visibility = "visible";
	document.getElementById("playButton").style.visibility = "visible";
	document.getElementById("playButton").addEventListener('click', resetGame, false);

}
		
//Draw scene
function render(){
	renderer.clear();
	
	if(inLevel && !gameOver){
		
		if(robot){
			robot.update(moveForward, moveBackward, moveRight, moveLeft, attack, scene);
			updateCamera();
		}

		if(robot.getLife() <= 0){
			gameOverScene();
		}

		if(heart)
			heart.rotation.y += 0.01;
		
		if(shield)
			shield.rotation.y += 0.01;

		//Update the controls
		//var delta = clock.getDelta();
		//controls.update(delta);

		//Update the state of the soldiers
		for(i=0; i < numSoldiers; i++){
        	soldiers[i].checkFlags();
        	if(soldiers[i].model.userData.deadFlag){
            	soldiers = soldiers.filter(checkDiedSoldiers);
				numSoldiers = soldiers.length;
				updateArrayOfSoldierMeshesToDetect();
			}
		}

		if(numSoldiers == 0){
			currLife = robot.life;
			if(lev < 3){
				inLevel = false;
				setTimeout(levelCompleted, 2500);
			}
			else{
				setTimeout(matchWon, 2500);
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
window.addEventListener( 'resize', function(){
    var width = window.innerWidth;
    var height = window.innerHeight;
    renderer.setSize(width, height);
    camera.aspect = width/height;
    camera.updateProjectionMatrix();
});

init();
render();	
