// 引入 three.js
// import * as THREE from "https://unpkg.com/three@0.151.3/build/three.module.js";
import * as THREE from "three";
// 引入控制器
import { OrbitControls } from "three/addons/examples/jsm/controls/OrbitControls.js";
// 引入模型加载器
import { GLTFLoader } from "three/addons/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/addons/examples/jsm/loaders/DRACOLoader.js";

// 上来先记录一下显示区域的宽高，方便下面用
let windowHalfX = window.innerWidth / 2;
let windowHalfY = window.innerHeight / 2;

/**
 * 初始化场景
 */
const scene = new THREE.Scene();
scene.position.set(0, -1.5, 0);
/**
 * 初始化相机
 */
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, 2, 6);
camera.aspect = window.innerWidth / window.innerHeight;
camera.updateProjectionMatrix();

/**
 * 初始化渲染器
 */
const renderer = new THREE.WebGLRenderer({
  // 设置 抗锯齿
  antialias: true,
  alpha: true,
});
renderer.setSize(window.innerWidth, window.innerHeight);
// 设置 允许阴影
renderer.shadowMap.enabled = true;
// 设置 物理光照
renderer.physicallyCorrectLights = true;
// 设置 色调映射
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.5;
// 设置 像素比率
renderer.setPixelRatio(window.devicePixelRatio);
// 把渲染器画面直接添加到 body 上
document.body.appendChild(renderer.domElement);

/**
 * 监听屏幕的大小改变，修改渲染器的宽高，和相机的比例
 */
window.addEventListener("resize", () => {
  windowHalfX = window.innerWidth / 2;
  windowHalfY = window.innerHeight / 2;

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
});

/**
 * 底座 材质
 */
const foundationMaterial = new THREE.MeshPhysicalMaterial({
  color: "#4c4c4c", // 基础色
  metalness: 1, // 金属度
  roughness: 0.5, // 粗糙度
  clearcoat: 1, // 清漆
  clearcoatRoughness: 0, // 清漆粗糙度
});
/**
 * 光环 材质
 */
const lightMaterial = new THREE.MeshPhysicalMaterial({
  color: "#ffffff", // 基础色
  emissive: "#ffffff", // 自发光
  emissiveIntensity: 10, // 发射强度
});

/**
 * 初始化 模型加载器 loader
 */
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath(
  "https://unpkg.com/three@0.151.3/examples/jsm/libs/draco/"
); // 官方文件
const gltfLoader = new GLTFLoader();
gltfLoader.setDRACOLoader(dracoLoader);

// 模型文件位置
const glbUrl =
  "https://laoheiwan.gitee.io/ckjdygc/前端分享/特殊案例/3Dlogo(three.js)/model/3Dlogo.glb";
// const glbUrl = "../model/3Dlogo.glb";

// 加载准备好的 模型文件
gltfLoader.load(glbUrl, (gltf) => {
  const model = gltf.scene;
  console.log(model);

  // 拿到模型内的所有网格内容，也就是独立的小模型
  model.traverse((child) => {
    if (child.isMesh) {
      // 可以看到每个部分的名字
      // console.log(child.name);
    }

    // 分别给需要的部分设置不同材质
    if (child.isMesh && child.name.includes("光环")) {
      // 给光环设置定义好的自发光材质
      child.material = lightMaterial;
    }
    if (child.isMesh && child.name.includes("底座")) {
      // 底座设置对应材质
      child.material = foundationMaterial;
    }
  });
  // 把整体模型添加到场景中
  scene.add(model);
});

/**
 * 添加 主光，照亮模型左侧
 */
const mainLight = new THREE.PointLight(0xffffff, 500);
mainLight.position.set(-6, 8, 6);
mainLight.castShadow = true;
scene.add(mainLight);
// 临时查看灯光位置等关系
// scene.add(new THREE.PointLightHelper(mainLight, 1));
/**
 * 辅光，照亮右侧
 */
const fillInLight = new THREE.PointLight(0xffffff, 100);
fillInLight.position.set(6, 8, 2);
fillInLight.castShadow = true;
scene.add(fillInLight);
// scene.add(new THREE.PointLightHelper(fillInLight, 1));

/**
 * 坐标系，方便观察
 */
// const axesHelper = new THREE.AxesHelper(5);
// scene.add(axesHelper);

/**
 * 控制器，用作鼠标拖动旋转，方便查看
 */
// const controls = new OrbitControls(camera, renderer.domElement);
// controls.enableDamping = true;

/**
 * 鼠标移动事件，鼠标移动时场景相机更着移动，具体值范围微调
 */
let mouseX = 0;
let mouseY = 0;
let speed = 0.05;
function onMouseMove(event) {
  mouseX = (event.clientX - windowHalfX) * 0.004;
  mouseY = (event.clientY - windowHalfY) * 0.002;
}
window.addEventListener("mousemove", onMouseMove);

/**
 * 渲染 连续更新渲染器、相机位置等
 */
function render() {
  camera.position.x += (mouseX - camera.position.x) * speed;
  camera.position.y += (-mouseY - camera.position.y) * speed;
  camera.lookAt(0, 0, 0);

  // 控制器更新
  // controls.update();

  renderer.render(scene, camera);
  // 相当于浏览器渲染每帧动画时都调用渲染更新
  requestAnimationFrame(render);
}
// 开启渲染
render();
