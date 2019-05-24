"use strict";

class Pyramid {

    constructor(gl) {
        this.position = [0,0,0];
        this.rotation = [0,0,0];
        this.scale = [1,1,1];
        this.colour = [1,1,0,1];    // yellow
        this.matrix = glMatrix.mat4.create();
        this.normalMatrix = glMatrix.mat4.create();

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

        // 2) Add face normals to the pyramids
        let normals = [];

        // loop over each triangle in the points array
        let faceNormal = glMatrix.vec3.create();
        let v10 = glMatrix.vec3.create();
        let v20 = glMatrix.vec3.create();

        for (int i = 0; i < this.nPoints / 3; i++){
            const p0 = points.slice(i * 9, i * 9 + 3);
            const p1 = points.slice(i * 9 + 3, i * 9 + 6);
            const p2 = points.slice(i * 9 + 6, i * 9 + 9);

            glMatrix.vec3.subtract(v10, p1, p0);
            glMatrix.vec3.subtract(v20, p2, p0);
            glMatrix.vec3.cross(faceNormal, v10, v20);
            glMatrix.vec3.normalize(faceNormal, faceNormal);

            // three copies, one for each vertex
            normals.push(faceNormal[0], faceNormal[1], faceNormal[2]);
            normals.push(faceNormal[0], faceNormal[1], faceNormal[2]);
            normals.push(faceNormal[0], faceNormal[1], faceNormal[2]);
        }
        
        this.normalBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);

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
       
        // 2) set the normal matrix
        glMatrix.mat3.noramlFromMat4(this.normalMatrix, this.matrix);
        gl.uniformMatrix3fv(shader["u_normalMatrix"], false, this.matrix);

        // 1) Set the diffuse material to yellow
        gl.uniform3fv(shader["u_diffuseMaterial"], new Float32Array(this.colour));
        
        // Set the vertex attribute
        gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
        gl.vertexAttribPointer(shader["a_position"], 3, gl.FLOAT, false, 0, 0);

        // 2) Set the normal attribute
        gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
        gl.vertexAttribPointer(shader["a_normal"], 3, gl.FLOAT, false, 0, 0);

        gl.drawArrays(gl.TRIANGLES, 0, this.nPoints);   

    }

}