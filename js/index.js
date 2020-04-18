let canvas;
let gl;

window.onload = function() {
  let fragmentShader, vertexShader;
  let shaderProgram;
  let mouse;
  let startTime;
  let positionAttribute;
  let timeUniformLocation;
  let mouseUniformLocation;
  // let resolutionUniformLocation;
  let verticesBuffer;
  let vertices;

  canvas = document.getElementById("canvas");//htmlのcanvas要素を取得
  // canvas.width = window.innerWidth;
  // canvas.height = window.innerHeight;
  gl = canvas.getContext("webgl");//WebGL APIを使う準備！

  canvas.addEventListener('mousemove', function(e) {
    mouse = [e.offsetX, e.offsetY];
  });
  mouse = [0, 0];
  startTime = new Date().getTime();

  fragmentShader = getShader('shader-fs');
  vertexShader = getShader('shader-vs');
  //この時点でコンパイルされたシェーダーを変数に格納できた。

  shaderProgram = gl.createProgram();//頂点シェーダーとフラグメントシェーダーをつなぐ仲介役
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);//頂点とフラグメントシェーダをリンクした。

  gl.useProgram(shaderProgram);//作成したシェーダーをセットする。

  //GLSLにデータを与える。今回は'position'を与える。
  positionAttribute = gl.getAttribLocation(shaderProgram, 'position');
  gl.enableVertexAttribArray(positionAttribute); // attribute属性を有効にする

  timeUniformLocation = gl.getUniformLocation(shaderProgram, 'u_time');
  mouseUniformLocation = gl.getUniformLocation(shaderProgram, 'u_mouse');
  // resolutionUniformLocation = gl.getUniformLocation(shaderProgram, 'u_resolution');

  verticesBuffer = gl.createBuffer();//頂点の箱(VBO)を作成する。
  gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer);// verticesBufferをARRAY_BUFFERに結び付ける
  vertices = [//頂点データ。(x,y,z)のセットが四つ。
    1.0, 1.0, 0.0,
    -1.0, 1.0, 0.0,
    1.0, -1.0, 0.0,
    -1.0, -1.0, 0.0
  ];
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
  //32ビット数値配列を 作成して、それにpositionsの内容をコピー。
  //GPUにverticesBufferをUP。
  //gl.STATIC_DRAWはデータの扱い方。「あまり更新しない」の意。
  //要は頂点をバッファーにセット。

  gl.clearColor(0.0, 0.0, 0.0, 0.0);//canvasをクリアした。
  render();//レンダリング開始！

  function getShader(id) {//シェーダーを作る関数
    let shaderScript;
    let shader;

    shaderScript = document.getElementById(id);

    if (shaderScript.type == 'x-shader/x-fragment') {//フラグメントシェーダーだったら
      shader = gl.createShader(gl.FRAGMENT_SHADER);
    } else if (shaderScript.type == 'x-shader/x-vertex') {//頂点シェーダーだったら
      shader = gl.createShader(gl.VERTEX_SHADER);
    }

    gl.shaderSource(shader, shaderScript.text);//GPUにシェーダーをアップロードする。
    gl.compileShader(shader);//シェーダーをコンパイルする

    return shader;
  }

  function render() {//60FPSで実行
    let time;
    // let resolution;

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);//canvasを初期化

    time = (new Date().getTime() - startTime) / 1000;
    // resolution = [canvas.width, canvas.height];
    gl.uniform1f(timeUniformLocation, time);
    gl.uniform2fv(mouseUniformLocation, mouse);
    // gl.uniform2fv(resolutionUniformLocation, resolution);

    gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer);// positionBufferをARRAY_BUFFERに結び付ける
    gl.vertexAttribPointer(verticesBuffer, 3, gl.FLOAT, false, 0, 0);//attribute属性を登録。
    //「3」はattributeの要素数(xyz)、他はデータ型など渡してるけどいまはスルーでいい。
    //頂点シェーダに記述しているattributeをVBOのデータに接続する
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    //モデルがバッファ上に描画。画面上には出ていない。
    //gl.TRIANGLE_STRIPは三角形を描画。詳しくは省くけど、頂点四つで四角形を描画。
    gl.flush();//ここで初めて描画される。

    requestAnimationFrame(render);
  }
}
