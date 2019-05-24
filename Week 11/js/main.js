"use strict";

const vertexShaderSource = `
attribute vec4 a_position;
attribute vec2 a_texcoord;

uniform mat4 u_worldMatrix;
uniform mat4 u_viewMatrix;
uniform mat4 u_projectionMatrix;

varying vec2 v_texcoord;

void main() {
    v_texcoord = a_texcoord;
    gl_Position = u_projectionMatrix * u_viewMatrix * u_worldMatrix * a_position;
}
`;

const fragmentShaderSource = `
precision mediump float;

uniform sampler2D u_texture;

varying vec2 v_texcoord;

void main() {
    gl_FragColor = texture2D(u_texture, v_texcoord); 
}
`;

function createShader(gl, type, source) {
    check(isContext(gl), isString(source));

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
    check(isContext(gl), isShader(vertexShader, fragmentShader));

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

// Load a texture from a URL or file location

function loadTexture(gl, url) {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);

    const image = new Image();
    const level = 0;
    const internalFormat = gl.RGBA;
    const width = 1;
    const height = 1;
    const border = 0;
    const srcFormat = gl.RGBA;
    const srcType = gl.UNSIGNED_BYTE;
    const pixel = new Uint8Array([0, 0, 255, 255]);  // opaque blue
    gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
                    width, height, border, srcFormat, srcType,
                    pixel);          

    // Loading images is asynchronous. This sets up a callback that is executed
    // when the image has loaded, to turn it into a texture.

    image.onload = function() {                
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
                    srcFormat, srcType, image);  
        gl.generateMipmap(gl.TEXTURE_2D);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);

    };

    image.src = url;      

    return texture;
}


