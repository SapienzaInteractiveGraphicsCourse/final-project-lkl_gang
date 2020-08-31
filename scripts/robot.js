const scale = 4;
export default class Robot {
    constructor(model) {
        this.model = model;
        this.model.rotation.y = 0;
        this.model.scale.set(scale, scale, scale);

        this.life = 100;
        this.n_bullets = 10;

        this.arrayOfSoldierMeshesToDetect = [];

        this.tweenForwardWalk = new TWEEN.Tween(0,0,0).to((1,1,1),1000);
        this.tweenBackwardWalk = new TWEEN.Tween(0,0,0).to((1,1,1),1000);
        this.tweenIdle = new TWEEN.Tween(0,0,0).to((1,1,1),1000);
        this.tweenAttack = new TWEEN.Tween(0,0,0).to((1,1,1),1000);

        this.character = model.getObjectByName('RootNode');
        this.character.userData.idleFlag = true;
        this.character.userData.walkForwardFlag = false;
        this.character.userData.walkBackwardFlag = false;
        this.character.userData.attackFlag = false;

        this.head = model.getObjectByName('Head_0');
        this.head.add( model.getObjectByName('Head_1'));
        this.head.add( model.getObjectByName('Head_2'));

        this.rightArm = model.getObjectByName('ShoulderR');
        this.rightForeArm = model.getObjectByName('LowerArmR');
        this.rightHand = model.getObjectByName('HandR');

        this.leftArm = model.getObjectByName('ShoulderL');
        this.leftForeArm = model.getObjectByName('LowerArmL');

        this.rightUpLeg = model.getObjectByName('UpperLegR');
        this.rightLeg = model.getObjectByName('LowerLegR');
        this.rightFoot = model.getObjectByName('FootR');
        this.rightLeg.attach(this.rightFoot);

        this.leftUpLeg = model.getObjectByName('UpperLegL');
        this.leftLeg = model.getObjectByName('LowerLegL');
        this.leftFoot = model.getObjectByName('FootL');
        this.leftLeg.attach(this.leftFoot);

        this.raycaster = new THREE.Raycaster();

        var geometry = new THREE.SphereGeometry( 0.4, 32, 32 );
        var material = new THREE.MeshBasicMaterial( {color: 0x0000ff} );
        var sphere = new THREE.Mesh( geometry, material );
        this.ammo = sphere;

        //hitbox
        var cube = new THREE.BoxGeometry(2.8,4.2,2.5);
        var materialCube = new THREE.MeshLambertMaterial({wireframe: true});
        var hitbox = new THREE.Mesh(cube, materialCube);
        hitbox.position.y = 2.2;
        hitbox.name = "player";
        this.character.add(hitbox);
    }

    setAmmo(){
        this.character.add(this.ammo);
        this.ammo.position.set(-1,1.5,1.4);
        this.character.userData.ammoAttackFlag = true;
    }

    getComponents(){
        this.model.traverse(function(child){
            console.log(child.name);
        });
    }

    getLife(){
        return this.life;
    }

    getBullets(){
        return this.n_bullets;
    }

    addDamage(){
        this.life -= 15;
    }

