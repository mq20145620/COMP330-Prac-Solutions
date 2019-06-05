"use strict";

class Pyramid {

    constructor(gl) {
        this.position = [0,0,0];
        this.rotation = [0,0,0];
        this.scale = [1,1,1];
        this.colour = [1,1,0,1];    // yellow
        this.matrix = glMatrix.mat4.create();

        let lines = [
            // base
            -1, 0, -1,
             1, 0, -1,
             1, 0, -1,
             1, 0,  1, 
             1, 0,  1, 
            -1, 0,  1,
            -1, 0,  1,
            -1, 0, -1,

            // apex
             0, 1,  0,
            -1, 0, -1,
             0, 1,  0,
             1, 0, -1,
             0, 1,  0,
             1, 0,  1,
             0, 1,  0,
            -1, 0,  1
        ];

        this.nPoints = lines.length / 3;
        this.positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(lines), gl.STATIC_DRAW);
       
    }

    render(gl, shader) {
        // set the world matrix
        glMatrix.mat4.identity(this.matrix);
        glMatrix.mat4.translate(this.matrix, this.matrix, this.position);
        glMatrix.mat4.rotateY(this.matrix, this.matrix, this.rotation[1]);  // heading
        glMatrix.mat4.rotateX(this.matrix, this.matrix, this.rotation[0]);  // pitch
        glMatrix.mat4.rotateZ(this.matrix, this.matrix, this.rotation[2]);  // roll
        glMatrix.mat4.scale(this.matrix, this.matrix, this.scale);
        gl.uniformMatrix4fv(shader["u_worldMatrix"], false, this.matrix);
       
        // set the colour
        gl.uniform4fv(shader["u_colour"], new Float32Array(this.colour));

        // draw it
        gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
        gl.vertexAttribPointer(shader["a_position"], 3, gl.FLOAT, false, 0, 0);
        gl.drawArrays(gl.LINES, 0, this.nPoints);   

    }

}