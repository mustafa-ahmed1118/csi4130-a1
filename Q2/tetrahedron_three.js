/*
    Feb 3, 2025
    Mustafa Ahmed
    300242013
    CSI4130 Assignment 1 Question 2

    - This code takes heavy inspiration from Lab 2 of CSI4130
    - It outputs three spinning octahedrons instead of a solar system
    - Attention: ChatGPT was used a bit while debugging the controls for the gui.
 */

import * as THREE from "three";
import { GUI } from "dat.gui";

// initialization of Three.js
function init() {

    //WebGL Setup
	var container = document.createElement("div");
	document.body.appendChild(container);
	const renderer = new THREE.WebGLRenderer();
	renderer.setClearColor(new THREE.Color(0x000000));
	renderer.setSize(window.innerWidth, window.innerHeight);
	container.appendChild(renderer.domElement);

	// Begin scene graph setup 
	var scene = new THREE.Scene();
    
    //define the tetrahedron group and their respective rotation group
    var tetRotGroup = new THREE.Group();
    scene.add(tetRotGroup);
    var tetGroup = new THREE.Group();

    
    //define the three tetrahedrons
    var tetGeomoetry = new THREE.CircleGeometry(8,8);//universal tetrahedron shape

    //define the red tetrahedron
    var redMaterial = new THREE.MeshBasicMaterial({ color: "red" });
    var redTet = new THREE.Mesh(tetGeomoetry, redMaterial);
    redTet.position.set(-8,8,0)
    tetGroup.add(redTet);
    
    //define green tetrahedron
    var greenMaterial = new THREE.MeshBasicMaterial({ color: "green" });
    var greenTet = new THREE.Mesh(tetGeomoetry, greenMaterial);
    greenTet.position.set(8,8,0)
    tetGroup.add(greenTet);

    var yellowMaterial = new THREE.MeshBasicMaterial({ color: "yellow" });
    var yellowTet = new THREE.Mesh(tetGeomoetry, yellowMaterial);
    yellowTet.position.set(0,-7,0)
    tetGroup.add(yellowTet);

    tetRotGroup.add(tetGroup);
    scene.add(tetRotGroup);
 
	// calcaulate aspectRatio
	var aspectRatio = window.innerWidth / window.innerHeight;
	var width = 40;
    var height = width / aspectRatio;


	//setup orthographic camera
    const camera = new THREE.OrthographicCamera(
        -width,   // left
         width,   // right
        height,   // top
       -height,   // bottom
         1,       // near
        1000      // far
    );
    
	// position the camera back and point to the center of the scene
	camera.position.set(0,0, 100); // Move it back
    camera.lookAt(new THREE.Vector3(0, 0, 0)); // Look at the scene center

	// render the scene
	renderer.render(scene, camera);

    // setup the control gui
    var controls = new (function () {
        this.speed = 3; // Start with a lower speed
        this.reverseSpeed = function () {
            this.speed *= -1; // Reverse the speed (multiply by -1)
        };
        this.redraw = function () {}; // Function to trigger redrawing
    })();

    // Create the GUI for controlling speed and reversing direction
    var gui = new GUI();
    gui.add(controls, "speed", -10, 10); // Speed range from -1 to 1 for controlled rotation
    gui.add(controls, "reverseSpeed").name("Reverse Speed").onChange(controls.redraw); // Reverse speed button

    // Call the render function
    render();
    function render() {
        // render using requestAnimationFrame - register function
        requestAnimationFrame(render);

        var speed = controls.speed; // Get the speed value from the GUI
        var axis = new THREE.Vector3(0, 0, 1); // Rotation around the Z-axis

        // Rotate the whole tetrahedron group around the Z-axis
        tetRotGroup.rotateOnAxis(axis, -0.3 * speed * Math.PI / 180); // Smaller rotation per frame

        // Rotate each individual tetrahedron around their Z-axis with controlled speed
        redTet.rotation.z = (redTet.rotation.z + 1 * speed * Math.PI / 180); // Slower rotation speed
        greenTet.rotation.z = (greenTet.rotation.z + 1 * speed * Math.PI / 180);
        yellowTet.rotation.z = (yellowTet.rotation.z + 1 * speed * Math.PI / 180);

        // Render the scene with the camera
        renderer.render(scene, camera);
    }
}


function onResize() {
	var aspectRatio = window.innerWidth / window.innerHeight;
    var width = 20;
    var height = width / aspectRatio;

    // Update orthographic camera parameters
    camera.left = -width;
    camera.right = width;
    camera.top = height;
    camera.bottom = -height;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
}

window.onload = init;

// register our resize event function
window.addEventListener("resize", onResize, true);