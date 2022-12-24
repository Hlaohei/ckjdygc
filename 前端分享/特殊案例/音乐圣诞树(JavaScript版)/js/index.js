/**
 * 音乐列表
 * 可自行添加不同音乐，页面会自动添加
 *
 * name: 音乐名称
 * url: 音乐文件链接，可以是网址，也可以是本地文件，写好对应的地址就行
 */
const musicList = [
  {
    name: "Snowflakes Falling Down",
    url: "https://files.freemusicarchive.org/storage-freemusicarchive-org/music/no_curator/Simon_Panrucker/Happy_Christmas_You_Guys/Simon_Panrucker_-_01_-_Snowflakes_Falling_Down.mp3",
  },
  {
    name: "Jingle Bell Swing",
    url: "https://files.freemusicarchive.org/storage-freemusicarchive-org/music/ccCommunity/Mark_Smeby/En_attendant_Nol/Mark_Smeby_-_07_-_Jingle_Bell_Swing.mp3",
  },
  {
    name: "This Christmas",
    url: "https://files.freemusicarchive.org/storage-freemusicarchive-org/music/no_curator/Dott/This_Christmas/Dott_-_01_-_This_Christmas.mp3",
  },
  {
    name: "No room at the inn",
    url: "https://files.freemusicarchive.org/storage-freemusicarchive-org/music/ccCommunity/TRG_Banks/TRG_Banks_Christmas_Album/TRG_Banks_-_12_-_No_room_at_the_inn.mp3",
  },
];
/**
 * 根据上面的音乐列表添加音乐选项
 */
const baseMusicListBox = document.querySelector("#base-music-list");
let fragment = document.createDocumentFragment();
musicList.forEach((item) => {
  let li = document.createElement("li");
  li.innerHTML = `<button class="btn" type="button">${item.name}</button>`;
  fragment.appendChild(li);
});
baseMusicListBox.appendChild(fragment);

/**
 * 自动填充文字部分
 */
let text = "Merry Christmas!<br>圣诞快乐";
/**
 * 获取 url 参数
 * @param {*} variable 传入 key
 * @returns 有值就返回值，没有就返回 false
 */
const getQueryVariable = (variable) => {
  let query = window.location.search.substring(1);
  let vars = query.split("&");
  for (let i = 0; i < vars.length; i++) {
    let pair = vars[i].split("=");
    if (pair[0] == variable) {
      return decodeURI(pair[1]);
    }
  }
  return false;
};
/**
 * 将 url 地址中的 t 参数放入文字显示区域
 */
let t = getQueryVariable("t");
if (t) {
  text = t;
}

/**
 * ---------------- 分割线 -----------------
 */
/**
 * 下面是圣诞树音乐动画代码
 * 简单修改了几处引用，其余代码均是网络大神的
 */
const { PI, sin, cos } = Math;
const TAU = 2 * PI;

const map = (value, sMin, sMax, dMin, dMax) => {
  return dMin + ((value - sMin) / (sMax - sMin)) * (dMax - dMin);
};

const range = (n, m = 0) =>
  Array(n)
    .fill(m)
    .map((i, j) => i + j);

const rand = (max, min = 0) => min + Math.random() * (max - min);
const randInt = (max, min = 0) => Math.floor(min + Math.random() * (max - min));
const randChoise = (arr) => arr[randInt(arr.length)];
const polar = (ang, r = 1) => [r * cos(ang), r * sin(ang)];

let scene, camera, renderer, analyser;
let step = 0;
const uniforms = {
  time: { type: "f", value: 0.0 },
  step: { type: "f", value: 0.0 },
};
const params = {
  exposure: 1,
  bloomStrength: 0.9,
  bloomThreshold: 0,
  bloomRadius: 0.5,
};
let composer;

const fftSize = 2048;
const totalPoints = 4000;

const listener = new THREE.AudioListener();

const audio = new THREE.Audio(listener);

document.querySelector("input").addEventListener("change", uploadAudio, false);

const buttons = document.querySelectorAll(".btn");
buttons.forEach((button, index) =>
  button.addEventListener("click", () => loadAudio(index))
);