    walk(){
        var model = this.model;
        var character = this.character;
        character.userData.walkForwardFlag = true;
        character.userData.idleFlag = false;

        var rightArm = this.model.getObjectByName('ShoulderR');
        var leftArm = this.model.getObjectByName('ShoulderL');

        var rightUpLeg = this.model.getObjectByName('UpperLegR');
        var rightLeg = this.model.getObjectByName('LowerLegR');
        var leftUpLeg = this.model.getObjectByName('UpperLegL');
        var leftLeg = this.model.getObjectByName('LowerLegL');

        var startPosRightUpLeg = Math.abs(this.rightUpLeg.rotation.x);
        var startPosRightLeg = Math.abs(this.rightLeg.rotation.x);
        var startPosRightArm = Math.abs(this.rightArm.rotation.x);

        var startPosLeftUpLeg = Math.abs(this.leftUpLeg.rotation.x);
        var startPosLeftLeg = Math.abs(this.leftLeg.rotation.x);
        var startPosLeftArm = Math.abs(this.leftArm.rotation.x);

        var startPosModelx = model.position.x;
        var startPosModelz = model.position.z;

        var position = {
            rotRightUpLeg: startPosRightUpLeg,
            rotRightLeg: startPosRightLeg,
            rotRightArm: startPosRightArm,

            rotLeftUpLeg: startPosLeftUpLeg,
            rotLeftLeg: startPosLeftLeg,
            rotLeftArm: startPosLeftArm,

            posModelx: startPosModelx,
            posModelz: startPosModelz
        };

        var targetA = {
            rotRightUpLeg: 1.4*Math.PI/2,
            rotRightLeg: Math.PI/2,
            rotRightArm: (30/180) * Math.PI,

            rotLeftUpLeg: 2.0*Math.PI/2,
            rotLeftLeg: 0.2*Math.PI/2,
            rotLeftArm: -(30/180) * Math.PI,

            posModelx: startPosModelx + 3*Math.sin(model.rotation.y),
            posModelz: startPosModelz + 3*Math.cos(model.rotation.y)
        };
        var targetB = {
            rotRightUpLeg: startPosRightUpLeg,
            rotRightLeg: startPosRightLeg,
            rotRightArm: startPosRightArm,

            rotLeftUpLeg: startPosLeftUpLeg,
            rotLeftLeg: startPosLeftLeg,
            rotLeftArm: startPosLeftArm,
        };
        var targetC = {
            rotRightUpLeg: 2.0*Math.PI/2,
            rotRightLeg: 0.2*Math.PI/2,
            rotRightArm: -(30/180) * Math.PI,

            rotLeftUpLeg: 1.4*Math.PI/2,
            rotLeftLeg: Math.PI/2,
            rotLeftArm: (30/180) * Math.PI,

            posModelx: startPosModelx + 6*Math.sin(model.rotation.y),
            posModelz: startPosModelz + 6*Math.cos(model.rotation.y)
        };
        var targetD = {
            rotRightUpLeg: startPosRightUpLeg,
            rotRightLeg: startPosRightLeg,
            rotRightArm: startPosRightArm,

            rotLeftUpLeg: startPosLeftUpLeg,
            rotLeftLeg: startPosLeftLeg,
            rotLeftArm: startPosLeftArm,
        };

        this.tweenForwardWalk = new TWEEN.Tween(position).to(targetA, 100);
        this.tweenForwardWalk.easing(TWEEN.Easing.Linear.None);
        this.tweenForwardWalk.onUpdate(function(){
            rightUpLeg.rotation.x = position.rotRightUpLeg;
            rightLeg.rotation.x = position.rotRightLeg;
            rightArm.rotation.x = position.rotRightArm;

            leftUpLeg.rotation.x = position.rotLeftUpLeg;
            leftLeg.rotation.x = position.rotLeftLeg;
            leftArm.rotation.x= position.rotLeftArm;

            model.position.x = position.posModelx;
            model.position.z = position.posModelz;
        });

        var tweenBackA = new TWEEN.Tween(position).to(targetB, 100);
        tweenBackA.easing(TWEEN.Easing.Linear.None);
        tweenBackA.onUpdate(function(){
            rightUpLeg.rotation.x = position.rotRightUpLeg;
            rightLeg.rotation.x = position.rotRightLeg;
            rightArm.rotation.x = position.rotRightArm;

            leftUpLeg.rotation.x = position.rotLeftUpLeg;
            leftLeg.rotation.x = position.rotLeftLeg;
            leftArm.rotation.x = position.rotLeftArm;
        });

        var tweenB = new TWEEN.Tween(position).to(targetC, 100);
        tweenB.easing(TWEEN.Easing.Linear.None);
        tweenB.onUpdate(function(){
            rightUpLeg.rotation.x = position.rotRightUpLeg;
            rightLeg.rotation.x = position.rotRightLeg;
            rightArm.rotation.x = position.rotRightArm;

            leftUpLeg.rotation.x = position.rotLeftUpLeg;
            leftLeg.rotation.x = position.rotLeftLeg;
            leftArm.rotation.x = position.rotLeftArm;

            model.position.x = position.posModelx;
            model.position.z = position.posModelz;
        });

        var tweenBackB = new TWEEN.Tween(position).to(targetD, 100);
            tweenBackB.easing(TWEEN.Easing.Linear.None);
            tweenBackB.onUpdate(function(){
                rightUpLeg.rotation.x = position.rotRightUpLeg;
                rightLeg.rotation.x = position.rotRightLeg;
                rightArm.rotation.x = position.rotRightArm;

                leftUpLeg.rotation.x = position.rotLeftUpLeg;
                leftLeg.rotation.x = position.rotLeftLeg;
                leftArm.rotation.x = position.rotLeftArm;
            });
            tweenBackB.onComplete(() =>{
                character.userData.walkForwardFlag = false;
                character.userData.idleFlag = true;
            });

        this.tweenForwardWalk.chain(tweenBackA);
        tweenBackA.chain(tweenB);
        tweenB.chain(tweenBackB);

        this.tweenForwardWalk.start();
    }

