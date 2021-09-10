"use strict";
var bounce = 0;
var scare = 0;
var canvas;
var gl;
var projection;
var program;
var NumVertices  = 36;
var numTextures = 6;
var normalsArray = [];
var texCoordsArray =[];
var texture = [ ];
var Light_switch = true;
var ghost_move = 0;
var texCoord = [
    vec2(0,0),
    vec2(0,1),
    vec2(1,1),
    vec2(1,0)
];
var modelView;
var mvMatrix;

var points = [];
var colors = [];
var vertices = [
    vec4( -50, -50,  50*2*2 , 1.0),
    vec4( -50,  50,  50*2*2 , 1.0),
    vec4(  50,  50,  50*2*2 , 1.0),
    vec4(  50, -50,  50*2*2 , 1.0),
    vec4( -50, -50, -50*2*4 , 1.0),
    vec4( -50,  50, -50*2*4 , 1.0),
    vec4(  50,  50, -50*2*4 , 1.0),
    vec4(  50, -50, -50*2*4 , 1.0)
];


var lightPosition = vec4(0.0, 0.0, -400, 1.0);

var lightAmbient = vec4(0.6, 0.6, 0.6, 1.0 );
var lightDiffuse = vec4( 0.6, 0.6, 0.6, 1.0 );
var lightSpecular = vec4( 0.6, 0.6, 0.6, 1.0 );

var materialAmbient = vec4( 1.0, 1.0, 0.8, 1.0 );
var materialDiffuse = vec4( 1.0, 1.0, 0.8, 1.0);
var materialSpecular = vec4( 1.0, 1.0, 0.8, 1.0 );
var materialAmbient2 = vec4( 1.0, 1.0, 1.0, 1.0 );
var materialDiffuse2 = vec4( 1.0, 1.0, 1.0, 1.0);
var materialSpecular2 = vec4( 1.0, 1.0, 1.0, 1.0 );
var materialShininess = 100.0;

var ctm;
var ambientProduct, diffuseProduct, specularProduct;
var ambientProduct2, diffuseProduct2, specularProduct2;

var vertexColors = [
    [ 1.0, 0.0, 0.0, 1.0 ],  // red
    [ 0.0, 0.0, 1.0, 1.0 ],  // blue
    [ 0.0, 1.0, 0.0, 1.0 ],  // green
    [ 1.0, 1.0, 0.0, 1.0 ],  // yellow
    [ 0.0, 1.0, 1.0, 1.0 ],  // cyan
    [ 1.0, 0.0, 1.0, 1.0 ],
    [ 1.0, 1.0, 1.0, 1.0 ]   // magenta
];
var image = [];
var xAxis = 0;
var yAxis = 1;
var zAxis = 2;

var axis = 0;
var theta = [ 0, 0, 0 ];
var zoom = [0.0, 0.0, 250.0];

var thetaLoc;

var verticesClock = [
    vec4( -10, -3,  10, 1.0),
    vec4( -10,  3,  10, 1.0),
    vec4(  10,  3,  10, 1.0),
    vec4(  10, -3,  10, 1.0),
    vec4( -10, -3, -10, 1.0),
    vec4( -10,  3, -10, 1.0),
    vec4(  10,  3, -10, 1.0),
    vec4(  10, -3, -10, 1.0)
];

var radius = Math.sqrt(10.0*10.0 + 10.0*10.0); // The distance of each of the vertices to y-axis
var subDivisions = 5;

var verticesNeedles = [
    vec4( -10, -0.5,  0.5, 1.0),
    vec4( -10,  0.5,  0.5, 1.0),
    vec4(   0,  0.5,  0.5, 1.0),
    vec4(   0, -0.5,  0.5, 1.0),
    vec4( -10, -0.5, -0.5, 1.0),
    vec4( -10,  0.5, -0.5, 1.0),
    vec4(   0,  0.5, -0.5, 1.0),
    vec4(   0, -0.5, -0.5, 1.0)
];
var needlesRotate = 0.0;

var verticesNeedle2 = [
    vec4( -7, -0.5,  0.5, 1.0),
    vec4( -7,  0.5,  0.5, 1.0),
    vec4(   0,  0.5,  0.5, 1.0),
    vec4(   0, -0.5,  0.5, 1.0),
    vec4( -7, -0.5, -0.5, 1.0),
    vec4( -7,  0.5, -0.5, 1.0),
    vec4(   0,  0.5, -0.5, 1.0),
    vec4(   0, -0.5, -0.5, 1.0)
];
var needlesRotate2 = 0.0;

