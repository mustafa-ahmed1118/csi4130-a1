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

// Initialization of Three.js
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

    // Define the tetrahedron group and their respective rotation group
    var tetRotGroup = new THREE.Group();
    scene.add(tetRotGroup);
    var tetGroup = new THREE.Group();

    // Function to generate per-vertex shades of a base color simulting a gem-like reflection
    function generateShadedColors(baseColor, vertexCount) {
        let colors = [];
        for (let i = 0; i < vertexCount; i++) {
            let shadeFactor = 0.7 + Math.random() * 0.3; // Random shade between 70% and 100%
            colors.push(baseColor[0] * shadeFactor, baseColor[1] * shadeFactor, baseColor[2] * shadeFactor);
        }
        return new Float32Array(colors);
    }

    // Universal tetrahedron shape with per-vertex colors
    function createTetrahedron(position, baseColor) {
        let tetGeometry = new THREE.CircleGeometry(8, 8).toNonIndexed(); // Ensure it's non-indexed
        let vertexCount = tetGeometry.attributes.position.count;

        // Apply per-vertex colors
        tetGeometry.setAttribute('color', new THREE.BufferAttribute(generateShadedColors(baseColor, vertexCount), 3));

        // Define the material with per-vertex color enabled
        let vertexColorMaterial = new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.DoubleSide });

        let tetrahedron = new THREE.Mesh(tetGeometry, vertexColorMaterial);
        tetrahedron.position.set(...position);
        return tetrahedron;
    }

    // Define the tetrahedrons with gem-like shading
    let redTet = createTetrahedron([-8, 8, 0], [1.0, 0.0, 0.0]);    // Red shades
    let greenTet = createTetrahedron([8, 8, 0], [0.0, 1.0, 0.0]);   // Green shades
    let yellowTet = createTetrahedron([0, -7, 0], [1.0, 1.0, 0.0]); // Yellow shades

    // Add tetrahedrons to the group
    tetGroup.add(redTet, greenTet, yellowTet);

    tetRotGroup.add(tetGroup);
    scene.add(tetRotGroup);



 
	//Calcaulate aspectRatio
	var aspectRatio = window.innerWidth / window.innerHeight;
	var width = 40;
    var height = width / aspectRatio;


	//Setup orthographic camera
    const camera = new THREE.OrthographicCamera(
        -width,   // left
         width,   // right
        height,   // top
       -height,   // bottom
         1,       // near
        1000      // far
    );
    
	//Position the camera back and point to the center of the scene
	camera.position.set(0,0, 100); // Move it back
    camera.lookAt(new THREE.Vector3(0, 0, 0)); // Look at the scene center

	// Render the scene
	renderer.render(scene, camera);

    // Setup the control GUI
    var controls = new (function () {
        this.groupSpeed = 3; // Speed for the whole group
        this.redSpeed = 3;    // Speed for the red tetrahedron
        this.greenSpeed = 3;  // Speed for the green tetrahedron
        this.yellowSpeed = 3; // Speed for the yellow tetrahedron
    })();

    // Create the GUI for controlling speeds
    var gui = new GUI();
    gui.add(controls, "groupSpeed", -10, 10).name("Group Spin");
    gui.add(controls, "redSpeed", -10, 10).name("Red Speed");
    gui.add(controls, "greenSpeed", -10, 10).name("Green Speed");
    gui.add(controls, "yellowSpeed", -10, 10).name("Yellow Speed");

    // Render function with updated rotation logic
    function render() {
        requestAnimationFrame(render);

        var groupSpeed = controls.groupSpeed * Math.PI / 180;
        var redSpeed = controls.redSpeed * Math.PI / 180;
        var greenSpeed = controls.greenSpeed * Math.PI / 180;
        var yellowSpeed = controls.yellowSpeed * Math.PI / 180;

        var axis = new THREE.Vector3(0, 0, 1); // Rotation around the Z-axis

        // Rotate the whole tetrahedron group
        tetRotGroup.rotateOnAxis(axis, -0.3 * groupSpeed);

        // Rotate individual tetrahedrons
        redTet.rotation.z += redSpeed;
        greenTet.rotation.z += greenSpeed;
        yellowTet.rotation.z += yellowSpeed;

        // Render the scene
        renderer.render(scene, camera);
    }
    render();
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