    backwardWalk(){
        var model = this.model;
        var character = this.character;
        character.userData.walkBackwardFlag = true;
        character.userData.idleFlag = false;

        var rightArm = this.model.getObjectByName('ShoulderR');
        var leftArm = this.model.getObjectByName('ShoulderL');

        var rightUpLeg = this.model.getObjectByName('UpperLegR');
        var rightLeg = this.model.getObjectByName('LowerLegR');
        var leftUpLeg = this.model.getObjectByName('UpperLegL');
        var leftLeg = this.model.getObjectByName('LowerLegL');

        var startPosRightUpLeg = Math.abs(this.rightUpLeg.rotation.x);
        var startPosRightLeg = Math.abs(this.rightLeg.rotation.x);
        var startPosRightArm = Math.abs(this.rightArm.rotation.x);

        var startPosLeftUpLeg = Math.abs(this.leftUpLeg.rotation.x);
        var startPosLeftLeg = Math.abs(this.leftLeg.rotation.x);
        var startPosLeftArm = Math.abs(this.leftArm.rotation.x);

        var startPosModelx = model.position.x;
        var startPosModelz = model.position.z;

        var position = {
            rotRightUpLeg: startPosRightUpLeg,
            rotRightLeg: startPosRightLeg,
            rotRightArm: startPosRightArm,

            rotLeftUpLeg: startPosLeftUpLeg,
            rotLeftLeg: startPosLeftLeg,
            rotLeftArm: startPosLeftArm,

            posModelx: startPosModelx,
            posModelz: startPosModelz
        };

        var targetA = {
            rotRightUpLeg: 1.4*Math.PI/2,
            rotRightLeg: Math.PI/2,
            rotRightArm: (30/180) * Math.PI,

            rotLeftUpLeg: 2.0*Math.PI/2,
            rotLeftLeg: 0.2*Math.PI/2,
            rotLeftArm: -(30/180) * Math.PI,

            posModelx: startPosModelx - 3*Math.sin(model.rotation.y),
            posModelz: startPosModelz - 3*Math.cos(model.rotation.y)
        };
        var targetB = {
            rotRightUpLeg: startPosRightUpLeg,
            rotRightLeg: startPosRightLeg,
            rotRightArm: startPosRightArm,

            rotLeftUpLeg: startPosLeftUpLeg,
            rotLeftLeg: startPosLeftLeg,
            rotLeftArm: startPosLeftArm,
        };
        var targetC = {
            rotRightUpLeg: 2.0*Math.PI/2,
            rotRightLeg: 0.2*Math.PI/2,
            rotRightArm: -(30/180) * Math.PI,

            rotLeftUpLeg: 1.4*Math.PI/2,
            rotLeftLeg: Math.PI/2,
            rotLeftArm: (30/180) * Math.PI,

            posModelx: startPosModelx - 6*Math.sin(model.rotation.y),
            posModelz: startPosModelz - 6*Math.cos(model.rotation.y)
        };
        var targetD = {
            rotRightUpLeg: startPosRightUpLeg,
            rotRightLeg: startPosRightLeg,
            rotRightArm: startPosRightArm,

            rotLeftUpLeg: startPosLeftUpLeg,
            rotLeftLeg: startPosLeftLeg,
            rotLeftArm: startPosLeftArm
        };

        this.tweenBackwardWalk = new TWEEN.Tween(position).to(targetA, 100);
        this.tweenBackwardWalk.easing(TWEEN.Easing.Linear.None);
        this.tweenBackwardWalk.onUpdate(function(){
            rightUpLeg.rotation.x = position.rotRightUpLeg;
            rightLeg.rotation.x = position.rotRightLeg;
            rightArm.rotation.x = position.rotRightArm;

            leftUpLeg.rotation.x = position.rotLeftUpLeg;
            leftLeg.rotation.x = position.rotLeftLeg;
            leftArm.rotation.x= position.rotLeftArm;

            model.position.x = position.posModelx;
            model.position.z = position.posModelz;
        });

        var tweenBackA = new TWEEN.Tween(position).to(targetB, 100);
        tweenBackA.easing(TWEEN.Easing.Linear.None);
        tweenBackA.onUpdate(function(){
            rightUpLeg.rotation.x = position.rotRightUpLeg;
            rightLeg.rotation.x = position.rotRightLeg;
            rightArm.rotation.x = position.rotRightArm;

            leftUpLeg.rotation.x = position.rotLeftUpLeg;
            leftLeg.rotation.x = position.rotLeftLeg;
            leftArm.rotation.x = position.rotLeftArm;
        });

        var tweenB = new TWEEN.Tween(position).to(targetC, 100);
        tweenB.easing(TWEEN.Easing.Linear.None);
        tweenB.onUpdate(function(){
            rightUpLeg.rotation.x = position.rotRightUpLeg;
            rightLeg.rotation.x = position.rotRightLeg;
            rightArm.rotation.x = position.rotRightArm;

            leftUpLeg.rotation.x = position.rotLeftUpLeg;
            leftLeg.rotation.x = position.rotLeftLeg;
            leftArm.rotation.x = position.rotLeftArm;

            model.position.x = position.posModelx;
            model.position.z = position.posModelz;
        });

        var tweenBackB = new TWEEN.Tween(position).to(targetD, 100);
        tweenBackB.easing(TWEEN.Easing.Linear.None);
        tweenBackB.onUpdate(function(){
            rightUpLeg.rotation.x = position.rotRightUpLeg;
            rightLeg.rotation.x = position.rotRightLeg;
            rightArm.rotation.x = position.rotRightArm;

            leftUpLeg.rotation.x = position.rotLeftUpLeg;
            leftLeg.rotation.x = position.rotLeftLeg;
            leftArm.rotation.x = position.rotLeftArm;
        });
        tweenBackB.onComplete(() =>{
            character.userData.walkBackwardFlag = false;
            character.userData.idleFlag = true;
        });

        this.tweenBackwardWalk.chain(tweenBackA);
        tweenBackA.chain(tweenB);
        tweenB.chain(tweenBackB);

        this.tweenBackwardWalk.start();
    }