function init() {
  const overlay = document.getElementById("overlay");
  overlay.remove();

  scene = new THREE.Scene();
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  // 原：只添加渲染动画到 body
  // document.body.appendChild(renderer.domElement);

  // 现：多添加一个文字元素到 body
  let fragmentDom = document.createDocumentFragment();
  fragmentDom.appendChild(renderer.domElement);
  let h1 = document.createElement("h1");
  h1.id = "sentence-box";
  h1.innerHTML = text || "";
  fragmentDom.appendChild(h1);
  document.body.appendChild(fragmentDom);

  camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    1,
    1000
  );
  camera.position.set(
    -0.09397456774197047,
    -2.5597086635726947,
    24.420789670889008
  );
  camera.rotation.set(
    0.10443543723052419,
    -0.003827152981119352,
    0.0004011488708739715
  );

  const format = renderer.capabilities.isWebGL2
    ? THREE.RedFormat
    : THREE.LuminanceFormat;

  uniforms.tAudioData = {
    value: new THREE.DataTexture(analyser.data, fftSize / 2, 1, format),
  };

  addPlane(scene, uniforms, 3000);
  addSnow(scene, uniforms);

  range(10).map((i) => {
    addTree(scene, uniforms, totalPoints, [20, 0, -20 * i]);
    addTree(scene, uniforms, totalPoints, [-20, 0, -20 * i]);
  });

  const renderScene = new THREE.RenderPass(scene, camera);

  const bloomPass = new THREE.UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    1.5,
    0.4,
    0.85
  );
  bloomPass.threshold = params.bloomThreshold;
  bloomPass.strength = params.bloomStrength;
  bloomPass.radius = params.bloomRadius;

  composer = new THREE.EffectComposer(renderer);
  composer.addPass(renderScene);
  composer.addPass(bloomPass);

  addListners(camera, renderer, composer);
  animate();
}

function animate(time) {
  analyser.getFrequencyData();
  uniforms.tAudioData.value.needsUpdate = true;
  step = (step + 1) % 1000;
  uniforms.time.value = time;
  uniforms.step.value = step;
  composer.render();
  requestAnimationFrame(animate);
}

function loadAudio(i) {
  document.getElementById("overlay").innerHTML =
    '<div class="text-loading">别着急，正在打开...</div>';

  // 原：音乐列表
  // const files = [
  // "https://files.freemusicarchive.org/storage-freemusicarchive-org/music/no_curator/Simon_Panrucker/Happy_Christmas_You_Guys/Simon_Panrucker_-_01_-_Snowflakes_Falling_Down.mp3",
  // "https://files.freemusicarchive.org/storage-freemusicarchive-org/music/no_curator/Dott/This_Christmas/Dott_-_01_-_This_Christmas.mp3",
  // "https://files.freemusicarchive.org/storage-freemusicarchive-org/music/ccCommunity/TRG_Banks/TRG_Banks_Christmas_Album/TRG_Banks_-_12_-_No_room_at_the_inn.mp3",
  // "https://files.freemusicarchive.org/storage-freemusicarchive-org/music/ccCommunity/Mark_Smeby/En_attendant_Nol/Mark_Smeby_-_07_-_Jingle_Bell_Swing.mp3",
  // ];
  // const file = files[i];

  // 现：在改为从最顶上音乐列表中获取
  const file = musicList[i].url;

  const loader = new THREE.AudioLoader();
  loader.load(file, function (buffer) {
    audio.setBuffer(buffer);
    audio.play();
    analyser = new THREE.AudioAnalyser(audio, fftSize);
    init();
  });
}

function uploadAudio(event) {
  document.getElementById("overlay").innerHTML =
    '<div class="text-loading">别着急，正在打开</div>';
  const files = event.target.files;
  const reader = new FileReader();

  reader.onload = function (file) {
    var arrayBuffer = file.target.result;

    listener.context.decodeAudioData(arrayBuffer, function (audioBuffer) {
      audio.setBuffer(audioBuffer);
      audio.play();
      analyser = new THREE.AudioAnalyser(audio, fftSize);
      init();
    });
  };

  reader.readAsArrayBuffer(files[0]);
}