var verticesFrame1 = [
    vec4( -10, -1,  10, 1.0),
    vec4( -10,  1,  10, 1.0),
    vec4(  10,  1,  10, 1.0),
    vec4(  10, -1,  10, 1.0),
    vec4( -10, -1, -10, 1.0),
    vec4( -10,  1, -10, 1.0),
    vec4(  10,  1, -10, 1.0),
    vec4(  10, -1, -10, 1.0)
];
// Sphere
var indexSphere = 0;
/*
var va = vec4(0.0, 0.0, -1.0);
var vb = vec4(0.0, 0.942809, 0.333333);
var vc = vec4(-0.816497, -0.471405, 0.333333);
var vd = vec4(0.816497, -0.471405, 0.333333);
*/

var va = vec4(0.0, 0.0, -1.0, 1);
var vb = vec4(0.0, 0.942809, 0.333333, 1);
var vc = vec4(-0.816497, -0.471405, 0.333333, 1);
var vd = vec4(0.816497, -0.471405, 0.333333, 1);

var ghost = 0;

function setLightProducts(ambientProduct, diffuseProduct, specularProduct) {
    gl.uniform4fv(gl.getUniformLocation(program, "ambientProduct"),
       flatten(ambientProduct));
    gl.uniform4fv(gl.getUniformLocation(program, "diffuseProduct"),
       flatten(diffuseProduct) );
    gl.uniform4fv(gl.getUniformLocation(program, "specularProduct"), 
       flatten(specularProduct) );  
}
window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    drawBox();
    drawClock();
    drawNeedles();
    drawFrame();
    drawFrame();
    drawFrame();
    tetrahedron(va, vb, vc, vd, 3);
    
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.0, 0.0, 0.0, 1.0 );
    
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    //
    //  Load shaders and initialize attribute buffers
    //
    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    var nBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, nBuffer);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW );
    
    var vNormal = gl.getAttribLocation( program, "vNormal" );
    gl.vertexAttribPointer( vNormal, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vNormal );

    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    var tBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, tBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(texCoordsArray), gl.STATIC_DRAW );
    var vTexCoord = gl.getAttribLocation( program, "vTexCoord" );
    gl.vertexAttribPointer( vTexCoord, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vTexCoord );


    initializeTexture(image, "stars.jpg", 0);
    initializeTexture(image, "wall.jpg", 1);
    initializeTexture(image, "earth.jpg", 2);
    initializeTexture(image, "wall.jpg", 3);
    initializeTexture(image, "jupiter.jpg", 4);
    initializeTexture(image, "frogs.jpg", 5);
    initializeTexture(image, "test.png", 6);
    initializeTexture(image, "clock.jpg", 7);
    initializeTexture(image, "Mona-Lisa.jpg", 8);
    initializeTexture(image, "por2.jpg", 9);
    initializeTexture(image, "por3.jpg", 10);



    ambientProduct = mult(lightAmbient, materialAmbient);
    diffuseProduct = mult(lightDiffuse, materialDiffuse);
    specularProduct = mult(lightSpecular, materialSpecular);
    gl.uniform4fv(gl.getUniformLocation(program, "lightPosition"), 
       flatten(lightPosition) );
       
    gl.uniform1f(gl.getUniformLocation(program, 
       "shininess"),materialShininess);
    modelView = gl.getUniformLocation( program, "modelView" );
    projection = gl.getUniformLocation( program, "projection" );
    window.onkeydown = keyResponse;
    document.getElementById("TurnOFF").onclick = TurnOFF;
        
    render();
}

function TurnOFF(){
            if (Light_switch) {
            Light_switch = false;
        }
        else {

            Light_switch = true;
            ghost_move++;
            
        }
}
function keyResponse(event) {
	var key = String.fromCharCode(event.keyCode);
	switch (key) {
		case 'R':
			axis = yAxis;
            if (theta[axis] < 180 || ghost_move<=4)
			theta[axis] += 5.0;
			break;
		case 'L':
			axis = yAxis;
            if (theta[axis] > -180 || ghost_move<=4)
			theta[axis] -= 5.0;
			break;
		case 'T':
        
        if (Light_switch) {
			Light_switch = false;
        }
        else {

            Light_switch = true;
            ghost_move++;
            
        }
			
	}
}