    idle(){
        var character = this.character;

        character.userData.idleFlag = false;

        var head = this.model.getObjectByName('Head_0');
        var startPosHead = Math.abs(head.rotation.z);

        var position = {
            rotHead: startPosHead
        };

        var targetA = {
            rotHead: -(45/180) * Math.PI
        };
        var targetB = {
            rotHead: startPosHead
        };
        var targetC = {
            rotHead: (45/180) * Math.PI
        };
        var targetD = {
            rotHead: startPosHead
        };

        this.tweenIdle = new TWEEN.Tween(position).to(targetA, 1000);
        this.tweenIdle.easing(TWEEN.Easing.Linear.None);
        this.tweenIdle.onUpdate(function(){
            head.rotation.z = position.rotHead;
        });

        var tweenBackA = new TWEEN.Tween(position).to(targetB, 1000);
        tweenBackA.easing(TWEEN.Easing.Linear.None);
        tweenBackA.onUpdate(function(){
            head.rotation.z = position.rotHead;
        });

        var tweenB = new TWEEN.Tween(position).to(targetC, 1000);
        tweenB.easing(TWEEN.Easing.Linear.None);
        tweenB.onUpdate(function(){
            head.rotation.z = position.rotHead;
        });

        var tweenBackB = new TWEEN.Tween(position).to(targetD, 1000);
        tweenBackB.easing(TWEEN.Easing.Linear.None);
        tweenBackB.onUpdate(function(){
            head.rotation.z = position.rotHead;
        });

        this.tweenIdle.chain(tweenBackA);
        tweenBackA.chain(tweenB);
        tweenB.chain(tweenBackB);
        tweenBackB.chain(this.tweenIdle);

        this.tweenIdle.start();
    }