function addTree(scene, uniforms, totalPoints, treePosition) {
  const vertexShader = `
  attribute float mIndex;
  varying vec3 vColor;
  varying float opacity;
  uniform sampler2D tAudioData;

  float norm(float value, float min, float max ){
      return (value - min) / (max - min);
  }
  float lerp(float norm, float min, float max){
  return (max - min) * norm + min;
  }

  float map(float value, float sourceMin, float sourceMax, float destMin, float destMax){
  return lerp(norm(value, sourceMin, sourceMax), destMin, destMax);
  }


  void main() {
      vColor = color;
      vec3 p = position;
      vec4 mvPosition = modelViewMatrix * vec4( p, 1.0 );
      float amplitude = texture2D( tAudioData, vec2( mIndex, 0.1 ) ).r;
      float amplitudeClamped = clamp(amplitude-0.4,0.0, 0.6 );
      float sizeMapped = map(amplitudeClamped, 0.0, 0.6, 1.0, 20.0);
      opacity = map(mvPosition.z , -200.0, 15.0, 0.0, 1.0);
      gl_PointSize = sizeMapped * ( 100.0 / -mvPosition.z );
      gl_Position = projectionMatrix * mvPosition;
  }
`;
  const fragmentShader = `
  varying vec3 vColor;
  varying float opacity;
  uniform sampler2D pointTexture;
  void main() {
      gl_FragColor = vec4( vColor, opacity );
      gl_FragColor = gl_FragColor * texture2D( pointTexture, gl_PointCoord ); 
  }
  `;
  const shaderMaterial = new THREE.ShaderMaterial({
    uniforms: {
      ...uniforms,
      pointTexture: {
        value: new THREE.TextureLoader().load(
          // NOTE: 链接会有路径问题，打不开的话记得修改
          // "././image/spark1.png"
          `https://assets.codepen.io/3685267/spark1.png`
        ),
      },
    },
    vertexShader,
    fragmentShader,
    blending: THREE.AdditiveBlending,
    depthTest: false,
    transparent: true,
    vertexColors: true,
  });

  const geometry = new THREE.BufferGeometry();
  const positions = [];
  const colors = [];
  const sizes = [];
  const phases = [];
  const mIndexs = [];

  const color = new THREE.Color();

  for (let i = 0; i < totalPoints; i++) {
    const t = Math.random();
    const y = map(t, 0, 1, -8, 10);
    const ang = map(t, 0, 1, 0, 6 * TAU) + (TAU / 2) * (i % 2);
    const [z, x] = polar(ang, map(t, 0, 1, 5, 0));

    const modifier = map(t, 0, 1, 1, 0);
    positions.push(x + rand(-0.3 * modifier, 0.3 * modifier));
    positions.push(y + rand(-0.3 * modifier, 0.3 * modifier));
    positions.push(z + rand(-0.3 * modifier, 0.3 * modifier));

    color.setHSL(map(i, 0, totalPoints, 1.0, 0.0), 1.0, 0.5);

    colors.push(color.r, color.g, color.b);
    phases.push(rand(1000));
    sizes.push(1);
    const mIndex = map(i, 0, totalPoints, 1.0, 0.0);
    mIndexs.push(mIndex);
  }

  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3).setUsage(
      THREE.DynamicDrawUsage
    )
  );
  geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
  geometry.setAttribute("size", new THREE.Float32BufferAttribute(sizes, 1));
  geometry.setAttribute("phase", new THREE.Float32BufferAttribute(phases, 1));
  geometry.setAttribute("mIndex", new THREE.Float32BufferAttribute(mIndexs, 1));

  const tree = new THREE.Points(geometry, shaderMaterial);

  const [px, py, pz] = treePosition;

  tree.position.x = px;
  tree.position.y = py;
  tree.position.z = pz;

  scene.add(tree);
}

