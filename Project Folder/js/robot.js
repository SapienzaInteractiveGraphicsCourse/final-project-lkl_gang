export default class Robot {
    constructor(model) {
        this.model = model;
        this.model.rotation.y = 0;

        this.life = 100;

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

        var geometry = new THREE.SphereGeometry( 1, 32, 32 );
        var material = new THREE.MeshBasicMaterial( {color: 0x0000ff} );
        var sphere = new THREE.Mesh( geometry, material );
        this.ammo = sphere;

        //hitbox
        var cube = new THREE.BoxGeometry(2.8,4.2,2.5);
        var materialCube = new THREE.MeshLambertMaterial({wireframe: true});
        var hitbox = new THREE.Mesh(cube, materialCube);
        hitbox.position.y = 2.2;
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

    addDamage(){
        this.life -= 15;
    }

    //TODO: fix foreArm rotation
    walk(){
        var character = this.character;
        character.userData.walkForwardFlag = true;
        character.userData.idleFlag = false;

        var rightArm = this.model.getObjectByName('ShoulderR');
        var rightForeArm = this.model.getObjectByName('LowerArmR');

        var leftArm = this.model.getObjectByName('ShoulderL');
        var leftForeArm = this.model.getObjectByName('LowerArmL');

        var rightUpLeg = this.model.getObjectByName('UpperLegR');
        var rightLeg = this.model.getObjectByName('LowerLegR');

        var leftUpLeg = this.model.getObjectByName('UpperLegL');
        var leftLeg = this.model.getObjectByName('LowerLegL');

        var startPosRightUpLeg = Math.abs(this.rightUpLeg.rotation.x);
        var startPosRightLeg = Math.abs(this.rightLeg.rotation.x);
        var startPosRightArm = Math.abs(this.rightArm.rotation.x);
        var startPosRightForeArm = Math.abs(this.rightForeArm.rotation.x);
        var startPosModelx = character.position.x;
        var startPosModelz = character.position.z;

        var startPosLeftUpLeg = Math.abs(this.leftUpLeg.rotation.x);
        var startPosLeftLeg = Math.abs(this.leftLeg.rotation.x);
        var startPosLeftArm = Math.abs(this.leftArm.rotation.x);
        var startPosLeftForeArm = Math.abs(this.leftForeArm.rotation.x);

        var position = {
            rotRightUpLeg: startPosRightUpLeg,
            rotRightLeg: startPosRightLeg,
            rotRightArm: startPosRightArm,
            rotRightForeArm: startPosRightForeArm,

            rotLeftUpLeg: startPosLeftUpLeg,
            rotLeftLeg: startPosLeftLeg,
            rotLeftArm: startPosLeftArm,
            rotLeftForeArm: startPosLeftForeArm,

            posModelx: startPosModelx,
            posModelz: startPosModelz
        };

        var targetA = {
            rotRightUpLeg: 1.4*Math.PI/2,
            rotRightLeg: Math.PI/2,
            rotRightArm: (30/180) * Math.PI,
            rotRightForeArm: (10/180) * Math.PI,

            rotLeftUpLeg: 2.0*Math.PI/2,
            rotLeftLeg: 0.2*Math.PI/2,
            rotLeftArm: -(30/180) * Math.PI,
            rotLeftForeArm: -(10/180) * Math.PI,
            posModelx: startPosModelx + 0.4*Math.sin(character.rotation.y),
            posModelz: startPosModelz + 0.4*Math.cos(character.rotation.y)
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
            rotLeftArm: (30/180) * Math.PI,
            rotLeftForeArm: (10/180) * Math.PI,
            posModelx: startPosModelx + 0.8*Math.sin(character.rotation.y),
            posModelz: startPosModelz + 0.8*Math.cos(character.rotation.y)
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

        this.tweenForwardWalk = new TWEEN.Tween(position).to(targetA, 100);
        this.tweenForwardWalk.easing(TWEEN.Easing.Linear.None);
        this.tweenForwardWalk.onUpdate(function(){
            rightUpLeg.rotation.x = position.rotRightUpLeg;
            rightLeg.rotation.x = position.rotRightLeg;
            rightArm.rotation.x = position.rotRightArm;
            // rightForeArm.rotation.x = position.rotRightForeArm;

            leftUpLeg.rotation.x = position.rotLeftUpLeg;
            leftLeg.rotation.x = position.rotLeftLeg;
            leftArm.rotation.x= position.rotLeftArm;
            // leftForeArm.rotation.x = position.rotLeftForeArm;

            character.position.x = position.posModelx;
            character.position.z = position.posModelz;
        });

        var tweenBackA = new TWEEN.Tween(position).to(targetB, 100);
        tweenBackA.easing(TWEEN.Easing.Linear.None);
        tweenBackA.onUpdate(function(){
            rightUpLeg.rotation.x = position.rotRightUpLeg;
            rightLeg.rotation.x = position.rotRightLeg;
            rightArm.rotation.x = position.rotRightArm;
            // rightForeArm.rotation.x = position.rotRightForeArm;

            leftUpLeg.rotation.x = position.rotLeftUpLeg;
            leftLeg.rotation.x = position.rotLeftLeg;
            leftArm.rotation.x = position.rotLeftArm;
            // leftForeArm.rotation.x = position.rotLeftForeArm;
        });

        var tweenB = new TWEEN.Tween(position).to(targetC, 100);
        tweenB.easing(TWEEN.Easing.Linear.None);
        tweenB.onUpdate(function(){
            rightUpLeg.rotation.x = position.rotRightUpLeg;
            rightLeg.rotation.x = position.rotRightLeg;
            rightArm.rotation.x = position.rotRightArm;
            // rightForeArm.rotation.x = position.rotRightForeArm;

            leftUpLeg.rotation.x = position.rotLeftUpLeg;
            leftLeg.rotation.x = position.rotLeftLeg;
            leftArm.rotation.x = position.rotLeftArm;
            // leftForeArm.rotation.x = position.rotLeftForeArm;

            character.position.x = position.posModelx;
            character.position.z = position.posModelz;
        });

        var tweenBackB = new TWEEN.Tween(position).to(targetD, 100);
            tweenBackB.easing(TWEEN.Easing.Linear.None);
            tweenBackB.onUpdate(function(){
                rightUpLeg.rotation.x = position.rotRightUpLeg;
                rightLeg.rotation.x = position.rotRightLeg;
                rightArm.rotation.x = position.rotRightArm;
                // rightForeArm.rotation.x = position.rotRightForeArm;

                leftUpLeg.rotation.x = position.rotLeftUpLeg;
                leftLeg.rotation.x = position.rotLeftLeg;
                leftArm.rotation.x = position.rotLeftArm;
                // leftForeArm.rotation.x = position.rotLeftForeArm;
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

    //TODO: fix leg/arm rotation
    backwardWalk(){
        var character = this.character;
        character.userData.walkBackwardFlag = true;
        character.userData.idleFlag = false;

        var rightArm = this.model.getObjectByName('ShoulderR');
        var rightForeArm = this.model.getObjectByName('LowerArmR');

        var leftArm = this.model.getObjectByName('ShoulderL');
        var leftForeArm = this.model.getObjectByName('LowerArmL');

        var rightUpLeg = this.model.getObjectByName('UpperLegR');
        var rightLeg = this.model.getObjectByName('LowerLegR');

        var leftUpLeg = this.model.getObjectByName('UpperLegL');
        var leftLeg = this.model.getObjectByName('LowerLegL');

        var startPosRightUpLeg = Math.abs(this.rightUpLeg.rotation.x);
        var startPosRightLeg = Math.abs(this.rightLeg.rotation.x);
        var startPosRightArm = Math.abs(this.rightArm.rotation.x);
        var startPosRightForeArm = Math.abs(this.rightForeArm.rotation.x);
        var startPosModelx = character.position.x;
        var startPosModelz = character.position.z;

        var startPosLeftUpLeg = Math.abs(this.leftUpLeg.rotation.x);
        var startPosLeftLeg = Math.abs(this.leftLeg.rotation.x);
        var startPosLeftArm = Math.abs(this.leftArm.rotation.x);
        var startPosLeftForeArm = Math.abs(this.leftForeArm.rotation.x);

        var position = {
            rotRightUpLeg: startPosRightUpLeg,
            rotRightLeg: startPosRightLeg,
            rotRightArm: startPosRightArm,
            rotRightForeArm: startPosRightForeArm,

            rotLeftUpLeg: startPosLeftUpLeg,
            rotLeftLeg: startPosLeftLeg,
            rotLeftArm: startPosLeftArm,
            rotLeftForeArm: startPosLeftForeArm,

            posModelx: startPosModelx,
            posModelz: startPosModelz
        };

        var targetA = {
            rotRightUpLeg: 1.4*Math.PI/2,
            rotRightLeg: Math.PI/2,
            rotRightArm: (30/180) * Math.PI,
            rotRightForeArm: (10/180) * Math.PI,

            rotLeftUpLeg: 2.0*Math.PI/2,
            rotLeftLeg: 0.2*Math.PI/2,
            rotLeftArm: -(30/180) * Math.PI,
            rotLeftForeArm: -(10/180) * Math.PI,
            posModelx: startPosModelx - 0.4*Math.sin(character.rotation.y),
            posModelz: startPosModelz - 0.4*Math.cos(character.rotation.y)
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
            rotLeftArm: (30/180) * Math.PI,
            rotLeftForeArm: (10/180) * Math.PI,
            posModelx: startPosModelx - 0.8*Math.sin(character.rotation.y),
            posModelz: startPosModelz - 0.8*Math.cos(character.rotation.y)
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

        this.tweenBackwardWalk = new TWEEN.Tween(position).to(targetA, 100);
        this.tweenBackwardWalk.easing(TWEEN.Easing.Linear.None);
        this.tweenBackwardWalk.onUpdate(function(){
            rightUpLeg.rotation.x = position.rotRightUpLeg;
            rightLeg.rotation.x = position.rotRightLeg;
            rightArm.rotation.x = position.rotRightArm;
            // rightForeArm.rotation.x = position.rotRightForeArm;

            leftUpLeg.rotation.x = position.rotLeftUpLeg;
            leftLeg.rotation.x = position.rotLeftLeg;
            leftArm.rotation.x= position.rotLeftArm;
            // leftForeArm.rotation.x = position.rotLeftForeArm;

            character.position.x = position.posModelx;
            character.position.z = position.posModelz;
        });

        var tweenBackA = new TWEEN.Tween(position).to(targetB, 100);
        tweenBackA.easing(TWEEN.Easing.Linear.None);
        tweenBackA.onUpdate(function(){
            rightUpLeg.rotation.x = position.rotRightUpLeg;
            rightLeg.rotation.x = position.rotRightLeg;
            rightArm.rotation.x = position.rotRightArm;
            // rightForeArm.rotation.x = position.rotRightForeArm;

            leftUpLeg.rotation.x = position.rotLeftUpLeg;
            leftLeg.rotation.x = position.rotLeftLeg;
            leftArm.rotation.x = position.rotLeftArm;
            // leftForeArm.rotation.x = position.rotLeftForeArm;
        });

        var tweenB = new TWEEN.Tween(position).to(targetC, 100);
        tweenB.easing(TWEEN.Easing.Linear.None);
        tweenB.onUpdate(function(){
            rightUpLeg.rotation.x = position.rotRightUpLeg;
            rightLeg.rotation.x = position.rotRightLeg;
            rightArm.rotation.x = position.rotRightArm;
            // rightForeArm.rotation.x = position.rotRightForeArm;

            leftUpLeg.rotation.x = position.rotLeftUpLeg;
            leftLeg.rotation.x = position.rotLeftLeg;
            leftArm.rotation.x = position.rotLeftArm;
            // leftForeArm.rotation.x = position.rotLeftForeArm;

            character.position.x = position.posModelx;
            character.position.z = position.posModelz;
        });

        var tweenBackB = new TWEEN.Tween(position).to(targetD, 100);
        tweenBackB.easing(TWEEN.Easing.Linear.None);
        tweenBackB.onUpdate(function(){
            rightUpLeg.rotation.x = position.rotRightUpLeg;
            rightLeg.rotation.x = position.rotRightLeg;
            rightArm.rotation.x = position.rotRightArm;
            // rightForeArm.rotation.x = position.rotRightForeArm;

            leftUpLeg.rotation.x = position.rotLeftUpLeg;
            leftLeg.rotation.x = position.rotLeftLeg;
            leftArm.rotation.x = position.rotLeftArm;
            // leftForeArm.rotation.x = position.rotLeftForeArm;
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

    //TODO: fix idle animation
    idle(){
        var character = this.character;

        character.userData.idleFlag = false;

        var rightArm = this.model.getObjectByName('ShoulderR');
        var rightForeArm = this.model.getObjectByName('LowerArmR');

        var leftArm = this.model.getObjectByName('ShoulderL');
        var leftForeArm = this.model.getObjectByName('LowerArmL');

        var startPosRightArm = Math.abs(this.rightArm.rotation.x);
        var startPosRightForeArm = Math.abs(this.rightForeArm.rotation.x);

        var startPosLeftArm = Math.abs(this.leftArm.rotation.x);
        var startPosLeftForeArm = Math.abs(this.leftForeArm.rotation.x);

        var position = {
            rotRightArm: startPosRightArm,
            rotRightForeArm: startPosRightForeArm,

            rotLeftArm: startPosLeftArm,
            rotLeftForeArm: startPosLeftForeArm
        };

        var targetA = {
            rotRightArm: (30/180) * Math.PI,
            rotRightForeArm: (10/180) * Math.PI,

            rotLeftArm: -(30/180) * Math.PI,
            rotLeftForeArm: -(10/180) * Math.PI
        };
        var targetB = {
            rotRightArm: startPosRightArm,
            rotRightForeArm: startPosRightForeArm,

            rotLeftArm: startPosLeftArm,
            rotLeftForeArm: startPosLeftForeArm
        };
        var targetC = {
            rotRightArm: -(30/180) * Math.PI,
            rotRightForeArm: -(10/180) * Math.PI,

            rotLeftArm: (30/180) * Math.PI,
            rotLeftForeArm: (10/180) * Math.PI
        };
        var targetD = {
            rotRightArm: startPosRightArm,
            rotRightForeArm: startPosRightForeArm,

            rotLeftArm: startPosLeftArm,
            rotLeftForeArm: startPosLeftForeArm
        };

        this.tweenIdle = new TWEEN.Tween(position).to(targetA, 100);
        this.tweenIdle.easing(TWEEN.Easing.Linear.None);
        this.tweenIdle.onUpdate(function(){
            rightArm.rotation.x = position.rotRightArm;
            // rightForeArm.rotation.x = position.rotRightForeArm;

            leftArm.rotation.x= position.rotLeftArm;
            // leftForeArm.rotation.x = position.rotLeftForeArm;
        });

        var tweenBackA = new TWEEN.Tween(position).to(targetB, 100);
        tweenBackA.easing(TWEEN.Easing.Linear.None);
        tweenBackA.onUpdate(function(){
            rightArm.rotation.x = position.rotRightArm;
            // rightForeArm.rotation.x = position.rotRightForeArm;

            leftArm.rotation.x= position.rotLeftArm;
            // leftForeArm.rotation.x = position.rotLeftForeArm;
        });

        var tweenB = new TWEEN.Tween(position).to(targetC, 100);
        tweenB.easing(TWEEN.Easing.Linear.None);
        tweenB.onUpdate(function(){
            rightArm.rotation.x = position.rotRightArm;
            // rightForeArm.rotation.x = position.rotRightForeArm;

            leftArm.rotation.x = position.rotLeftArm;
            // leftForeArm.rotation.x = position.rotLeftForeArm;
        });

        var tweenBackB = new TWEEN.Tween(position).to(targetD, 100);
        tweenBackB.easing(TWEEN.Easing.Linear.None);
        tweenBackB.onUpdate(function(){
            rightArm.rotation.x = position.rotRightArm;
            // rightForeArm.rotation.x = position.rotRightForeArm;

            leftArm.rotation.x= position.rotLeftArm;
            // leftForeArm.rotation.x = position.rotLeftForeArm;
        });

        this.tweenIdle.chain(tweenBackA);
        tweenBackA.chain(tweenB);
        tweenB.chain(tweenBackB);
        tweenBackB.chain(this.tweenIdle);

        this.tweenIdle.start();
    }

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
        // var startPosAmmo = ammo.position.z;

        var position = {
            rotRightArm: startPosRightArm,
            rotRightForeArm: startPosRightForeArm,
            // posAmmo : startPosAmmo
        };

        var targetA = {
            rotRightArm: -(75/180) * Math.PI,
            rotRightForeArm: 0,
            // posAmmo : startPosAmmo + 3
        };

        var targetB = {
            rotRightArm: startPosRightArm,
            rotRightForeArm: startPosRightForeArm,
            // posAmmo : startPosAmmo
        };

        this.tweenAttack = new TWEEN.Tween(position).to(targetA, 500);
        this.tweenAttack.easing(TWEEN.Easing.Linear.None);
        this.tweenAttack.onUpdate(function(){
            rightArm.rotation.x = position.rotRightArm;
            rightForeArm.rotation.x = position.rotRightForeArm;
            // ammo.position.z = position.posAmmo;
        });
        // this.tweenAttack.onComplete(function(){
        //     ammo.visible = false;
        // })

        var tweenBackA = new TWEEN.Tween(position).to(targetB, 500);
        tweenBackA.easing(TWEEN.Easing.Linear.None);
        tweenBackA.onUpdate(function(){
            rightArm.rotation.x = position.rotRightArm;
            rightForeArm.rotation.x = position.rotRightForeArm;
            // ammo.position.z = position.posAmmo;
        });
        tweenBackA.onComplete(() =>{
            character.userData.attackFlag = false;
            character.userData.idleFlag = true;
        });

        this.tweenAttack.chain(tweenBackA);
        this.tweenAttack.start();
    }

    //TODO: powerup objects interaction
    checkIntersectionBody(source, scene){
        var direction = new THREE.Vector3();
        source.getWorldDirection(direction);
        this.raycaster.set(source.position, direction);
        var intersects = this.raycaster.intersectObjects(scene.children);
        intersects.forEach((element)=>{
            var object = element.object.name;
            switch(object){
                case 'wall':
                    if(element.distance < 1.5){
                        if(this.tweenForwardWalk){
                           this.tweenForwardWalk.stop();
                           this.character.userData.walkForwardFlag = false;
                        }
                    }
            }
        });
        direction.z = -direction.z;
        this.raycaster.set(source.position, direction);
        intersects = this.raycaster.intersectObjects(scene.children);
        intersects.forEach((element)=>{
            var object = element.object.name;
            switch(object){
                case 'wall':
                    if(element.distance < 1){
                        if(this.tweenBackwardWalk){
                           this.tweenBackwardWalk.stop();
                           this.character.userData.walkBackwardFlag = false;
                        }
                    }
            }
        });

    }

    //TODO: damage to enemy
    checkIntersectionAmmmo(source, scene){
        source.position.z += 0.8;
        var ammoPosition = new THREE.Vector3();
        var ammoDirection = new THREE.Vector3();
        source.getWorldPosition(ammoPosition);
        source.getWorldDirection(ammoDirection);
        var raycasterAmmo = new THREE.Raycaster(ammoPosition, ammoDirection);
        var intersects = raycasterAmmo.intersectObjects(scene.children);
        intersects.forEach((element)=>{
            var object = element.object.name;
            switch(object){
                case 'enemy':
                    if(element.distance < 0.5){
                        console.log('hit');
                        this.character.remove(source);
                        this.character.userData.ammoAttackFlag = false;
                    }
                    break;
                case 'wall':
                    if(element.distance < 0.5){
                        this.character.remove(source);
                        this.character.userData.ammoAttackFlag = false;
                    }
            }
        });
    }

    update(moveForward, moveBackward, moveRight, moveLeft, attack, scene){

        var character = this.character;

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
            character.rotation.y -= Math.PI/50;
        }

        else if(moveLeft){
            character.rotation.y += Math.PI/50;
        }
        
        this.checkIntersectionBody(character, scene);
        if(character.userData.ammoAttackFlag)
            this.checkIntersectionAmmmo(this.ammo, scene);
    }
}