    // TODO: detach ammo from model
    attackAnimation(){
        var character = this.character;
        character.userData.attackFlag = true;
        character.userData.idleFlag = false;

        var rightArm = this.model.getObjectByName('ShoulderR');
        var rightForeArm = this.model.getObjectByName('LowerArmR');
        var ammo = this.ammo;
        ammo.position.set(new THREE.Vector3(0,0,0))
        ammo.visible = true;

        var startPosRightArm = Math.abs(this.rightArm.rotation.x);
        var startPosRightForeArm = Math.abs(this.rightForeArm.rotation.x);

        var position = {
            rotRightArm: startPosRightArm,
            rotRightForeArm: startPosRightForeArm,
        };

        var targetA = {
            rotRightArm: -(75/180) * Math.PI,
            rotRightForeArm: 0,
        };

        var targetB = {
            rotRightArm: startPosRightArm,
            rotRightForeArm: startPosRightForeArm,
        };

        this.tweenAttack = new TWEEN.Tween(position).to(targetA, 500);
        this.tweenAttack.easing(TWEEN.Easing.Linear.None);
        this.tweenAttack.onUpdate(function(){
            rightArm.rotation.x = position.rotRightArm;
            rightForeArm.rotation.x = position.rotRightForeArm;
        });

        var tweenBackA = new TWEEN.Tween(position).to(targetB, 500);
        tweenBackA.easing(TWEEN.Easing.Linear.None);
        tweenBackA.onUpdate(function(){
            rightArm.rotation.x = position.rotRightArm;
            rightForeArm.rotation.x = position.rotRightForeArm;
        });
        tweenBackA.onComplete(() =>{
            character.userData.attackFlag = false;
            character.userData.idleFlag = true;
        });

        this.tweenAttack.chain(tweenBackA);
        this.tweenAttack.start();
        
        //New code
        var b_num = document.getElementById("bulletsNum");
		if(this.n_bullets > 0)
			b_num.textContent = this.n_bullets-1;
			if(this.n_bullets - 1 == 0)
                document.getElementById("recharge").style.visibility = "visible";
        this.n_bullets = this.n_bullets - 1;
    }

