var scene, initScene;
var camera, initCamera;
var renderer, initRenderer;
var controls;
var zero = true;
var num = 0;
var raycaster;
var mouse;
var intersects1, intersects2, intersects3;

function init(){
	
	mainPage();
}

function mainPage(){ 
	scene = new THREE.Scene();
	camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
			
	renderer = new THREE.WebGLRenderer();
	renderer.setSize(window.innerWidth, window.innerHeight);
	document.body.appendChild(renderer.domElement);
	
	raycaster = new THREE.Raycaster();
	mouse = new THREE.Vector2();

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
  

var chScene = false;
var bars = false;
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
	
//Create the skybox 1
function createSkybox(){
	window.addEventListener('resize', function()
	{
		var width = window.innerWidth;
		var height = window.innerHeight;
		renderer.setSize(width, height);
		camera.aspect = width / height;
		camera.updateProjectionMatrix();
	})
			
	controls = new THREE.OrbitControls(camera, renderer.domElement);
	controls.addEventListener('change', renderer);
	controls.minDistance = 0;
	controls.maxDistance = 130;
	//Change the position of the camera
	camera.position.set(0, 0, 100);
	
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
}
		
var plane, plane1, plane2, plane3, planeStart;		
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
}

function lowerLifeBarPlayer(value){
	
	document.getElementById('lifebar').src = './img/lifebar/lifeBar_' + value + '.png'; 
}

function changeLevel(value){
	
	document.getElementById('level_num').src = './img/lev_' + value + '.png'; 
}

function changeScene(){
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
	createSkybox();
}
		
//Game logic
var lev = -1;
var scenelv = 0;
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
var render = function()
{	
	renderer.render(scene, camera);
};

window.addEventListener( 'mousemove', onDocumentMouseMove, false);
window.addEventListener( 'click', mouseClick, false);
window.addEventListener( 'keypress', keyListener, false);
			
//Run game loop (update, render, repeat)
var GameLoop = function( )
{	
	requestAnimationFrame(GameLoop);
	update();
	render();
};

init();
GameLoop();		
