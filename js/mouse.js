var canvas;
var gl;

window.onload = function() {
  var fragmentShader, vertexShader;
  var shaderProgram;
  var mouse;
  var startTime;
  var positionAttribute;
  var timeUniformLocation, mouseUniformLocation, resolutionUniformLocation;
  var verticesBuffer;
  var vertices;

  canvas = document.getElementById("canvas");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");

  if (!gl) {
    console.error('can not get context');
    return;
  }

  canvas.addEventListener('mousemove', function(e) {
    mouse = [e.offsetX, e.offsetY];
  });
  mouse = [0, 0];
  startTime = new Date().getTime();

  fragmentShader = getShader('shader-fs');
  vertexShader = getShader('shader-vs');
  shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    console.error('can not initialize shader program');
    return;
  }

  gl.useProgram(shaderProgram);
  positionAttribute = gl.getAttribLocation(shaderProgram, 'position');
  gl.enableVertexAttribArray(positionAttribute);

  timeUniformLocation = gl.getUniformLocation(shaderProgram, 'u_time');
  mouseUniformLocation = gl.getUniformLocation(shaderProgram, 'u_mouse');
  resolutionUniformLocation = gl.getUniformLocation(shaderProgram, 'u_resolution');

  verticesBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer);
  vertices = [
    1.0, 1.0, 0.0,
    -1.0, 1.0, 0.0,
    1.0, -1.0, 0.0,
    -1.0, -1.0, 0.0
  ];
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  render();

  function getShader(id) {
    var shaderScript, shader;

    shaderScript = document.getElementById(id);
    if(!shaderScript) {
      return null;
    }

    if (shaderScript.type == 'x-shader/x-fragment') {
      shader = gl.createShader(gl.FRAGMENT_SHADER);
    } else if (shaderScript.type == 'x-shader/x-vertex') {
      shader = gl.createShader(gl.VERTEX_SHADER);
    } else {
      return null;
    }

    gl.shaderSource(shader, shaderScript.text);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error('can not comple shader source');
      console.error(gl.getShaderInfoLog(shader));
      return null;
    }

    return shader;
  }

  function render() {
    var time, resolution;

    requestAnimationFrame(render);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    time = (new Date().getTime() - startTime);
    resolution = [canvas.width, canvas.height];
    gl.uniform1f(timeUniformLocation, time);
    gl.uniform2fv(mouseUniformLocation, mouse);
    gl.uniform2fv(resolutionUniformLocation, resolution);

    gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer);
    gl.vertexAttribPointer(verticesBuffer, 3, gl.FLOAT, false, 0, 0);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    gl.flush();
  }
}

window.onresize = function() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    gl.viewport(0, 0, canvas.width, canvas.height);
}
