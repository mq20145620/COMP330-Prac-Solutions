"use strict";

// Shader code

const vertexShaderSource = `
attribute vec4 a_position;
uniform mat3 u_worldMatrix;
uniform mat3 u_viewMatrix;

void main() {
    // convert to homogeneous coordinates 
    vec3 pos = vec3(a_position.xy, 1);

    // multiply by world martix
    pos = u_worldMatrix * pos;

    // multiply by view martix
    pos = u_viewMatrix * pos;

    // output to gl_Position
    gl_Position = vec4(pos.xy,0,1);
}
`;

const fragmentShaderSource = `
precision mediump float;
uniform vec4 u_colour;

void main() {
  gl_FragColor = u_colour; 
}
`;

function createShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (!success) {
        console.error(gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }
    return shader;
}

function createProgram(gl, vertexShader, fragmentShader) {
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    const success = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (!success) {
        console.error(gl.getProgramInfoLog(program));
        gl.deleteProgram(program);
        return null;
    }
    return program;
}

 function resize(canvas) {
    const resolution = window.devicePixelRatio || 1.0;

    const displayWidth = 
        Math.floor(canvas.clientWidth * resolution);
    const displayHeight = 
        Math.floor(canvas.clientHeight * resolution);

    if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
        return true;
    }
    else {
        return false;
    }    
}

function main() {

    // === Initialisation ===
    const resolution = 40;

    // get the canvas element & gl rendering 
    const canvas = document.getElementById("c");
    const gl = canvas.getContext("webgl");

    if (gl === null) {
        window.alert("WebGL not supported!");
        return;
    }
    
    // create GLSL shaders, upload the GLSL source, compile the shaders
    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
    const program =  createProgram(gl, vertexShader, fragmentShader);
    gl.useProgram(program);

    // Initialise the shader attributes & uniforms
    const positionAttribute = gl.getAttribLocation(program, "a_position");
    const worldMatrixUniform = gl.getUniformLocation(program, "u_worldMatrix");
    const viewMatrixUniform = gl.getUniformLocation(program, "u_viewMatrix");
    const colourUniform = gl.getUniformLocation(program, "u_colour");

    // Initialise the array buffer
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.enableVertexAttribArray(positionAttribute);
    gl.vertexAttribPointer(positionAttribute, 2, gl.FLOAT, false, 0, 0);
    
    // create a solar system

    const red = [1,0,0,1];
    const yellow = [1,1,0,1];
    const blue = [0,0,1,1];
    const grey = [0.5, 0.5, 0.5, 1];
    const white = [1, 1, 1, 1];

    const root = new GameObject();

    const sun = new Circle(yellow);
    sun.parent = root;

    // earth is 5 units from the sun and 1/4 its size
    const earthFocus = new GameObject();
    earthFocus.parent = root;

    const earthPivot = new GameObject();
    earthPivot.parent = earthFocus;
    earthPivot.translation = [5,0]; 

    const earth = new Circle(blue);
    earth.parent = earthPivot;
    earth.translation = [0,0]; 
    earth.scale = 0.25;

    // moon is 2 units from the earth and 1/2 its size
    const moonFocus = new GameObject();
    moonFocus.parent = earthPivot;

    const moon = new Circle(grey);
    moon.parent = moonFocus;
    moon.translation = [0,1];
    moon.scale = 0.125;

    // mars is 10 units from the sun and 1/5 its size
    const marsFocus = new GameObject();
    marsFocus.parent = root;
    
    const marsPivot = new GameObject();
    marsPivot.parent = marsFocus;
    marsPivot.translation = [10,0]; 

    const mars = new Circle(red);
    mars.parent = marsPivot;
    mars.scale = 0.2;

    const phobosFocus = new GameObject();
    phobosFocus.parent = marsPivot;

    const phobos = new Circle(grey);
    phobos.parent = phobosFocus;
    phobos.translation = [0,1];
    phobos.scale = 0.1;

    const deimosFocus = new GameObject();
    deimosFocus.parent = marsPivot;

    const deimos = new Circle(white);
    deimos.parent = deimosFocus;
    deimos.translation = [0,1.5];
    deimos.scale = 0.1;
        
    // Camera

    const camera = new GameObject();
    camera.parent = earth;

    // === Per Frame operations ===

    const earthDay = 2; // seconds
    const moonMonth = 10; // seconds
    const earthYear = 60; // seconds

    const marsDay = 4; // seconds
    const marsYear = 80; // seconds
    const phobosMonth = 12; // seconds
    const deimosMonth = 8; // seconds


    // update objects in the scene
    let update = function(deltaTime) {
        earth.rotation += Math.PI * 2 * deltaTime / earthDay;
        earthFocus.rotation += Math.PI * 2 * deltaTime / earthYear;
        moonFocus.rotation += Math.PI * 2 * deltaTime / moonMonth;

        mars.rotation += Math.PI * 2 * deltaTime / marsDay;
        marsFocus.rotation += Math.PI * 2 * deltaTime / marsYear;
        phobosFocus.rotation += Math.PI * 2 * deltaTime / phobosMonth;
        deimosFocus.rotation += Math.PI * 2 * deltaTime / deimosMonth;

    };

    // redraw the scene
    let render = function() {
        // clear the screen
        gl.viewport(0, 0, canvas.width, canvas.height);        
        gl.clearColor(0, 0, 0, 1);
        gl.clear(gl.COLOR_BUFFER_BIT);

        // compute inverse world matrix (ignoring scale)
        let viewMatrix = Matrix.identity();

        for (let o = camera; o != null; o = o.parent) {
            viewMatrix = Matrix.multiply(viewMatrix,
                Matrix.scale(1/o.scale, 1/o.scale));
            viewMatrix = Matrix.multiply(viewMatrix,
                Matrix.rotation(-o.rotation));
            viewMatrix = Matrix.multiply(viewMatrix,
                Matrix.translation(
                    -o.translation[0], -o.translation[1]));
        }

        const ix = viewMatrix[0];
        const iy = viewMatrix[1];

        const jx = viewMatrix[3];
        const jy = viewMatrix[4];

        const actual_sx = Math.sqrt(ix * ix + iy * iy);
        const actual_sy = Math.sqrt(jx * jx + jy * jy);

        const desired_sx = 2 * resolution / canvas.width;
        const desired_sy = 2 * resolution / canvas.height;

        viewMatrix = Matrix.multiply(Matrix.scale(desired_sx/actual_sx, desired_sy/actual_sy), viewMatrix);


        gl.uniformMatrix3fv(viewMatrixUniform, false, viewMatrix);

        // render everything
        root.render(gl, worldMatrixUniform, colourUniform, Matrix.identity());
    };

    // animation loop
    let oldTime = 0;
    let animate = function(time) {
        time = time / 1000;
        let deltaTime = time - oldTime;
        oldTime = time;

        resize(canvas);
        update(deltaTime);
        render();

        requestAnimationFrame(animate);
    }

    // start it going
    animate(0);
}    