function main() {

    // === Initialisation ===

    // turn on antialiasing
    const contextParameters =  { antialias: true };

    // get the canvas element & gl rendering 
    const canvas = document.getElementById("c");
    const gl = canvas.getContext("webgl", contextParameters);
    if (gl === null) {
        window.alert("WebGL not supported!");
        return;
    }

    // enable depth testing & backface culling
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);

    // create GLSL shaders, upload the GLSL source, compile the shaders
    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
    const program =  createProgram(gl, vertexShader, fragmentShader);
    gl.useProgram(program);

    // Initialise the shader attributes & uniforms
    let shader = {};
    const nAttributes = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES);
    for (let i = 0; i < nAttributes; i++) {
        const name = gl.getActiveAttrib(program, i).name;
        shader[name] = gl.getAttribLocation(program, name);
        gl.enableVertexAttribArray(shader[name]);
    }

    const nUniforms = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
    for (let i = 0; i < nUniforms; i++) {
        const name = gl.getActiveUniform(program, i).name;
        shader[name] = gl.getUniformLocation(program, name);
    }

    // Generate cylindrical mesh

    let points = [];
    let uvs = [];

    const nDivisions = 12;
    for (let i = 0; i < nDivisions; i++) {
        let angle0 = i * Math.PI * 2 / nDivisions;
        let angle1 = (i+1) * Math.PI * 2 / nDivisions;

        let x0 = Math.cos(angle0);
        let z0 = Math.sin(angle0);
        let x1 = Math.cos(angle1);
        let z1 = Math.sin(angle1);

        points.push(x0, 0.5, z0);
        points.push(x1, -0.5, z1);
        points.push(x0, -0.5, z0);

        points.push(x1, -0.5, z1);
        points.push(x0, 0.5, z0);
        points.push(x1, 0.5, z1);

        const u0 = 3 * i / nDivisions;
        const u1 = 3 * (i+1) / nDivisions;

        uvs.push(u0, 0);
        uvs.push(u1, 1);
        uvs.push(u0, 1);

        uvs.push(u1, 1);
        uvs.push(u0, 0);
        uvs.push(u1, 0);

    }

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(points), gl.STATIC_DRAW);

    const uvBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(uvs), gl.STATIC_DRAW);

    const brickDiffuseTexture = loadTexture(gl, "textures/brick-diffuse.png");

    // === Per Frame operations ===

    const cameraRotation = [0,0,0];
    const cameraRotationSpeed = 2 * Math.PI / 10; // radians per second 
    let cameraDistance = 2;
    const cameraZoomSpeed = 1; // distance per second 

    // update objects in the scene
    let update = function(deltaTime) {
        check(isNumber(deltaTime));

        // use the keys to control the camera

        if (inputManager.keyPressed["ArrowLeft"]) {
            cameraRotation[1] -= cameraRotationSpeed * deltaTime;
        }
        if (inputManager.keyPressed["ArrowRight"]) {
            cameraRotation[1] += cameraRotationSpeed * deltaTime;
        }
        if (inputManager.keyPressed["ArrowUp"]) {
            cameraRotation[0] -= cameraRotationSpeed * deltaTime;
        }
        if (inputManager.keyPressed["ArrowDown"]) {
            cameraRotation[0] += cameraRotationSpeed * deltaTime;
        }
        if (inputManager.keyPressed["PageUp"]) {
            cameraDistance -= cameraZoomSpeed * deltaTime;
        }        
        if (inputManager.keyPressed["PageDown"]) {
            cameraDistance += cameraZoomSpeed * deltaTime;
        }

    };

    // allocate matrices
    const projectionMatrix = glMatrix.mat4.create();
    const viewMatrix = glMatrix.mat4.create();
    const worldMatrix = glMatrix.mat4.create();
    const cameraPosition = glMatrix.vec3.create();

    // redraw the scene
    let render = function() {
        // clear the screen
        gl.viewport(0, 0, canvas.width, canvas.height);        
        gl.clearColor(0, 0, 0, 1);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        // set up the camera projection matrix
        {
            const fovy = Math.PI / 2;
            const aspect = canvas.width / canvas.height;
            const near = 0.01;
            const far = 100;
            glMatrix.mat4.perspective(projectionMatrix, fovy, aspect, near, far);
            gl.uniformMatrix4fv(shader["u_projectionMatrix"], false, projectionMatrix);
        }

        // set up view matrix and camera position
        {
            glMatrix.vec3.set(cameraPosition, 0, 0, cameraDistance);
            glMatrix.vec3.rotateZ(cameraPosition, cameraPosition, [0,0,0], cameraRotation[2]);
            glMatrix.vec3.rotateX(cameraPosition, cameraPosition, [0,0,0], cameraRotation[0]);
            glMatrix.vec3.rotateY(cameraPosition, cameraPosition, [0,0,0], cameraRotation[1]);
            gl.uniform3fv(shader["u_cameraPosition"], cameraPosition);

            const target = [0,0,0];
            const up = [0,1,0];
            glMatrix.mat4.lookAt(viewMatrix, cameraPosition, target, up);
            gl.uniformMatrix4fv(shader["u_viewMatrix"], false, viewMatrix);
        }

        // set up world matrix
        {            
            glMatrix.mat4.identity(worldMatrix);
            gl.uniformMatrix4fv(shader["u_worldMatrix"], false, worldMatrix);
        }

        // draw cylinder
        {
            gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
            gl.vertexAttribPointer(shader["a_position"], 3, gl.FLOAT, false, 0, 0);

            gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
            gl.vertexAttribPointer(shader["a_texcoord"], 2, gl.FLOAT, false, 0, 0);

            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, brickDiffuseTexture);
            gl.uniform1i(shader["u_texture"], 0);    

            gl.drawArrays(gl.TRIANGLES, 0, points.length / 3);           
        }

    };

    // animation loop
    let oldTime = 0;
    let animate = function(time) {
        check(isNumber(time));
        
        time = time / 1000;
        let deltaTime = time - oldTime;
        oldTime = time;

        update(deltaTime);
        render();

        requestAnimationFrame(animate);
    }

    // start it going
    animate(0);
}    

