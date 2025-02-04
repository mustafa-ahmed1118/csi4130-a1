/*
    Feb 3, 2025
    Mustafa Ahmed
    300242013
    CSI4130 Assignment 1 Question 1

    - This code takes heavy inspiration from Lab 1 of CSI4130
    - It outputs three spinning octahedrons by leveraging the tetrahedrons previously made
    - Attention: ChatGPT was used a bit while debugging the shader retrieval.
 */


// Vertex shader program
var VSHADER_SOURCE = null;
// Fragment shader program
var FSHADER_SOURCE = null;

// Rotation speed (degrees/second)
var SPEED;

// Initialize time of last rotation update
var LAST_FRAME = Date.now();


var Z_AXIS_ANGLE = 0.0; // Add a global variable to control Z-axis rotation

function main() {
  var canvas = document.getElementById('webgl');
  var gl = getWebGLContext(canvas);
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

  setDefault();

  //define the VAO
  let VAOs = [gl.createVertexArray(), gl.createVertexArray(), gl.createVertexArray()];
  //vertices defined in Geometry.js

  //run the shaders
  readShaderFile(gl, VAOs, vertices, 'shaders/tetrahedron.vs', 'v');
  readShaderFile(gl, VAOs, vertices, 'shaders/tetrahedron.fs', 'f');
}

// Read shader from file
function readShaderFile(gl, VAOs, vertices, fileName, shader) {
  var request = new XMLHttpRequest();
  request.open('GET', fileName, true);

  request.onreadystatechange = function () {
    if (request.readyState == 4 && request.status !== 404) {
      onReadShader(gl, VAOs, vertices, request.responseText, shader);
    }
  };
  request.send(); // Send the request
}

// The shader is loaded from file
function onReadShader(gl, VAOs, vertices, fileString, shader) {
  if (shader == 'v') { // Vertex shader
    VSHADER_SOURCE = fileString;
  } else if (shader == 'f') { // Fragment shader
    FSHADER_SOURCE = fileString;
  }

  // When both are available, call start().
  if (VSHADER_SOURCE && FSHADER_SOURCE) start(gl, VAOs, vertices);
}

function start(gl, VAOs, vertices) {
  //foundational logic here
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to initialize shaders.');
    return;
  }

  // Initialize all vertex buffers for VAOs
  for (let i = 0; i < VAOs.length; i++) {
    n = initVertexBuffers(gl, VAOs[i], vertices[i]);
    if (n < 0) {
      console.log('Failed to set the positions of the vertices');
      return;
    }
  }

  //depth testing for correct visual output
  gl.enable(gl.DEPTH_TEST);
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  //apply uniforms
  var u_mvp_matrix = gl.getUniformLocation(gl.program, 'mvp_matrix');
  if (!u_mvp_matrix) {
    console.log('Failed to get the storage location of mvp_matrix');
    return;
  }

  //configure orthographic camera 
  var projMatrix = glMatrix.mat4.create();
  glMatrix.mat4.ortho(projMatrix, -3.0, 3.0, -3.0, 3.0, -3.0, 3.0);

  var axisAngle = 0.0;
  var currentAngle = 0.0;

  document.onkeydown = function (ev) {
    keydown(ev, gl, n, currentAngle, projMatrix, u_mvp_matrix);
  };

  //translations to be done
  var translations = [
    [0.75, 0.0, 0.0],
    [-0.75, 0.0, 0.0],
    [0.0, 0.75, 0.0],
  ];

var individualRotations = [0.0, 0.0, 0.0]; // Array to hold the individual rotations for each object

var tick = function () {
  var now = Date.now();
  var elapsed = now - LAST_FRAME;

  // Update the global rotation for the group
  Z_AXIS_ANGLE += 0.1; // Increment the global rotation angle for group orbit

  // Update individual rotation angles for each object
  individualRotations[0] += 0.5; // Rotate the first object
  individualRotations[1] += 0.5; // Rotate the second object
  individualRotations[2] += 0.5; // Rotate the third object

  // Ensure individual rotations stay within 0-360 degrees range
  individualRotations = individualRotations.map(angle => (angle >= 360 ? angle - 360 : angle));

  // Update the current angle for the orbiting effect
  currentAngle = animate(currentAngle, SPEED, elapsed);

  LAST_FRAME = now;

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // Draw each object with its unique rotation
  for (let i = 0; i < VAOs.length; i++) {
    gl.bindVertexArray(VAOs[i]);

    // Pass individual rotation (axisAngle) for each object to the draw function
    draw(gl, currentAngle, individualRotations[i], projMatrix, u_mvp_matrix, translations[i], Z_AXIS_ANGLE);
  }

  requestAnimationFrame(tick);
  };

  tick();
}

function initVertexBuffers(gl, VAO, vertices) {
  
  //bind vertex
  gl.bindVertexArray(VAO);

  var vertexBuffer = gl.createBuffer();
  if (!vertexBuffer) {
    console.log('Failed to create the buffer object');
    return -1;
  }

  //bind and load vertex buffer
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

  var a_vertex = gl.getAttribLocation(gl.program, 'a_vertex');
  gl.vertexAttribPointer(a_vertex, 3, gl.FLOAT, false, 6 * Float32Array.BYTES_PER_ELEMENT, 0);
  gl.enableVertexAttribArray(a_vertex);

  //bind and load color buffer
  var a_color = gl.getAttribLocation(gl.program, 'a_color');
  gl.vertexAttribPointer(a_color, 3, gl.FLOAT, false, 6 * Float32Array.BYTES_PER_ELEMENT, 3 * Float32Array.BYTES_PER_ELEMENT);
  gl.enableVertexAttribArray(a_color);

  //empy the buffer
  gl.bindVertexArray(null);
  return vertices.length;//return length for debugging
}

function draw(gl, currentAngle, axisAngle, projMatrix, u_mvp_matrix, translation, Z_AXIS_ANGLE) {
  var mvpMatrix = glMatrix.mat4.clone(projMatrix);

  // Apply the group rotation around the Z-axis 
  glMatrix.mat4.rotateZ(mvpMatrix, mvpMatrix, glMatrix.glMatrix.toRadian(Z_AXIS_ANGLE));

  // Apply translation to move the objects to their respective positions in orbit
  glMatrix.mat4.translate(mvpMatrix, mvpMatrix, translation);

  // Apply individual rotation around the Z-axis 
  glMatrix.mat4.rotateZ(mvpMatrix, mvpMatrix, glMatrix.glMatrix.toRadian(axisAngle));

  // Apply scaling 
  glMatrix.mat4.scale(mvpMatrix, mvpMatrix, [0.5, 0.5, 0.5]);

  // Send the final MVP matrix to the shader
  gl.uniformMatrix4fv(u_mvp_matrix, false, mvpMatrix);

  // Draw 
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 8); // Adjust the vertex count if necessary
}

function animate(angle, speed, elapsed) {
  return angle + (speed * elapsed) / 100.0;
}

function keydown(ev, n, gl, currentAngle, projMatrix, u_mvp_matrix) {
  switch (ev.keyCode) {
    case 38: // up arrow key
      SPEED += 2.0;
      break;
    case 40: // down arrow key
      SPEED -= 2.0;
      break;
  }
  draw(gl, n, currentAngle, projMatrix, u_mvp_matrix);
}

function setDefault() {
  SPEED = 1000000000.0;
}
