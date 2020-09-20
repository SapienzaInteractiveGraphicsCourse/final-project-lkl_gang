export default class Soldier {

    constructor(model, scene){
        this.model = model;
        this.scene = scene;
        this.model.scale.x = 10;
        this.model.scale.y = 10;
        this.model.scale.z = 10;
        this.model.rotation.y = Math.PI;

        this.tweenWalk = new TWEEN.Tween(0,0,0).to((1,1,1), 1000);
        this.tweenRun = new TWEEN.Tween(0,0,0).to((1,1,1), 1000);
        this.tweenIdle = new TWEEN.Tween(0,0,0).to((1,1,1), 1000);
        this.tweenRotation = new TWEEN.Tween(0,0,0).to((1,1,1), 1000);
        this.tweenAim = new TWEEN.Tween(0,0,0).to((1,1,1), 1000);
        this.tweenDie = new TWEEN.Tween(0,0,0).to((1,1,1), 1000);
        this.model.userData.tweenTraslation = new TWEEN.Tween(0,0,0).to((1,1,1), 1000);

        this.character = this.model.getObjectByName('Character');
        this.rightArm = this.model.getObjectByName('mixamorigRightArm');
        this.leftArm = this.model.getObjectByName('mixamorigLeftArm');
        this.head = this.model.getObjectByName('mixamorigHead');

        this.model.name = "soldier";

        this.model.userData.idleFlag = true;
        this.model.userData.patrolFlag = false;
        this.model.userData.aimFlag = false;
        this.model.userData.collisionFlag = false;
        this.model.userData.playerDetectedFlag = false;
        this.model.userData.canShootFlag = false;
        this.model.userData.bulletReadyFlag = false;
        this.model.userData.isDamagedFlag = false;
        this.model.userData.canBeDamagedFlag = true;
        this.model.userData.searchPlayerFlag = false;
        this.model.userData.reachPlayerFlag = false;
        this.model.userData.deadFlag = false;

        this.rightArm.rotation.z = (80/180) * Math.PI;
        this.leftArm.rotation.z = (80/180) * Math.PI;

        this.arrayOfSoldierMeshesToDetect = [];
        this.player = [];
        this.playerMesh = new THREE.Object3D();
        this.ground = new THREE.Object3D();

        this.bullet = new THREE.Object3D();

        //BOUNDING BOX 
        var cubeGeometry = new THREE.CubeGeometry(6, 18, 4);
        var cubeMaterial = new THREE.MeshBasicMaterial({wireframe: true });
        var cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
        cube.position.set(0, 9, 0);
        cube.visible = false;
        cube.name = 'enemy';
        this.character.attach(cube);

        //SHIELD
        var cylinderGeometry = new THREE.CylinderGeometry(5.6, 5.6, 19, 32);
        var cylinderMaterial = new THREE.MeshPhongMaterial({color: 0xE9E933, transparent: true, opacity: 0.5, side: THREE.DoubleSide});
        var cylinder = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
        cylinder.name = "shield";
        this.model.userData.shield = cylinder;
        
        //HEALTH BAR
        var healthBarGeometry = new THREE.PlaneGeometry(10, 1, 4);
        var healthBarMaterial = new THREE.MeshBasicMaterial({color: 0xF23007 , side: THREE.DoubleSide});
        var healthBar = new THREE.Mesh(healthBarGeometry, healthBarMaterial);
        healthBar.position.set(0, 20, 0);
        healthBar.name = 'healthBar';
        this.model.attach(healthBar);

        //RAYCASTER
        var pointA = new THREE.Vector3( this.model.position.x, this.head.position.y * 5, this.model.position.z );
        this.model.userData.direction = new THREE.Vector3( 0, 0, 1 );
        this.model.userData.direction.normalize();
        this.model.userData.raycasterCollision = new THREE.Raycaster(pointA, this.model.userData.direction, 0, 20);

        //Display the direction line
        /* var distance = 20; 
        var tmpVector = new THREE.Vector3().copy(this.model.userData.direction);

        var pointB = new THREE.Vector3();
        pointB.addVectors ( pointA, tmpVector.multiplyScalar( distance ) );

        var geometry = new THREE.Geometry();
        geometry.vertices.push( pointA );
        geometry.vertices.push( pointB );
        var material = new THREE.LineBasicMaterial( { color : 0xff0000 } );
        var line = new THREE.Line( geometry, material );
        line.name = 'directionLine';
        line.visible = false;
        this.character.attach( line ); */
    }

    getComponents(){
        this.model.traverse(function (child){
           console.log(child.name); 
        });
    }

    setPosition(){
        var vertex = this.ground.geometry.vertices[Math.floor(Math.random() * this.ground.geometry.vertices.length)];
        
        this.model.position.x = vertex.x;
        this.model.position.y = 0;
        this.model.position.z = vertex.z;

        this.model.userData.raycasterCollision.ray.origin = new THREE.Vector3(this.model.position.x, this.head.position.y * 5, this.model.position.z);
    }

    setParameters(gameDifficulty){
        switch(gameDifficulty){
            case 0:
                this.gameDifficulty = gameDifficulty;
                this.health = 100;
                this.bulletSpeed = 1;
                break;
            case 1:
                this.gameDifficulty = gameDifficulty;
                this.health = 120;
                this.bulletSpeed = 1.5;
                break;
            case 2:
                this.gameDifficulty = gameDifficulty;
                this.health = 160;
                this.bulletSpeed = 2;
                break;
        }
    }

    setGround(ground){
        this.ground = ground;
    }

    idle(){
        var model = this.model;
        var scene = this.scene;
        model.userData.idleFlag = false;

        model.userData.shield.position.set(model.position.x, 9, model.position.z);
        scene.add(model.userData.shield);

        var rightUpLeg = this.model.getObjectByName('mixamorigRightUpLeg');
        var rightLeg = this.model.getObjectByName('mixamorigRightLeg');
        var rightArm = this.model.getObjectByName('mixamorigRightArm');
        var rightForeArm = this.model.getObjectByName('mixamorigRightForeArm');
        var rightHand = this.model.getObjectByName('mixamorigRightHand');

        var leftUpLeg = this.model.getObjectByName('mixamorigLeftUpLeg');
        var leftLeg = this.model.getObjectByName('mixamorigLeftLeg');
        var leftArm = this.model.getObjectByName('mixamorigLeftArm');
        var leftForeArm = this.model.getObjectByName('mixamorigLeftForeArm');
        
        var startPosRightUpLeg = Math.abs(rightUpLeg.rotation.x);
        var startPosRightLeg = Math.abs(rightLeg.rotation.x);
        var startPosRightArmY = Math.abs(rightArm.rotation.y);
        var startPosRightArmZ = Math.abs(rightArm.rotation.z);
        var startPosRightForeArm = Math.abs(rightForeArm.rotation.x);
        var startPosRightHandY = Math.abs(rightHand.rotation.y);
        var startPosRightHandZ = Math.abs(rightHand.rotation.z);
        
        var startPosLeftUpLeg = Math.abs(leftUpLeg.rotation.x);
        var startPosLeftLeg = Math.abs(leftLeg.rotation.x);
        var startPosLeftArm = Math.abs(leftArm.rotation.y);
        var startPosLeftForeArm = Math.abs(leftForeArm.rotation.x);

        var position = {
            rotRightUpLeg: startPosRightUpLeg,
            rotRightLeg: startPosRightLeg,
            rotRightArmY: startPosRightArmY,
            rotRightArmZ: startPosRightArmZ,
            rotRightForeArm: startPosRightForeArm,
            rotRightHandY: startPosRightHandY,
            rotRightHandZ: startPosRightHandZ,

            rotLeftUpLeg: startPosLeftUpLeg,
            rotLeftLeg: startPosLeftLeg,
            rotLeftArm: startPosLeftArm,
            rotLeftForeArm: startPosLeftForeArm
        };
        var target = {
            rotRightUpLeg: 3.141592653589793,
            rotRightLeg: 0,
            rotRightArmY: 0,
            rotRightArmZ: 1.3962634015954636, 
            rotRightForeArm: 0,
            rotRightHandY: 0,
            rotRightHandZ: 0,

            rotLeftUpLeg: 3.141592653589793,
            rotLeftLeg: 0,
            rotLeftArm: 0,
            rotLeftForeArm: 0
        };

        this.tweenIdle = new TWEEN.Tween(position).to(target, 1000);
        this.tweenIdle.easing(TWEEN.Easing.Linear.None);
        this.tweenIdle.onUpdate(function(){
            rightUpLeg.rotation.x = position.rotRightUpLeg;
            rightLeg.rotation.x = position.rotRightLeg;
            rightArm.rotation.y = position.rotRightArmY;
            rightArm.rotation.z = position.rotRightArmZ;
            rightForeArm.rotation.x = -position.rotRightForeArm;
            rightHand.rotation.y = position.rotRightHandY;
            rightHand.rotation.z = position.rotRightHandZ;

            leftUpLeg.rotation.x = position.rotLeftUpLeg;
            leftLeg.rotation.x = position.rotLeftLeg;
            leftArm.rotation.y = -position.rotLeftArm;
            leftForeArm.rotation.x = -position.rotLeftForeArm;
        });

        this.tweenIdle.onComplete(function(){
            if(!model.userData.searchPlayerFlag)
                setTimeout(function(){model.userData.patrolFlag = true;}, 1000);
            else
                setTimeout(function(){
                    model.userData.reachPlayerFlag = true;
                    model.userData.searchPlayerFlag = false;
                }, 1000);
        });

        this.tweenIdle.start();
    }

    patrol(){
        //ROTATION
        var model = this.model;
        var scene = this.scene;
        var startRot = model.rotation.y;
        var startDir = model.userData.direction;
        var head = model.getObjectByName("mixamorigHead");
        
        model.userData.patrolFlag = false;

        var targetPoint = new THREE.Vector3().copy(this.ground.geometry.vertices[Math.floor(Math.random() * this.ground.geometry.vertices.length)]);
        targetPoint.y = 0;

        var direction = new THREE.Vector3().subVectors(targetPoint, model.position);
        direction.normalize();
        var angle = startDir.angleTo(direction);

        //DISPLAY TARGET POINT
        /* var sphereGeometry = new THREE.SphereGeometry( 0.5, 32, 32 );
        var sphereMaterial = new THREE.MeshBasicMaterial( {color: 0xffff00} );
        var sphere = new THREE.Mesh( sphereGeometry, sphereMaterial );
        sphere.position.set(targetPoint.x, targetPoint.y, targetPoint.z);
        this.scene.add( sphere ); */

        //DISPLAY DIRECTION LINE
        /* var lineMaterial = new THREE.LineBasicMaterial({ color: 0xffff00 });
        
        var points = [];
        points.push( model.position );
        points.push( targetPoint );
        
        var geometry = new THREE.BufferGeometry().setFromPoints( points );
        
        var line = new THREE.Line( geometry, lineMaterial );
        this.scene.add( line ); */

        var crossProduct = new THREE.Vector3();
        crossProduct.crossVectors(startDir, direction);

        model.userData.direction = direction;
        
        var rotation = { 
            rot: startRot
        };

        if(crossProduct.y <= 0)
            var rotationTarget = {
                rot: startRot - angle
            };
        else
            var rotationTarget = {
                rot: startRot + angle
            };
        
        this.tweenRotation = new TWEEN.Tween(rotation).to(rotationTarget, 2000);
        this.tweenRotation.easing(TWEEN.Easing.Linear.None);

        this.tweenRotation.onUpdate(function(){
            model.rotation.y = rotation.rot;
        });
        this.tweenRotation.onStop(function(){
            model.userData.idleFlag = true;
        });

        this.tweenRotation.onComplete(function(){
            scene.remove(model.userData.shield);

            var distance = model.position.distanceTo(targetPoint);
            var time = 300 * distance/2;
            
            model.userData.collisionFlag = false;
            model.userData.raycasterCollision.ray.direction = direction;

            var charPosX = model.position.x;
            var charPosZ = model.position.z;

            var charPosition = {
                posX: charPosX,
                posZ: charPosZ
            };

            var charPosTarget = {
                posX: targetPoint.x,
                posZ: targetPoint.z
            };

            model.userData.tweenTraslation = new TWEEN.Tween(charPosition).to(charPosTarget, time);
            model.userData.tweenTraslation.easing(TWEEN.Easing.Linear.None);
            model.userData.tweenTraslation.onUpdate(function(){
                model.position.x = charPosition.posX;
                model.position.z = charPosition.posZ;
                model.userData.raycasterCollision.ray.origin.set(charPosition.posX, head.position.y * 5, charPosition.posZ);
            });

            model.userData.tweenTraslation.onComplete(function(){
                model.userData.idleFlag = true;
            });

            model.userData.tweenTraslation.onStop(function(){
                if(!model.userData.playerDetectedFlag)
                    model.userData.idleFlag = true;
                if(model.userData.playerDetectedFlag)
                    model.userData.aimFlag = true;
            });
                
            model.userData.tweenTraslation.start();
        });

        this.tweenRotation.start();
        this.walk();
    }

    reachPlayer(){
        var model = this.model;
        var scene = this.scene;
        var startRot = model.rotation.y;
        var startDir = model.userData.direction;
        var head = model.getObjectByName("mixamorigHead");
        
        model.userData.reachPlayerFlag = false;

        model.userData.shield.position.set(model.position.x, 9, model.position.z);
        scene.add(model.userData.shield);
        
        var targetPoint = new THREE.Vector3().copy(this.player.model.position);
        targetPoint.y = 0;

        var direction = new THREE.Vector3().subVectors(targetPoint, model.position);
        direction.normalize();
        var angle = startDir.angleTo(direction);

        var crossProduct = new THREE.Vector3();
        crossProduct.crossVectors(startDir, direction);

        model.userData.direction = direction;
        
        var rotation = { 
            rot: startRot
        };

        if(crossProduct.y <= 0)
            var rotationTarget = {
                rot: startRot - angle
            };
        else
            var rotationTarget = {
                rot: startRot + angle
            };
        
        this.tweenRotation = new TWEEN.Tween(rotation).to(rotationTarget, 300);
        this.tweenRotation.easing(TWEEN.Easing.Linear.None);

        this.tweenRotation.onUpdate(function(){
            model.rotation.y = rotation.rot;
        });

        this.tweenRotation.onComplete(function(){
            scene.remove(model.userData.shield);

            var distance = model.position.distanceTo(targetPoint);
            var time = 130 * distance/2;
            
            model.userData.collisionFlag = false;
            model.userData.raycasterCollision.ray.direction = direction;

            var charPosX = model.position.x;
            var charPosZ = model.position.z;

            var charPosition = {
                posX: charPosX,
                posZ: charPosZ
            };

            var charPosTarget = {
                posX: targetPoint.x,
                posZ: targetPoint.z
            };

            model.userData.tweenTraslation = new TWEEN.Tween(charPosition).to(charPosTarget, time);
            model.userData.tweenTraslation.easing(TWEEN.Easing.Linear.None);
            model.userData.tweenTraslation.onUpdate(function(){
                model.position.x = charPosition.posX;
                model.position.z = charPosition.posZ;
                model.userData.raycasterCollision.ray.origin.set(charPosition.posX, head.position.y * 5, charPosition.posZ);
            });

            model.userData.tweenTraslation.onComplete(function(){
                if(!model.userData.playerDetectedFlag)
                    model.userData.idleFlag = true;
            });

            model.userData.tweenTraslation.onStop(function(){
                if(!model.userData.playerDetectedFlag)
                    model.userData.idleFlag = true;
                if(model.userData.playerDetectedFlag)
                    model.userData.aimFlag = true;
            });
                
            model.userData.tweenTraslation.start();
        });

        this.tweenRotation.start();
        this.run();
    }

    walk(){
        var rightUpLeg = this.model.getObjectByName('mixamorigRightUpLeg');
        var rightLeg = this.model.getObjectByName('mixamorigRightLeg');
        var rightArm = this.model.getObjectByName('mixamorigRightArm');
        var rightForeArm = this.model.getObjectByName('mixamorigRightForeArm');

        var leftUpLeg = this.model.getObjectByName('mixamorigLeftUpLeg');
        var leftLeg = this.model.getObjectByName('mixamorigLeftLeg');
        var leftArm = this.model.getObjectByName('mixamorigLeftArm');
        var leftForeArm = this.model.getObjectByName('mixamorigLeftForeArm');

        var startPosRightUpLeg = Math.abs(rightUpLeg.rotation.x);
        var startPosRightLeg = Math.abs(rightLeg.rotation.x);
        var startPosRightArm = Math.abs(rightArm.rotation.y);
        var startPosRightForeArm = Math.abs(rightForeArm.rotation.x);

        var startPosLeftUpLeg = Math.abs(leftUpLeg.rotation.x);
        var startPosLeftLeg = Math.abs(leftLeg.rotation.x);
        var startPosLeftArm = Math.abs(leftArm.rotation.y);
        var startPosLeftForeArm = Math.abs(leftForeArm.rotation.x);

        var position = {
            rotRightUpLeg: startPosRightUpLeg,
            rotRightLeg: startPosRightLeg,
            rotRightArm: startPosRightArm,
            rotRightForeArm: startPosRightForeArm,

            rotLeftUpLeg: startPosLeftUpLeg,
            rotLeftLeg: startPosLeftLeg,
            rotLeftArm: startPosLeftArm,
            rotLeftForeArm: startPosLeftForeArm
        };
        var targetA = {
            rotRightUpLeg: 1.4*Math.PI/2,
            rotRightLeg: Math.PI/2,
            rotRightArm: (30/180) * Math.PI,
            rotRightForeArm: (10/180) * Math.PI,

            rotLeftUpLeg: 2.0*Math.PI/2,
            rotLeftLeg: 0.2*Math.PI/2,
            rotLeftArm: (30/180) * Math.PI,
            rotLeftForeArm: (10/180) * Math.PI
        };
        var targetB = {
            rotRightUpLeg: startPosRightUpLeg,
            rotRightLeg: startPosRightLeg,
            rotRightArm: startPosRightArm,
            rotRightForeArm: startPosRightForeArm,

            rotLeftUpLeg: startPosLeftUpLeg,
            rotLeftLeg: startPosLeftLeg,
            rotLeftArm: startPosLeftArm,
            rotLeftForeArm: startPosLeftForeArm
        };
        var targetC = {
            rotRightUpLeg: 2.0*Math.PI/2,
            rotRightLeg: 0.2*Math.PI/2,
            rotRightArm: -(30/180) * Math.PI,
            rotRightForeArm: -(10/180) * Math.PI,

            rotLeftUpLeg: 1.4*Math.PI/2,
            rotLeftLeg: Math.PI/2,
            rotLeftArm: -(30/180) * Math.PI,
            rotLeftForeArm: -(10/180) * Math.PI
        };
        var targetD = {
            rotRightUpLeg: startPosRightUpLeg,
            rotRightLeg: startPosRightLeg,
            rotRightArm: startPosRightArm,
            rotRightForeArm: startPosRightForeArm,

            rotLeftUpLeg: startPosLeftUpLeg,
            rotLeftLeg: startPosLeftLeg,
            rotLeftArm: startPosLeftArm,
            rotLeftForeArm: startPosLeftForeArm
        };

        this.tweenWalk = new TWEEN.Tween(position).to(targetA, 600);
        this.tweenWalk.easing(TWEEN.Easing.Linear.None);
        this.tweenWalk.onUpdate(function(){
                rightUpLeg.rotation.x = position.rotRightUpLeg;
                rightLeg.rotation.x = position.rotRightLeg;
                rightArm.rotation.y = position.rotRightArm;
                rightForeArm.rotation.x = position.rotRightForeArm;

                leftUpLeg.rotation.x = position.rotLeftUpLeg;
                leftLeg.rotation.x = position.rotLeftLeg;
                leftArm.rotation.y = position.rotLeftArm;
                leftForeArm.rotation.x = position.rotLeftForeArm;
        });

        var tweenBackA = new TWEEN.Tween(position).to(targetB, 600);
        tweenBackA.easing(TWEEN.Easing.Linear.None);
        tweenBackA.onUpdate(function(){
                rightUpLeg.rotation.x = position.rotRightUpLeg;
                rightLeg.rotation.x = position.rotRightLeg;
                rightArm.rotation.y = position.rotRightArm;
                rightForeArm.rotation.x = position.rotRightForeArm;

                leftUpLeg.rotation.x = position.rotLeftUpLeg;
                leftLeg.rotation.x = position.rotLeftLeg;
                leftArm.rotation.y = position.rotLeftArm;
                leftForeArm.rotation.x = position.rotLeftForeArm;
        });

        var tweenB = new TWEEN.Tween(position).to(targetC, 600);
        tweenB.easing(TWEEN.Easing.Linear.None);
        tweenB.onUpdate(function(){
                rightUpLeg.rotation.x = position.rotRightUpLeg;
                rightLeg.rotation.x = position.rotRightLeg;
                rightArm.rotation.y = position.rotRightArm;
                rightForeArm.rotation.x = position.rotRightForeArm;

                leftUpLeg.rotation.x = position.rotLeftUpLeg;
                leftLeg.rotation.x = position.rotLeftLeg;
                leftArm.rotation.y = position.rotLeftArm;
                leftForeArm.rotation.x = position.rotLeftForeArm;
        });

        var tweenBackB = new TWEEN.Tween(position).to(targetD, 600);
        tweenBackB.easing(TWEEN.Easing.Linear.None);
        tweenBackB.onUpdate(function(){
                rightUpLeg.rotation.x = position.rotRightUpLeg;
                rightLeg.rotation.x = position.rotRightLeg;
                rightArm.rotation.y = position.rotRightArm;
                rightForeArm.rotation.x = position.rotRightForeArm;

                leftUpLeg.rotation.x = position.rotLeftUpLeg;
                leftLeg.rotation.x = position.rotLeftLeg;
                leftArm.rotation.y = position.rotLeftArm;
                leftForeArm.rotation.x = position.rotLeftForeArm;
        });

        this.tweenWalk.chain(tweenBackA);
        tweenBackA.chain(tweenB);
        tweenB.chain(tweenBackB);
        tweenBackB.chain(this.tweenWalk);

        this.tweenWalk.start();
    }

    run(){
        var rightUpLeg = this.model.getObjectByName('mixamorigRightUpLeg');
        var rightLeg = this.model.getObjectByName('mixamorigRightLeg');
        var rightArm = this.model.getObjectByName('mixamorigRightArm');
        var rightForeArm = this.model.getObjectByName('mixamorigRightForeArm');

        var leftUpLeg = this.model.getObjectByName('mixamorigLeftUpLeg');
        var leftLeg = this.model.getObjectByName('mixamorigLeftLeg');
        var leftArm = this.model.getObjectByName('mixamorigLeftArm');
        var leftForeArm = this.model.getObjectByName('mixamorigLeftForeArm');

        var startPosRightUpLeg = Math.abs(rightUpLeg.rotation.x);
        var startPosRightLeg = Math.abs(rightLeg.rotation.x);
        var startPosRightArm = Math.abs(rightArm.rotation.y);
        var startPosRightForeArm = Math.abs(rightForeArm.rotation.x);

        var startPosLeftUpLeg = Math.abs(leftUpLeg.rotation.x);
        var startPosLeftLeg = Math.abs(leftLeg.rotation.x);
        var startPosLeftArm = Math.abs(leftArm.rotation.y);
        var startPosLeftForeArm = Math.abs(leftForeArm.rotation.x);

        var position = {
            rotRightUpLeg: startPosRightUpLeg,
            rotRightLeg: startPosRightLeg,
            rotRightArm: startPosRightArm,
            rotRightForeArm: startPosRightForeArm,

            rotLeftUpLeg: startPosLeftUpLeg,
            rotLeftLeg: startPosLeftLeg,
            rotLeftArm: startPosLeftArm,
            rotLeftForeArm: startPosLeftForeArm
        };
        var targetA = {
            rotRightUpLeg: 1.4*Math.PI/2,
            rotRightLeg: Math.PI/2,
            rotRightArm: (30/180) * Math.PI,
            rotRightForeArm: (10/180) * Math.PI,

            rotLeftUpLeg: 2.0*Math.PI/2,
            rotLeftLeg: 0.2*Math.PI/2,
            rotLeftArm: (30/180) * Math.PI,
            rotLeftForeArm: (10/180) * Math.PI
        };
        var targetB = {
            rotRightUpLeg: startPosRightUpLeg,
            rotRightLeg: startPosRightLeg,
            rotRightArm: startPosRightArm,
            rotRightForeArm: startPosRightForeArm,

            rotLeftUpLeg: startPosLeftUpLeg,
            rotLeftLeg: startPosLeftLeg,
            rotLeftArm: startPosLeftArm,
            rotLeftForeArm: startPosLeftForeArm
        };
        var targetC = {
            rotRightUpLeg: 2.0*Math.PI/2,
            rotRightLeg: 0.2*Math.PI/2,
            rotRightArm: -(30/180) * Math.PI,
            rotRightForeArm: -(10/180) * Math.PI,

            rotLeftUpLeg: 1.4*Math.PI/2,
            rotLeftLeg: Math.PI/2,
            rotLeftArm: -(30/180) * Math.PI,
            rotLeftForeArm: -(10/180) * Math.PI
        };
        var targetD = {
            rotRightUpLeg: startPosRightUpLeg,
            rotRightLeg: startPosRightLeg,
            rotRightArm: startPosRightArm,
            rotRightForeArm: startPosRightForeArm,

            rotLeftUpLeg: startPosLeftUpLeg,
            rotLeftLeg: startPosLeftLeg,
            rotLeftArm: startPosLeftArm,
            rotLeftForeArm: startPosLeftForeArm
        };

        this.tweenRun = new TWEEN.Tween(position).to(targetA, 300);
        this.tweenRun.easing(TWEEN.Easing.Linear.None);
        this.tweenRun.onUpdate(function(){
                rightUpLeg.rotation.x = position.rotRightUpLeg;
                rightLeg.rotation.x = position.rotRightLeg;
                rightArm.rotation.y = position.rotRightArm;
                rightForeArm.rotation.x = position.rotRightForeArm;

                leftUpLeg.rotation.x = position.rotLeftUpLeg;
                leftLeg.rotation.x = position.rotLeftLeg;
                leftArm.rotation.y = position.rotLeftArm;
                leftForeArm.rotation.x = position.rotLeftForeArm;
        });

        var tweenBackA = new TWEEN.Tween(position).to(targetB, 300);
        tweenBackA.easing(TWEEN.Easing.Linear.None);
        tweenBackA.onUpdate(function(){
                rightUpLeg.rotation.x = position.rotRightUpLeg;
                rightLeg.rotation.x = position.rotRightLeg;
                rightArm.rotation.y = position.rotRightArm;
                rightForeArm.rotation.x = position.rotRightForeArm;

                leftUpLeg.rotation.x = position.rotLeftUpLeg;
                leftLeg.rotation.x = position.rotLeftLeg;
                leftArm.rotation.y = position.rotLeftArm;
                leftForeArm.rotation.x = position.rotLeftForeArm;
        });

        var tweenB = new TWEEN.Tween(position).to(targetC, 300);
        tweenB.easing(TWEEN.Easing.Linear.None);
        tweenB.onUpdate(function(){
                rightUpLeg.rotation.x = position.rotRightUpLeg;
                rightLeg.rotation.x = position.rotRightLeg;
                rightArm.rotation.y = position.rotRightArm;
                rightForeArm.rotation.x = position.rotRightForeArm;

                leftUpLeg.rotation.x = position.rotLeftUpLeg;
                leftLeg.rotation.x = position.rotLeftLeg;
                leftArm.rotation.y = position.rotLeftArm;
                leftForeArm.rotation.x = position.rotLeftForeArm;
        });

        var tweenBackB = new TWEEN.Tween(position).to(targetD, 300);
        tweenBackB.easing(TWEEN.Easing.Linear.None);
        tweenBackB.onUpdate(function(){
                rightUpLeg.rotation.x = position.rotRightUpLeg;
                rightLeg.rotation.x = position.rotRightLeg;
                rightArm.rotation.y = position.rotRightArm;
                rightForeArm.rotation.x = position.rotRightForeArm;

                leftUpLeg.rotation.x = position.rotLeftUpLeg;
                leftLeg.rotation.x = position.rotLeftLeg;
                leftArm.rotation.y = position.rotLeftArm;
                leftForeArm.rotation.x = position.rotLeftForeArm;
        });

        this.tweenRun.chain(tweenBackA);
        tweenBackA.chain(tweenB);
        tweenB.chain(tweenBackB);
        tweenBackB.chain(this.tweenRun);

        this.tweenRun.start();
    }

    aim(){
        var model = this.model;
        model.userData.aimFlag = false;

        var rightUpLeg = this.model.getObjectByName('mixamorigRightUpLeg');
        var rightLeg = this.model.getObjectByName('mixamorigRightLeg');
        var rightArm = this.model.getObjectByName('mixamorigRightArm');
        var rightForeArm = this.model.getObjectByName('mixamorigRightForeArm');
        var rightHand = this.model.getObjectByName('mixamorigRightHand');

        var leftUpLeg = this.model.getObjectByName('mixamorigLeftUpLeg');
        var leftLeg = this.model.getObjectByName('mixamorigLeftLeg');
        var leftArm = this.model.getObjectByName('mixamorigLeftArm');
        var leftForeArm = this.model.getObjectByName('mixamorigLeftForeArm');
        
        var startPosRightUpLeg = Math.abs(rightUpLeg.rotation.x);
        var startPosRightLeg = Math.abs(rightLeg.rotation.x);
        var startPosRightArmY = Math.abs(rightArm.rotation.y);
        var startPosRightArmZ = Math.abs(rightArm.rotation.z);
        var startPosRightForeArm = Math.abs(rightForeArm.rotation.x);
        var startPosRightHandY = Math.abs(rightHand.rotation.y);
        var startPosRightHandZ = Math.abs(rightHand.rotation.z);

        var startPosLeftUpLeg = Math.abs(leftUpLeg.rotation.x);
        var startPosLeftLeg = Math.abs(leftLeg.rotation.x);
        var startPosLeftArm = Math.abs(leftArm.rotation.y);
        var startPosLeftForeArm = Math.abs(leftForeArm.rotation.x);

        var position = {
            rotRightUpLeg: startPosRightUpLeg,
            rotRightLeg: startPosRightLeg,
            rotRightArmY: startPosRightArmY,
            rotRightArmZ: startPosRightArmZ,
            rotRightForeArm: startPosRightForeArm,
            rotRightHandY: startPosRightHandY,
            rotRightHandZ: startPosRightHandZ,

            rotLeftUpLeg: startPosLeftUpLeg,
            rotLeftLeg: startPosLeftLeg,
            rotLeftArm: startPosLeftArm,
            rotLeftForeArm: startPosLeftForeArm
        };
        var target = {
            rotRightUpLeg: 3.141592653589793,
            rotRightLeg: 0,
            rotRightArmY: -Math.PI/2, 
            rotRightArmZ: 110/180*Math.PI,
            rotRightForeArm: 0,
            rotRightHandY: -Math.PI/2,
            rotRightHandZ: -Math.PI/2,

            rotLeftUpLeg: 3.141592653589793,
            rotLeftLeg: 0,
            rotLeftArm: 0,
            rotLeftForeArm: 0
        };

        this.tweenAim = new TWEEN.Tween(position).to(target, 200);
        this.tweenAim.easing(TWEEN.Easing.Linear.None);
        this.tweenAim.onUpdate(function(){
            rightUpLeg.rotation.x = position.rotRightUpLeg;
            rightLeg.rotation.x = position.rotRightLeg;
            rightArm.rotation.y = -position.rotRightArmY;
            rightArm.rotation.z = position.rotRightArmZ;
            rightForeArm.rotation.x = -position.rotRightForeArm;
            rightHand.rotation.y = position.rotRightHandY;
            rightHand.rotation.z = position.rotRightHandZ;

            leftUpLeg.rotation.x = position.rotLeftUpLeg;
            leftLeg.rotation.x = position.rotLeftLeg;
            leftArm.rotation.y = -position.rotLeftArm;
            leftForeArm.rotation.x = -position.rotLeftForeArm;
        });

        this.tweenAim.onComplete(function(){
            model.userData.canShootFlag = true;
        });

        this.tweenAim.onStop(function(){
            model.userData.playerDetectedFlag = false;
        });

        this.tweenAim.start();
    }

    die(){
        var model = this.model;
        var scene = this.scene;
        scene.remove(model.userData.shield);

        var startPos = Math.abs(model.rotation.x);

        var position = {
            rot: startPos
        };
        var target = {
            rot: -Math.PI/2 
        };

        this.tweenDie = new TWEEN.Tween(position).to(target, 2000);
        this.tweenDie.easing(TWEEN.Easing.Linear.None);
        this.tweenDie.onUpdate(function(){
            model.rotation.x = position.rot;
        });

        this.tweenDie.onComplete(function(){
            scene.remove(model);
        });

        this.tweenDie.start();
    }

    createBullet(){
        var model = this.model;
        var scene = this.scene;

        var bulletGeometry = new THREE.SphereGeometry(0.8, 8, 8);
        var bulletMaterial = new THREE.MeshPhongMaterial({map: new THREE.TextureLoader().load('textures/energyball.png')});
        this.bullet = new THREE.Mesh(bulletGeometry, bulletMaterial);

        var tmp = new THREE.Vector3().copy(model.userData.raycasterCollision.ray.direction);
        var distance = 5;
        var pointB = new THREE.Vector3();
        pointB.addVectors ( model.position, tmp.multiplyScalar( distance ) );

        this.bullet.position.set(pointB.x, 16, pointB.z);
        this.bullet.userData.bulletRaycaster = new THREE.Raycaster(this.bullet.position, this.model.userData.direction, 0, 2);

        scene.add(this.bullet);
        model.userData.bulletReadyFlag = true;
    }

    shootBullet(){
        this.bullet.position.x -= this.bulletSpeed*Math.sin(this.model.rotation.y)/3;
        this.bullet.position.y += 0;
        this.bullet.position.z -= this.bulletSpeed*Math.cos(this.model.rotation.y)/3;

        this.bullet.userData.bulletRaycaster.ray.origin = new THREE.Vector3(this.bullet.position.x, 
            this.bullet.position.y, this.bullet.position.z);
    }

    updateHealth(){
        var damage = this.player.damage;    
        this.health = this.health - damage;

        var healthBar = this.model.getObjectByName("healthBar");
        
        switch(this.gameDifficulty){
            case 0:
                var newWidth = (10 * this.health)/100;
                newWidth = newWidth/100;
                break;
            case 1:
                var newWidth = (10 * this.health)/120;
                newWidth = newWidth/120;
                break;
            case 2:
                var newWidth = (10 * this.health)/160;
                newWidth = newWidth/160;
                break;
        }
        
        healthBar.scale.set(newWidth, healthBar.scale.y, healthBar.scale.z);

        if(this.health <= 0)
            this.model.userData.deadFlag = true;
    }

    checkSoldierCollisions(){
        var intersects1 = this.model.userData.raycasterCollision.intersectObjects( this.scene.children );
        var intersects2 = this.model.userData.raycasterCollision.intersectObjects( this.arrayOfSoldierMeshesToDetect );
        var intersects3 = this.model.userData.raycasterCollision.intersectObject( this.playerMesh );
        var intersects = intersects1.concat(intersects2, intersects3);

        if(this.model.userData.playerDetectedFlag && intersects.length == 0){
            if(!this.model.userData.aimFlag)
                this.tweenAim.stop();
            this.model.userData.canShootFlag = false;
            this.model.userData.bulletReadyFlag = false;
            this.model.userData.playerDetectedFlag = false;
            this.model.userData.aimFlag = false;
            this.model.userData.idleFlag = true;

            if(this.bullet)
                this.scene.remove(this.bullet);
        }

        if(intersects.length > 0){
            for(var i = 0; i < intersects.length; i++){
                if(intersects[i].object.name == "player" && !this.model.userData.playerDetectedFlag){
                    console.log("TROVATO PLAYER");
                    this.model.userData.playerDetectedFlag = true;
                    this.model.userData.aimFlag = true;
                }
                    
                if((intersects[i].object.name == "wall" || intersects[i].object.name == "enemy") && !this.model.userData.collisionFlag){
                    console.log("COLLISION");
                    this.model.userData.collisionFlag = true;
                }
            }
        }
    }

    checkBulletCollisions(){
        var model = this.model;
        var bulletIntersects1 = this.bullet.userData.bulletRaycaster.intersectObjects( this.scene.children );
        var bulletIntersects2 = this.bullet.userData.bulletRaycaster.intersectObject( this.playerMesh );
        var bulletIntersects = bulletIntersects1.concat(bulletIntersects2);

        if(this.model.userData.bulletReadyFlag && bulletIntersects.length > 0){
            for(var i=0; i < bulletIntersects.length; i++)
                if(bulletIntersects[i].object.name == "wall" || bulletIntersects[i].object.name == "player"){
                    if(bulletIntersects[i].object.name == "player"){
                        this.player.addDamage();
                    }
                    this.scene.remove(this.bullet);
                    model.userData.bulletReadyFlag = false;
                }
        }
    }

    checkFlags(){
        this.checkSoldierCollisions();

        if((!this.model.userData.patrolFlag || !this.model.userData.reachPlayerFlag) && this.model.userData.idleFlag){
            this.tweenRun.stop();
            this.tweenWalk.stop();
            this.idle();
        }

        if(this.model.userData.patrolFlag && !this.model.userData.idleFlag){
            this.tweenIdle.stop();
            this.patrol();
        }

        if(this.model.userData.reachPlayerFlag && !this.model.userData.idleFlag){
            this.tweenIdle.stop();
            this.reachPlayer();
        }

        if(this.model.userData.collisionFlag)
            this.model.userData.tweenTraslation.stop();
        
        if(!this.model.userData.canBeDamagedFlag)
            this.model.visible = !this.model.visible;

        if(this.model.userData.isDamagedFlag && !this.model.userData.playerDetectedFlag){
            var model = this.model;

            this.tweenWalk.stop();
            this.tweenRun.stop();
            this.model.userData.tweenTraslation.stop();
            this.updateHealth();
            this.model.userData.canBeDamagedFlag = false;
            this.model.userData.isDamagedFlag = false;
            this.model.userData.searchPlayerFlag = true;

            setTimeout(function(){
                model.userData.canBeDamagedFlag = true;
                model.visible = true;
            }, 1000);
        }
        
        if(this.model.userData.isDamagedFlag && this.model.userData.playerDetectedFlag){
            var model = this.model;

            this.updateHealth();
            this.model.userData.canBeDamagedFlag = false;
            this.model.userData.isDamagedFlag = false;

            setTimeout(function(){
                model.userData.canBeDamagedFlag = true;
                model.visible = true;
            }, 1000);
        }

        if(this.model.userData.playerDetectedFlag && this.model.userData.aimFlag){
            this.model.userData.tweenTraslation.stop();
            this.tweenWalk.stop();
            this.tweenRun.stop();
            this.aim();
        }

        if(this.model.userData.canShootFlag && !this.model.userData.bulletReadyFlag)
            this.createBullet();

        if(this.model.userData.bulletReadyFlag)
            this.checkBulletCollisions();

        if(this.model.userData.bulletReadyFlag && this.model.userData.canShootFlag)
            this.shootBullet();
        
        if(this.model.userData.deadFlag){
            if(this.bullet)
                this.scene.remove(this.bullet);

            this.die();
        }
    }


}