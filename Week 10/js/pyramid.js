"use strict";

class Pyramid {

    constructor(gl) {
        this.position = [0,0,0];
        this.rotation = [0,0,0];
        this.scale = [1,1,1];
        this.colour = [1,1,0,1];    // yellow
        this.matrix = glMatrix.mat4.create();

        // 2) Redesign pyrmand as triangles

        let points = [
            // base            
            -1, 0, -1,
             1, 0, -1,             
             1, 0,  1,

             1, 0,  1, 
            -1, 0,  1,
            -1, 0, -1,

            // sides
             0, 1,  0,
            -1, 0, -1,
            -1, 0,  1,

             0, 1,  0,
            -1, 0,  1,
             1, 0,  1,

             0, 1,  0,
             1, 0,  1,
             1, 0, -1,

             0, 1,  0,
             1, 0, -1,
            -1, 0, -1,
        ];

        this.nPoints = points.length / 3;
        this.positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(points), gl.STATIC_DRAW);

        // 5) Set the vertex colours
        let colours = [
            // base is black
            0,0,0,
            0,0,0,
            0,0,0,

            0,0,0,
            0,0,0,
            0,0,0,

            // sides are red, yellow, green, blue
            1,0,0,
            1,0,0,
            1,0,0,

            1,1,0,
            1,1,0,
            1,1,0,

            0,1,0,
            0,1,0,
            0,1,0,

            0,0,1,
            0,0,1,
            0,0,1,


        ];

        this.colourBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.colourBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colours), gl.STATIC_DRAW);


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
       
        // 4) set the colour attribute
        gl.bindBuffer(gl.ARRAY_BUFFER, this.colourBuffer);
        gl.vertexAttribPointer(shader["a_colour"], 3, gl.FLOAT, false, 0, 0);

        // draw it
        gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
        gl.vertexAttribPointer(shader["a_position"], 3, gl.FLOAT, false, 0, 0);
        gl.drawArrays(gl.TRIANGLES, 0, this.nPoints);   

    }

}