function triangle(a, b, c, color) {
    var indices = [ a, b, c];

    for ( var i = 0; i < indices.length; ++i ) {
        points.push( indices[i] );
        //colors.push( vertexColors[indices[i]] );
    
        // for solid colored faces use 
        //colors.push(color);
        
    }
}
function drawBox()
{
    quad( vertices[1], vertices[0], vertices[3], vertices[2], vertexColors[6] );
    quad( vertices[2], vertices[3], vertices[7], vertices[6], vertexColors[6] );
    quad( vertices[4], vertices[5], vertices[6], vertices[7], vertexColors[6] );
    quad( vertices[5], vertices[4], vertices[0], vertices[1], vertexColors[6] );
    quad( vertices[1], vertices[2], vertices[6], vertices[5], vertexColors[6] );
    quad( vertices[0], vertices[4], vertices[7], vertices[3], vertexColors[6] );

}

// Function to draw a clock frame on the wall
function drawClock()
{

    divide_quad(verticesClock[1], verticesClock[0], verticesClock[3], verticesClock[2], subDivisions);
    divide_quad(verticesClock[2], verticesClock[3], verticesClock[7], verticesClock[6], subDivisions);
    divide_quad(verticesClock[6], verticesClock[7], verticesClock[4], verticesClock[5], subDivisions);
    divide_quad(verticesClock[5], verticesClock[4], verticesClock[0], verticesClock[1], subDivisions);

}


// Function divide_quad() to recursively divide the quadrilateral faces of 
// the box into 2 new quadrilateral faces and push the vertices into points
// array. a, b, c, d are the four vertices of the face got passed in. Counter
// is a non-negative integer to count specify when does the recursive process
// end. faceColor is the color assigned for this face.
function divide_quad(a, b, c, d, counter)
{
    if (counter < 1) {
    quad(a, b, c, d, vertexColors[6]);
    } else {

    // Calculating the coordinates of the two mid points and normalize their
    // distance to y-axis to be the same.
    var upperMidPt = vec4(0.0, 0.0, 0.0);
    var x1 = (a[0]+d[0])/2.0;
    var y1 = (a[1]+d[1])/2.0;
    var z1 = (a[2]+d[2])/2.0;
    upperMidPt[0] = x1 * radius / (Math.sqrt(x1*x1 + z1*z1));
    upperMidPt[1] = y1;
    upperMidPt[2] = z1 * radius / (Math.sqrt(x1*x1 + z1*z1));
    
    var lowerMidPt = vec4(0.0, 0.0, 0.0);
    var x2 = (b[0]+c[0])/2.0;
    var y2 = (b[1]+c[1])/2.0;
    var z2 = (b[2]+c[2])/2.0;
    lowerMidPt[0] = x2 * radius / (Math.sqrt(x2*x2 + z2*z2));
    lowerMidPt[1] = y2;
    lowerMidPt[2] = z2 * radius / (Math.sqrt(x2*x2 + z2*z2));
    
    
    // Recursive function call
    divide_quad(a, b, lowerMidPt, upperMidPt, counter-1);
    divide_quad(upperMidPt, lowerMidPt, c, d, counter-1);   
    }
}

// Function to draw needles on the clock
function drawNeedles()
{
    // Push the long needle's vertices
    quad(verticesNeedles[1], verticesNeedles[0], verticesNeedles[3], verticesNeedles[2], vertexColors[6]);
    quad(verticesNeedles[2], verticesNeedles[3], verticesNeedles[7], verticesNeedles[6], vertexColors[6]);
    quad(verticesNeedles[3], verticesNeedles[0], verticesNeedles[4], verticesNeedles[7], vertexColors[6]);
    quad(verticesNeedles[6], verticesNeedles[5], verticesNeedles[1], verticesNeedles[2], vertexColors[6]);
    quad(verticesNeedles[4], verticesNeedles[5], verticesNeedles[6], verticesNeedles[7], vertexColors[6]);
    quad(verticesNeedles[5], verticesNeedles[4], verticesNeedles[0], verticesNeedles[1], vertexColors[6]);

    // Push the short needle's vertices
    quad(verticesNeedle2[1], verticesNeedle2[0], verticesNeedle2[3], verticesNeedle2[2], vertexColors[6]);
    quad(verticesNeedle2[2], verticesNeedle2[3], verticesNeedle2[7], verticesNeedle2[6], vertexColors[6]);
    quad(verticesNeedle2[3], verticesNeedle2[0], verticesNeedle2[4], verticesNeedle2[7], vertexColors[6]);
    quad(verticesNeedle2[6], verticesNeedle2[5], verticesNeedle2[1], verticesNeedle2[2], vertexColors[6]);
    quad(verticesNeedle2[4], verticesNeedle2[5], verticesNeedle2[6], verticesNeedle2[7], vertexColors[6]);
    quad(verticesNeedle2[5], verticesNeedle2[4], verticesNeedle2[0], verticesNeedle2[1], vertexColors[6]);

}