    //TODO: powerup objects interaction, fix distance from enemy and wall
    checkIntersectionBody(source, scene){
        var direction = new THREE.Vector3();
        source.getWorldDirection(direction);
        var position = source.position.clone();
        console.log(position);
        this.raycaster.set(position, direction);
        scene.add(new THREE.ArrowHelper(this.raycaster.ray.direction, this.raycaster.ray.origin, 150, 0xff0000) );
        var intersects1 = this.raycaster.intersectObjects(scene.children);
        var intersects2 = this.raycaster.intersectObjects(this.arrayOfSoldierMeshesToDetect);
        var intersects = intersects1.concat(intersects2);
        intersects.forEach((element)=>{
            var object = element.object.name;
            switch(object){
                case 'enemy': 
                case 'wall':
                    if(element.distance < 18){
                        if(this.tweenForwardWalk){
                           this.tweenForwardWalk.stop();
                           this.character.userData.walkForwardFlag = false;
                        }
                    }
            }
        });
        direction.multiplyScalar(-1);
        this.raycaster.set(position, direction);
        scene.add(new THREE.ArrowHelper(this.raycaster.ray.direction, this.raycaster.ray.origin, 150, 0x0000ff) );
        intersects1 = this.raycaster.intersectObjects(scene.children);
        intersects2 = this.raycaster.intersectObjects(this.arrayOfSoldierMeshesToDetect);
        intersects = intersects1.concat(intersects2);
        intersects.forEach((element)=>{
            var object = element.object.name;
            switch(object){
                case 'enemy': 
                case 'wall':
                    if(element.distance < 18){
                        if(this.tweenBackwardWalk){
                           this.tweenBackwardWalk.stop();
                           this.character.userData.walkBackwardFlag = false;
                        }
                    }
            }
        });

    }

    checkIntersectionAmmmo(source, scene){
        source.position.z += 0.5;
        var ammoPosition = new THREE.Vector3();
        var ammoDirection = new THREE.Vector3();
        source.getWorldPosition(ammoPosition);
        source.getWorldDirection(ammoDirection);
        var raycasterAmmoCenter = new THREE.Raycaster(ammoPosition, ammoDirection);
        var intersects1 = raycasterAmmoCenter.intersectObjects(scene.children);
        var intersects2 = raycasterAmmoCenter.intersectObjects(this.arrayOfSoldierMeshesToDetect);
        var intersects = intersects1.concat(intersects2);

        intersects.forEach((element)=>{
            var object = element.object.name;
            switch(object){
                case 'enemy':
                    if(element.distance < 2.5){
                        console.log('hit');
                        this.character.remove(source);
                        this.character.userData.ammoAttackFlag = false;
                        var enemy = element.object.parent.parent;
                        enemy.userData.isDamagedFlag = true;
                    }
                    break;
                case 'wall':
                    if(element.distance < 2.5){
                        this.character.remove(source);
                        this.character.userData.ammoAttackFlag = false;
                    }
                case 'shield':
                    if(element.distance < 2.5){
                        this.character.remove(source);
                        this.character.userData.ammoAttackFlag = false;
                    }
            }
        });
    }

    update(moveForward, moveBackward, moveRight, moveLeft, attack, scene, bullets){

        var character = this.character;
        var model = this.model;

        if(moveForward && !character.userData.walkForwardFlag){
            if(this.tweenIdle){
                this.tweenIdle.stop();
            }
            this.walk();
        }

        else if(moveBackward && !character.userData.walkBackwardFlag){
            if(this.tweenIdle){
                this.tweenIdle.stop();
            }
            this.backwardWalk();
        }

        else if(character.userData.idleFlag){
            this.idle();
        }

        else if(attack && !character.userData.attackFlag){
            if(this.tweenIdle){
                this.tweenIdle.stop();
            }
            this.attackAnimation();
            this.setAmmo();
        }

        if(moveRight){
            model.rotation.y -= Math.PI/50;
        }

        else if(moveLeft){
            model.rotation.y += Math.PI/50;
        }
        
        this.checkIntersectionBody(model, scene);
        if(character.userData.ammoAttackFlag)
            this.checkIntersectionAmmmo(this.ammo, scene);
    }
}