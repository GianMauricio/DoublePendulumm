const g = 9.8;
const FPS = 10;
const deltaTime = 1 / FPS;


function init() {
	//Basic THREEJS set up
	var scene = new THREE.Scene();
	var renderer = new THREE.WebGLRenderer();
	renderer.setClearColor(new THREE.Color(0xffffff));
	renderer.setSize(window.innerWidth, window.innerHeight);

	//Display values for balls
	var sphereGeometry = new THREE.SphereGeometry(10, 20, 20);
	var sphereMaterial = new THREE.MeshLambertMaterial({color: 0x303090});
	var sphereMaterial2 = new THREE.MeshLambertMaterial({color: 0xFF5050})

	//Individual lines for both pendulums to rotate upon
	var lineMaterial = new THREE.LineBasicMaterial({color: 0x000000});
	var lineGeometry = new THREE.Geometry();

	//Add values to both lines
	lineGeometry.vertices.push(
		new THREE.Vector3(0,0,0),
		new THREE.Vector3(0,100,0),
		new THREE.Vector3(0,200,0),
	);

	// Initialize spheres
	let line_material = new THREE.LineBasicMaterial({
		color: 0x00aaff
	});
	let geometry_pseudo_real = new THREE.Geometry();
	var line_pseudo_real = new THREE.Line(geometry_pseudo_real, line_material);
	var spheres_pseudo_real = [];
	var init_sphere_pseudo_real = function(mass, theta, length) {
		let geometry = new THREE.SphereBufferGeometry(mass/3, 32, 32);
		let material = new THREE.MeshPhongMaterial({
			color: 0xa6ea15
		});

		let sphere = new THREE.Mesh(geometry, material);
		sphere.length = length;
		sphere.theta = theta;
		sphere.theta_v = 0;
		sphere.mass = mass;

		// Create its rope
		if(spheres_pseudo_real.length > 0) {
			// Position is in reference to previous ball
			sphere.position.copy(spheres_pseudo_real[spheres_pseudo_real.length-1].position);
			sphere.position.x += sphere.length * Math.sin(sphere.theta);
			sphere.position.y += -sphere.length * Math.cos(sphere.theta);
		}
		line_pseudo_real.geometry.vertices.push(sphere.position);

		// Push to containers
		spheres_pseudo_real.push(sphere);
		scene.add(sphere);
	}

	//Different classes for each pendulum -could probably be streamlined
	class Pendulum {
		ball = new THREE.Mesh(sphereGeometry, sphereMaterial);
		rope = new THREE.Line(lineGeometry, lineMaterial);
	}

	class Pendulum2 {
		ball = new THREE.Mesh(sphereGeometry, sphereMaterial2);
		rope = new THREE.Line(lineGeometry, lineMaterial);
	}

	//Initial camera setup
	var camera = new THREE.PerspectiveCamera(65, window.innerWidth/window.innerHeight, 0.1, 1000);

	//Editable camera controls
	var controls = new THREE.OrbitControls( camera, renderer.domElement );
	
	camera.position.x = 0;
	camera.position.y = 150;
	camera.position.z = 500;
	camera.lookAt(scene.position);
	controls.update();

	//Dynamic lighting <Yoinked from Sir Terry's code>
	renderer.shadowMap.type = THREE.PCFShadowMap;
	renderer.shadowMap.enabled = true;

	var light = new THREE.DirectionalLight( 0xffffff, 1, 100 );
	light.position.set( 0, 1, 0 ); 
	scene.add( light );

	// Initialize scene objects
	init_sphere_pseudo_real(1, 0, 0);
	init_sphere_pseudo_real(20, Math.PI/2, 100);
	init_sphere_pseudo_real(20, Math.PI/4, 100);

	var P1 = new Pendulum();
	var P2 = new Pendulum2();
	
	scene.add(line_pseudo_real);
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

		lineGeometry.verticesNeedUpdate = true;
		lineGeometry.vertices[1] = P1.ball.position;
		lineGeometry.vertices[2] = P2.ball.position;

		//Compute for the position of the ball on an arc
		P1.ball.position.set(lineGeometry.vertices[0].x + Magnitude * Math.sin(currDir), lineGeometry.vertices[0].y + Magnitude * Math.cos(currDir), 0);
		P2.ball.position.set(lineGeometry.vertices[1].x + Magnitude2 * Math.sin(currDir2), lineGeometry.vertices[1].y + Magnitude2 * Math.cos(currDir2), 0);

		//Offset values to simulate friction
	 	Acceleration = 0.98/Mass * Math.sin(currDir);/*Facilitate any needed change in direction*/
		Velocity += Acceleration;/*Accelerate or decelearate as needed*/
		Velocity *= 0.99;/*Friction*/

	 	currDir += Velocity;/*Movement*/
		
		Acceleration2 = 0.98/Mass2 * Math.sin(currDir2);
		Velocity2 += Acceleration2;
		Velocity2 *= 0.99;
		
		currDir2 += Velocity2;


		// Update for the pseudo realistic balls
		// Calculate acceleration
		let num1 = -g * (2 * spheres_pseudo_real[1].mass + spheres_pseudo_real[2].mass) * Math.sin(spheres_pseudo_real[1].theta);
		let num2 = -spheres_pseudo_real[2].mass * g * Math.sin(spheres_pseudo_real[1].theta - (2 * spheres_pseudo_real[2].theta));
		let num3 = -2 * Math.sin(spheres_pseudo_real[1].theta - spheres_pseudo_real[2].theta) * spheres_pseudo_real[2].mass;
		let num4 = spheres_pseudo_real[2].theta_v * spheres_pseudo_real[2].theta_v * spheres_pseudo_real[2].length + spheres_pseudo_real[1].theta_v * spheres_pseudo_real[1].theta_v * spheres_pseudo_real[1].length * Math.cos(spheres_pseudo_real[1].theta - spheres_pseudo_real[2].theta);
		let den = spheres_pseudo_real[1].length * ((2 * spheres_pseudo_real[1].mass) + spheres_pseudo_real[2].mass - spheres_pseudo_real[2].mass * Math.cos(2 * spheres_pseudo_real[1].theta - 2 * spheres_pseudo_real[2].theta));
		let theta1_a = (num1 + num2 + (num3 * num4)) / den;

		num1 = 2 * Math.sin(spheres_pseudo_real[1].theta - spheres_pseudo_real[2].theta);
		num2 = spheres_pseudo_real[1].theta_v * spheres_pseudo_real[1].theta_v * spheres_pseudo_real[1].length * (spheres_pseudo_real[1].mass + spheres_pseudo_real[2].mass);
		num3 = g * (spheres_pseudo_real[1].mass + spheres_pseudo_real[2].mass) * Math.cos(spheres_pseudo_real[1].theta);
		num4 = spheres_pseudo_real[2].theta_v * spheres_pseudo_real[2].theta_v * spheres_pseudo_real[2].length * spheres_pseudo_real[2].mass * Math.cos(spheres_pseudo_real[1].theta - spheres_pseudo_real[2].theta);
		den = spheres_pseudo_real[2].length * ((2 * spheres_pseudo_real[1].mass) + spheres_pseudo_real[2].mass - spheres_pseudo_real[2].mass * Math.cos(2 * spheres_pseudo_real[1].theta - 2 * spheres_pseudo_real[2].theta));
		let theta2_a = (num1 * (num2 + num3 + num4)) / den;

		// Acceleration -> Velocity
		spheres_pseudo_real[1].theta_v += theta1_a * deltaTime;
		spheres_pseudo_real[2].theta_v += theta2_a * deltaTime;

		// Damping
		let damping_coeff = 0.1
		spheres_pseudo_real[1].theta_v *= 1-(damping_coeff * deltaTime);
		spheres_pseudo_real[2].theta_v *= 1-(damping_coeff * deltaTime);

		// Velocity -> Theta
		spheres_pseudo_real[1].theta += spheres_pseudo_real[1].theta_v * deltaTime * 3;
		spheres_pseudo_real[2].theta += spheres_pseudo_real[2].theta_v * deltaTime * 3;

		// Theta -> position
		spheres_pseudo_real[1].position.copy(spheres_pseudo_real[0].position); // Reference point is origin
		spheres_pseudo_real[1].position.x += spheres_pseudo_real[1].length * Math.sin(spheres_pseudo_real[1].theta);
		spheres_pseudo_real[1].position.y += -spheres_pseudo_real[1].length * Math.cos(spheres_pseudo_real[1].theta);

		spheres_pseudo_real[2].position.copy(spheres_pseudo_real[1].position); // Reference point is first ball
		spheres_pseudo_real[2].position.x += spheres_pseudo_real[2].length * Math.sin(spheres_pseudo_real[2].theta);
		spheres_pseudo_real[2].position.y += -spheres_pseudo_real[2].length * Math.cos(spheres_pseudo_real[2].theta);

		// Update lines as well
		line_pseudo_real.geometry.verticesNeedUpdate = true;
		line_pseudo_real.geometry.vertices[0].copy(spheres_pseudo_real[0].position);
		line_pseudo_real.geometry.vertices[1].copy(spheres_pseudo_real[1].position);
		line_pseudo_real.geometry.vertices[2].copy(spheres_pseudo_real[2].position);
	}

    var GUIControls = new function(){
        this.Mass1 = 100;
	    this.Magnitude1 = 100;
        this.Swing1 = true;
        
        this.Mass2 = 100;
	    this.Magnitude2 = 100;
        this.Swing2 = true;
    }
    
    var GUI = new dat.GUI();
    var Folder1 = GUI.addFolder("Pendulum1");
    var Folder2 = GUI.addFolder("Pendulum2");

    Folder1.add(GUIControls, "Mass1", 1, 200);
    Folder1.add(GUIControls, "Magnitude1", 1, 200);
    Folder1.add(GUIControls, "Swing1", true, false);

    Folder2.add(GUIControls, "Mass2", 1, 200);
    Folder2.add(GUIControls, "Magnitude2", 1, 200);
    Folder2.add(GUIControls, "Swing2", true, false);

	function renderScene() {
		requestAnimationFrame(renderScene);

		updateVelocity();

		renderer.render(scene,camera);
	}
}

window.onload = init;