function drawFrame(){
    quad(verticesFrame1[1], verticesFrame1[0], verticesFrame1[3], verticesFrame1[2], vertexColors[6]);
    quad(verticesFrame1[2], verticesFrame1[3], verticesFrame1[7], verticesFrame1[6], vertexColors[6]);
    quad(verticesFrame1[3], verticesFrame1[0], verticesFrame1[4], verticesFrame1[7], vertexColors[6]);
    quad(verticesFrame1[6], verticesFrame1[5], verticesFrame1[1], verticesFrame1[2], vertexColors[6]);
    quad(verticesFrame1[4], verticesFrame1[5], verticesFrame1[6], verticesFrame1[7], vertexColors[6]);
    quad(verticesFrame1[5], verticesFrame1[4], verticesFrame1[0], verticesFrame1[1], vertexColors[6]);
}

function initializeTexture(myImage, fileName, id) {
    myImage[id] = new Image();
    myImage[id].onload = function() {
        configureTexture(myImage[id], id);
    }
    myImage[id].src = fileName;
}

function configureTexture(image, id) {
    texture[id] = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture[id]);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl. TEXTURE_2D, gl. TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.uniform1i(gl.getUniformLocation(program, "texture"), 0);
}

function quad(a, b, c, d, color) 
{
    var t1 = subtract(b, a);
    var t2 = subtract(c, a);
    var normal = cross(t2, t1);
    normal = vec3(normal);
    // We need to parition the quad into two triangles in order for
    // WebGL to be able to render it.  In this case, we create two
    // triangles from the quad indices
    
    //vertex color assigned by the index of the vertex
    var indices = [ a, b, c, a, c, d ];

    points.push( indices[0]);
    texCoordsArray.push(texCoord[0]);
    normalsArray.push(normal);

    points.push(indices[1] );
    texCoordsArray.push(texCoord[1]);
    normalsArray.push(normal);

    points.push( indices[2] );
    texCoordsArray.push(texCoord[2]);
    normalsArray.push(normal);

    points.push( indices[3]);
    texCoordsArray.push(texCoord[0]);
    normalsArray.push(normal);

    points.push( indices[4] );
    texCoordsArray.push(texCoord[2]);
    normalsArray.push(normal);

    points.push( indices[5] );
    texCoordsArray.push(texCoord[3]);
    normalsArray.push(normal);


}

// Functions to draw a sphere. From textbook code 
// shadedSphere1.js (Chapter 6)
function triangleSphere(a, b, c) {

     var t1 = subtract(b, a);
     var t2 = subtract(c, a);
     var normal = cross(t2, t1);
     normal = vec3(normal);
     //normal = vec3(1, 1, 1);

     points.push(a);
     points.push(b);
     points.push(c);
     normalsArray.push(normal);
     normalsArray.push(normal);
     normalsArray.push(normal);

     if (ghost % 3 == 2) {
     
     texCoordsArray.push(texCoord[0]);
     texCoordsArray.push(texCoord[1]);
     texCoordsArray.push(texCoord[2]);

    } else {

     texCoordsArray.push(texCoord[0]);
     texCoordsArray.push(texCoord[2]);
     texCoordsArray.push(texCoord[3]);

    }

    indexSphere += 3;
    ghost++;

}


function divideTriangle(a, b, c, count) {
    if ( count > 0 ) {

        var ab = normalize(mix( a, b, 0.5), true);
        var ac = normalize(mix( a, c, 0.5), true);
        var bc = normalize(mix( b, c, 0.5), true);

        divideTriangle( a, ab, ac, count - 1 );
        divideTriangle( ab, b, bc, count - 1 );
        divideTriangle( bc, c, ac, count - 1 );
        divideTriangle( ab, bc, ac, count - 1 );

    }
    else {
        triangleSphere( a, b, c );
    }
}


