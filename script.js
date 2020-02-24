function init() {
    //Display values for balls
	var sphereGeometry = new THREE.SphereGeometry(10, 20, 20);
	var sphereMaterial = new THREE.MeshLambertMaterial({color: 0x303090});
    var sphereMaterial2 = new THREE.MeshLambertMaterial({color: 0xFF5050})

    //Individual lines for both pendulums to rotate upon
	var lineMaterial = new THREE.LineBasicMaterial({color: 0x000000});
	var lineGeometry = new THREE.Geometry();
    var lineGeometry2 = new THREE.Geometry();
    
    //Add values to both lines
	lineGeometry.vertices.push(
		new THREE.Vector3(0,100,0),
		new THREE.Vector3()
	);
    
    lineGeometry2.vertices.push(
		new THREE.Vector3(0,100,0),
		new THREE.Vector3()
	);

    //Different classes for each pendulum -could probably be streamlined
	class Pendulum {
		ball = new THREE.Mesh(sphereGeometry, sphereMaterial);
		rope = new THREE.Line(lineGeometry, lineMaterial);
	}

    class Pendulum2 {
        ball = new THREE.Mesh(sphereGeometry, sphereMaterial2);
		rope = new THREE.Line(lineGeometry2, lineMaterial);
    }

    //Basic THREEJS set up
	var scene = new THREE.Scene();
    var renderer = new THREE.WebGLRenderer();
	renderer.setClearColor(new THREE.Color(0xffffff));
	renderer.setSize(window.innerWidth, window.innerHeight);

    //Initial camera setup
	var camera = new THREE.PerspectiveCamera(45, window.innerWidth/window.innerHeight, 0.1, 1000);

    //Editable camera controls
	var controls = new THREE.OrbitControls( camera, renderer.domElement );
    
	camera.position.x = 0;
	camera.position.y = 150;
	camera.position.z = 300;
	camera.lookAt(scene.position);
	controls.update();

    //Dynamic lighting <Yoinked from Sir Terry's code>
	renderer.shadowMap.type = THREE.PCFShadowMap;
	renderer.shadowMap.enabled = true;

	var light = new THREE.DirectionalLight( 0xffffff, 1, 100 );
	light.position.set( 0, 1, 0 ); 
	scene.add( light );

	var P1 = new Pendulum();
    var P2 = new Pendulum2();

	scene.add(P1.ball);
	scene.add(P1.rope);
    scene.add(P2.ball);
    scene.add(P2.rope);
 
	document.body.appendChild(renderer.domElement);
	renderScene();

    //Set initial position of ball 1 in P1
	P1.ball.position.copy(new THREE.Vector3());

    //Set initial position of ball2 in P2
    P2.ball.position.copy(new THREE.Vector3());

    //Physics values for ball 1
    var Mass = 100;
	var Magnitude = 100;
    var Acceleration= 0;
	var Velocity = 0;
	var currDir = 45;

    //Physics values for ball 2
    var Mass2 = 50;
	var Magnitude2 = 100;
    var Acceleration2 = 0;
	var Velocity2 = 0;
	var currDir2 = 45;
	
	function updateVelocity() {
		controls.update();

		lineGeometry.vertices[1] = P1.ball.position;
		lineGeometry.verticesNeedUpdate = true;
        
        lineGeometry2.vertices[0] = P1.ball.position;
        lineGeometry2.vertices[1] = P2.ball.position;
        lineGeometry2.verticesNeedsUpdate = true;

        //Compute for the position of the ball on an arc
		P1.ball.position.set(lineGeometry.vertices[0].x + Magnitude * Math.sin(currDir), lineGeometry.vertices[0].y + Magnitude * Math.cos(currDir), 0);
        
        P2.ball.position.set(lineGeometry2.vertices[0].x + Magnitude2 * Math.sin(currDir2), lineGeometry2.vertices[0].y + Magnitude2 * Math.cos(currDir2), 0);

        //Offset values to simulate friction
	 	Acceleration = 0.98/Mass * Math.sin(currDir);/*Facilitate any needed change in direction*/
		Velocity += Acceleration;/*Accelerate or decelearate as needed*/
		Velocity *= 0.99;/*Friction*/

	 	currDir += Velocity;/*Movement*/
        
        Acceleration2 = 0.98/Mass2 * Math.sin(currDir2);
        Velocity2 += Acceleration2;
        Velocity2 *= 0.99;
        
        currDir2 += Velocity2;
	}

	function renderScene() {
		requestAnimationFrame(renderScene);

		updateVelocity();

		renderer.render(scene,camera);
	}
}

window.onload = init;