function addSnow(scene, uniforms) {
  const vertexShader = `
  attribute float size;
  attribute float phase;
  attribute float phaseSecondary;

  varying vec3 vColor;
  varying float opacity;


  uniform float time;
  uniform float step;

  float norm(float value, float min, float max ){
      return (value - min) / (max - min);
  }
  float lerp(float norm, float min, float max){
      return (max - min) * norm + min;
  }

  float map(float value, float sourceMin, float sourceMax, float destMin, float destMax){
      return lerp(norm(value, sourceMin, sourceMax), destMin, destMax);
  }
  void main() {
      float t = time* 0.0006;

      vColor = color;

      vec3 p = position;

      p.y = map(mod(phase+step, 1000.0), 0.0, 1000.0, 25.0, -8.0);

      p.x += sin(t+phase);
      p.z += sin(t+phaseSecondary);

      opacity = map(p.z, -150.0, 15.0, 0.0, 1.0);

      vec4 mvPosition = modelViewMatrix * vec4( p, 1.0 );

      gl_PointSize = size * ( 100.0 / -mvPosition.z );

      gl_Position = projectionMatrix * mvPosition;

  }
  `;

  const fragmentShader = `
  uniform sampler2D pointTexture;
  varying vec3 vColor;
  varying float opacity;

  void main() {
      gl_FragColor = vec4( vColor, opacity );
      gl_FragColor = gl_FragColor * texture2D( pointTexture, gl_PointCoord ); 
  }
  `;
  function createSnowSet(sprite) {
    const totalPoints = 300;
    const shaderMaterial = new THREE.ShaderMaterial({
      uniforms: {
        ...uniforms,
        pointTexture: {
          value: new THREE.TextureLoader().load(sprite),
        },
      },
      vertexShader,
      fragmentShader,
      blending: THREE.AdditiveBlending,
      depthTest: false,
      transparent: true,
      vertexColors: true,
    });

    const geometry = new THREE.BufferGeometry();
    const positions = [];
    const colors = [];
    const sizes = [];
    const phases = [];
    const phaseSecondaries = [];

    const color = new THREE.Color();

    for (let i = 0; i < totalPoints; i++) {
      const [x, y, z] = [rand(25, -25), 0, rand(15, -150)];
      positions.push(x);
      positions.push(y);
      positions.push(z);

      color.set(randChoise(["#f1d4d4", "#f1f6f9", "#eeeeee", "#f1f1e8"]));

      colors.push(color.r, color.g, color.b);
      phases.push(rand(1000));
      phaseSecondaries.push(rand(1000));
      sizes.push(rand(4, 2));
    }

    geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(positions, 3)
    );
    geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
    geometry.setAttribute("size", new THREE.Float32BufferAttribute(sizes, 1));
    geometry.setAttribute("phase", new THREE.Float32BufferAttribute(phases, 1));
    geometry.setAttribute(
      "phaseSecondary",
      new THREE.Float32BufferAttribute(phaseSecondaries, 1)
    );

    const mesh = new THREE.Points(geometry, shaderMaterial);

    scene.add(mesh);
  }
  const sprites = [
    "https://assets.codepen.io/3685267/snowflake1.png",
    "https://assets.codepen.io/3685267/snowflake2.png",
    "https://assets.codepen.io/3685267/snowflake3.png",
    "https://assets.codepen.io/3685267/snowflake4.png",
    "https://assets.codepen.io/3685267/snowflake5.png",

    // NOTE: 链接会有路径问题，打不开的话记得修改
    // "./image/snowflake1.png",
    // "./image/snowflake2.png",
    // "./image/snowflake3.png",
    // "./image/snowflake4.png",
    // "./image/snowflake5.png",
  ];
  sprites.forEach((sprite) => {
    createSnowSet(sprite);
  });
}

function addPlane(scene, uniforms, totalPoints) {
  const vertexShader = `
  attribute float size;
  attribute vec3 customColor;
  varying vec3 vColor;

  void main() {
      vColor = customColor;
      vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
      gl_PointSize = size * ( 300.0 / -mvPosition.z );
      gl_Position = projectionMatrix * mvPosition;

  }
  `;
  const fragmentShader = `
  uniform vec3 color;
  uniform sampler2D pointTexture;
  varying vec3 vColor;

  void main() {
      gl_FragColor = vec4( vColor, 1.0 );
      gl_FragColor = gl_FragColor * texture2D( pointTexture, gl_PointCoord );

  }
  `;
  const shaderMaterial = new THREE.ShaderMaterial({
    uniforms: {
      ...uniforms,
      pointTexture: {
        value: new THREE.TextureLoader().load(
          // NOTE: 链接会有路径问题，打不开的话记得修改
          // "././image/spark1.png"
          `https://assets.codepen.io/3685267/spark1.png`
        ),
      },
    },
    vertexShader,
    fragmentShader,
    blending: THREE.AdditiveBlending,
    depthTest: false,
    transparent: true,
    vertexColors: true,
  });

  const geometry = new THREE.BufferGeometry();
  const positions = [];
  const colors = [];
  const sizes = [];

  const color = new THREE.Color();

  for (let i = 0; i < totalPoints; i++) {
    const [x, y, z] = [rand(-25, 25), 0, rand(-150, 15)];
    positions.push(x);
    positions.push(y);
    positions.push(z);

    color.set(randChoise(["#93abd3", "#f2f4c0", "#9ddfd3"]));

    colors.push(color.r, color.g, color.b);
    sizes.push(1);
  }

  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3).setUsage(
      THREE.DynamicDrawUsage
    )
  );
  geometry.setAttribute(
    "customColor",
    new THREE.Float32BufferAttribute(colors, 3)
  );
  geometry.setAttribute("size", new THREE.Float32BufferAttribute(sizes, 1));

  const plane = new THREE.Points(geometry, shaderMaterial);

  plane.position.y = -8;
  scene.add(plane);
}

function addListners(camera, renderer, composer) {
  // document.addEventListener("keydown", (e) => {
  // const { x, y, z } = camera.position;
  // console.log(`camera.position.set(${x},${y},${z})`);
  // const { x: a, y: b, z: c } = camera.rotation;
  // console.log(`camera.rotation.set(${a},${b},${c})`);
  // });

  window.addEventListener(
    "resize",
    () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();

      renderer.setSize(width, height);
      composer.setSize(width, height);
    },
    false
  );
}