function tetrahedron(a, b, c, d, n) {
    divideTriangle(a, b, c, n);
    divideTriangle(d, c, b, n);
    divideTriangle(a, d, b, n);
    divideTriangle(a, c, d, n);
}

function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	var pMatrix = perspective(45, 1.0, 1.0, 1000.0);
    if (Light_switch ) {
    lightAmbient = vec4(0.6, 0.6, 0.6, 1.0 );
    lightDiffuse = vec4( 0.6, 0.6, 0.6, 1.0 );
    lightSpecular = vec4( 0.6, 0.6, 0.6, 1.0 );
    } else {
    lightAmbient = vec4(0.1, 0.1, 0.1, 1.0 );
    lightDiffuse = vec4( 0.1, 0.1, 0.1, 1.0 );
    lightSpecular = vec4( 0.6, 0.6, 0.6, 1.0 );
    }
    ambientProduct = mult(lightAmbient, materialAmbient);
    diffuseProduct = mult(lightDiffuse, materialDiffuse);
    specularProduct = mult(lightSpecular, materialSpecular);

    gl.uniform4fv(gl.getUniformLocation(program, "lightPosition"), flatten(lightPosition) );
    mvMatrix = mat4( );
    mvMatrix = mult(mvMatrix, translate(0.0, 0.0, -300.0));
    mvMatrix = mult(mvMatrix, translate(zoom[0], zoom[1], zoom[2]));
    mvMatrix = mult(mvMatrix, rotate(theta[0], 1.0, 0.0, 0.0));
    mvMatrix = mult(mvMatrix, rotate(theta[1], 0.0, 1.0, 0.0));
    mvMatrix = mult(mvMatrix, rotate(theta[2], 0.0, 0.0, 1.0));

	gl.uniformMatrix4fv( modelView, false, flatten(mvMatrix) );
	gl.uniformMatrix4fv( projection, false, flatten(pMatrix) );
    setLightProducts(ambientProduct, diffuseProduct, specularProduct);
    for (var i = 0; i < numTextures; i++) {
        gl.bindTexture(gl.TEXTURE_2D, texture[i]);
        gl.drawArrays( gl.TRIANGLES, i*6, 6);
    }
    points;

    mvMatrix = mat4( );
    mvMatrix = mult(mvMatrix, translate(0.0, 0.0, -300.0));
    mvMatrix = mult(mvMatrix, translate(zoom[0], zoom[1], zoom[2]));
    mvMatrix = mult(mvMatrix, rotate(theta[0], 1.0, 0.0, 0.0));
    mvMatrix = mult(mvMatrix, rotate(theta[1], 0.0, 1.0, 0.0));
    mvMatrix = mult(mvMatrix, rotate(theta[2], 0.0, 0.0, 1.0));
    mvMatrix = mult(mvMatrix, translate(-47.0, 30.0, -90.0));
    mvMatrix = mult(mvMatrix, rotate(-90.0, 0.0, 0.0, 1.0));
    
    gl.uniformMatrix4fv( modelView, false, flatten(mvMatrix) );
    //gl.bindTexture(gl.TEXTURE_2D, texture[0]);
    //gl.drawArrays( gl.TRIANGLES, 36, 840);

    for (var i = 0; i < (804 - 36)/6 ; i++) {
        gl.bindTexture(gl.TEXTURE_2D, texture[0]);
        gl.drawArrays( gl.TRIANGLES, 36 + i*6 , 6);
    }

    needlesRotate -= 2.0;

    mvMatrix = mat4( );
    mvMatrix = mult(mvMatrix, translate(0.0, 0.0, -300.0));
    mvMatrix = mult(mvMatrix, translate(zoom[0], zoom[1], zoom[2]));
    mvMatrix = mult(mvMatrix, rotate(theta[0], 1.0, 0.0, 0.0));
    mvMatrix = mult(mvMatrix, rotate(theta[1], 0.0, 1.0, 0.0));
    mvMatrix = mult(mvMatrix, rotate(theta[2], 0.0, 0.0, 1.0));
    mvMatrix = mult(mvMatrix, translate(-47.0, 30.0, -90.0));
    mvMatrix = mult(mvMatrix, rotate(needlesRotate, 1.0, 0.0, 0.0));
    mvMatrix = mult(mvMatrix, rotate(-90.0, 0.0, 0.0, 1.0));

    
    gl.uniformMatrix4fv( modelView, false, flatten(mvMatrix) );
    //gl.bindTexture(gl.TEXTURE_2D, texture[0]);
    //gl.drawArrays( gl.TRIANGLES, 36, 840);

    for (var i = 0; i < (840 - 804)/6 ; i++) {
        gl.bindTexture(gl.TEXTURE_2D, texture[0]);
        gl.drawArrays( gl.TRIANGLES, 804 + i*6 , 6);
    }

    needlesRotate2 -= .05;

    mvMatrix = mat4( );
    mvMatrix = mult(mvMatrix, translate(0.0, 0.0, -300.0));
    mvMatrix = mult(mvMatrix, translate(zoom[0], zoom[1], zoom[2]));
    mvMatrix = mult(mvMatrix, rotate(theta[0], 1.0, 0.0, 0.0));
    mvMatrix = mult(mvMatrix, rotate(theta[1], 0.0, 1.0, 0.0));
    mvMatrix = mult(mvMatrix, rotate(theta[2], 0.0, 0.0, 1.0));
    mvMatrix = mult(mvMatrix, translate(-47.0, 30.0,-90.0));
    mvMatrix = mult(mvMatrix, rotate(needlesRotate2, 1.0, 0.0, 0.0));
    mvMatrix = mult(mvMatrix, rotate(-90.0, 0.0, 0.0, 1.0));

    
    gl.uniformMatrix4fv( modelView, false, flatten(mvMatrix) );
    //gl.bindTexture(gl.TEXTURE_2D, texture[0]);
    //gl.drawArrays( gl.TRIANGLES, 841, 876);

    for (var i = 0; i < (876 - 840)/6 ; i++) {
        gl.bindTexture(gl.TEXTURE_2D, texture[0]);
        gl.drawArrays( gl.TRIANGLES, 840 + i*6 , 6);
    }

    mvMatrix = mat4( );
    mvMatrix = mult(mvMatrix, translate(0.0, 0.0, -300.0));
    mvMatrix = mult(mvMatrix, translate(zoom[0], zoom[1], zoom[2]));
    mvMatrix = mult(mvMatrix, rotate(theta[0], 1.0, 0.0, 0.0));
    mvMatrix = mult(mvMatrix, rotate(theta[1], 0.0, 1.0, 0.0));
    mvMatrix = mult(mvMatrix, rotate(theta[2], 0.0, 0.0, 1.0));
    mvMatrix = mult(mvMatrix, translate(-47.0, 15.0, -130.0));
    mvMatrix = mult(mvMatrix, rotate(-90.0, 0.0, 0.0, 1.0));
    
    gl.uniformMatrix4fv( modelView, false, flatten(mvMatrix) );
    //gl.bindTexture(gl.TEXTURE_2D, texture[0]);
    //gl.drawArrays( gl.TRIANGLES, 36, 840);

    for (var i = 0; i < (912 - 876)/6 ; i++) {
        gl.bindTexture(gl.TEXTURE_2D, texture[8]);
        gl.drawArrays( gl.TRIANGLES, 876 + i*6 , 6);
    }

    mvMatrix = mat4( );
    mvMatrix = mult(mvMatrix, translate(0.0, 0.0, -300.0));
    mvMatrix = mult(mvMatrix, translate(zoom[0], zoom[1], zoom[2]));
    mvMatrix = mult(mvMatrix, rotate(theta[0], 1.0, 0.0, 0.0));
    mvMatrix = mult(mvMatrix, rotate(theta[1], 0.0, 1.0, 0.0));
    mvMatrix = mult(mvMatrix, rotate(theta[2], 0.0, 0.0, 1.0));
    mvMatrix = mult(mvMatrix, translate(47.0, 15.0, -70.0));
    mvMatrix = mult(mvMatrix, scalem(1.5, 2, 1, 0.0));   
    mvMatrix = mult(mvMatrix, rotate(-90.0, 0.0, 0.0, 1.0));
    
    gl.uniformMatrix4fv( modelView, false, flatten(mvMatrix) );
    //gl.bindTexture(gl.TEXTURE_2D, texture[0]);
    //gl.drawArrays( gl.TRIANGLES, 36, 840);

    for (var i = 0; i < (948 - 912)/6 ; i++) {
        gl.bindTexture(gl.TEXTURE_2D, texture[9]);
        gl.drawArrays( gl.TRIANGLES, 912 + i*6 , 6);
    }

    mvMatrix = mat4( );
    mvMatrix = mult(mvMatrix, translate(0.0, 0.0, -300.0));
    mvMatrix = mult(mvMatrix, translate(zoom[0], zoom[1], zoom[2]));
    mvMatrix = mult(mvMatrix, rotate(theta[0], 1.0, 0.0, 0.0));
    mvMatrix = mult(mvMatrix, rotate(theta[1], 0.0, 1.0, 0.0));
    mvMatrix = mult(mvMatrix, rotate(theta[2], 0.0, 0.0, 1.0));
    mvMatrix = mult(mvMatrix, translate(47.0, 15.0, -190.0));
    mvMatrix = mult(mvMatrix, scalem(1.5, 2, 1, 0.0));   
    mvMatrix = mult(mvMatrix, rotate(-90.0, 0.0, 0.0, 1.0));
    
    gl.uniformMatrix4fv( modelView, false, flatten(mvMatrix) );
    //gl.bindTexture(gl.TEXTURE_2D, texture[0]);
    //gl.drawArrays( gl.TRIANGLES, 36, 840);

    for (var i = 0; i < (984 - 948)/6 ; i++) {
        gl.bindTexture(gl.TEXTURE_2D, texture[10]);
        gl.drawArrays( gl.TRIANGLES, 948 + i*6 , 6);
    }


    if (theta[1] < -150 || theta[1] > 150)
        bounce += 1;
    else 
        bounce += 0.01;
    var boucing = Math.abs(Math.sin(bounce));
    // Draw sphere
    mvMatrix = mat4( );
    mvMatrix = mult(mvMatrix, translate(4.0, 0.0, -300.0, 0.0));
    
    mvMatrix = mult(mvMatrix, translate(zoom[0], zoom[1], zoom[2], 0.0));
    mvMatrix = mult(mvMatrix, rotate(theta[0], 1.0, 0.0, 0.0, 0.0));
    mvMatrix = mult(mvMatrix, rotate(theta[1], 0.0, 1.0, 0.0, 0.0));
    mvMatrix = mult(mvMatrix, rotate(theta[2], 0.0, 0.0, 1.0, 0.0));
    switch (ghost_move) {
        case 0:
        mvMatrix = mult(mvMatrix, translate(4.0, 0.0, -150.0, 0.0));
        break;
        case 1:
        mvMatrix = mult(mvMatrix, translate(-20.0, 0.0, -110.0, 0.0));
        break;
        case 2:
        mvMatrix = mult(mvMatrix, translate(5.0, 0.0, -90.0, 0.0));
        break;
        case 3:
        mvMatrix = mult(mvMatrix, translate(0.0, 0.0, -70.0, 0.0));
        break;
        case 4:
        mvMatrix = mult(mvMatrix, translate(0.0, 0.0, -10.0, 0.0));
        break;
        default:
        mvMatrix = mult(mvMatrix, translate(0.0, 0.0, 65.0, 0.0));
        break;
    }
    mvMatrix = mult(mvMatrix, translate(0.0, 3*boucing, 0.0, 0.0));

    if ((theta[1] < -150 || theta[1] > 150) && scare >= -100) {
        scare = scare -1.5;
       
    }
    mvMatrix = mult(mvMatrix, translate(0.0, 0, scare, 0.0));
    mvMatrix = mult(mvMatrix, scalem(15, 15, 15, 0.0));    

    //mvMatrix = mult(mvMatrix, translate(-25.0, -21.65063509, -20.41241452));

    gl.uniformMatrix4fv( modelView, false, flatten(mvMatrix) );
    //gl.bindTexture(gl.TEXTURE_2D, texture[0]);
    //gl.drawArrays( gl.TRIANGLES, 877, points.length);
    if (Light_switch == false || ghost_move>4 ){
    for ( var i = 0 ; i < indexSphere; i+=3) {
        gl.bindTexture(gl.TEXTURE_2D, texture[6]);
        gl.drawArrays( gl.TRIANGLES, 984+i, 3 );
    }
}

    requestAnimFrame( render );
}

