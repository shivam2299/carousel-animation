import * as THREE from "three";
import { gsap } from "gsap";
// --------- INITIALIZING -----------
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  innerWidth / innerHeight,
  0.1,
  1000
);
camera.position.z = 2;
camera.position.y = 9;
const renderer = new THREE.WebGLRenderer();
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(devicePixelRatio);
document.body.appendChild(renderer.domElement);
renderer.setClearColor(0xeeeeee, 1);

// ------- ADDING LIGHTS FOR SHADOW IN PLANES -----------
const light = new THREE.DirectionalLight(0xffffff, 10);
const lightPosition = new THREE.Vector3(0, 12, 1);
light.position.set(lightPosition.x, lightPosition.y, lightPosition.z);
const ambientLight = new THREE.AmbientLight(0xffffff, 2);
scene.add(light);
scene.add(ambientLight);

const rayCaster = new THREE.Raycaster();
const group = new THREE.Group();
const bgImagesGroup = new THREE.Group();
function createCarouselItems() {
  // const startAngle = 0;
  // const endAngle = Math.PI * 2; // 360deg
  // const totalAngle = endAngle - startAngle;
  const radius = 9;
  const n = 13;
  const angleIncrement = (Math.PI * 2) / (n * 2); // equally divide by twice the number of items to create full circle
  let theta = Math.PI / 2; // 90deg
  let x = 0;
  let y = 0;

  for (let i = 0; i < n * 2; i++) {
    const planeGeometry = new THREE.PlaneGeometry(1.4, 2.0, 100, 100);
    let imgNumber = (i + 1) % n;
    if (imgNumber == 0) {
      imgNumber = n;
    }
    var texture = new THREE.TextureLoader().load(`/image-${imgNumber}.png`);
    texture.encoding = THREE.sRGBEncoding;
    texture.colorSpace = THREE.SRGBColorSpace;
    const planeMaterial = new THREE.MeshPhongMaterial({
      // color: "#ff0000",
      flatShading: true,
      map: texture,
    });
    // const planeMaterial = new THREE.ShaderMaterial({
    //   vertexShader: vertexShader,
    //   fragmentShader: fragmentShader,
    //   uniforms: {
    //     pointLightPosition: { value: lightPosition },
    //     pointLightColor: { value: lightColor },
    //     time: { value: 0.0 },
    //     scrollSpeed: { value: 0 },
    //     uTexture: { value: texture },
    //   },
    //   // map: texture,
    //   side: THREE.DoubleSide,
    // });
    const planeMesh = new THREE.Mesh(planeGeometry, planeMaterial);
    x = radius * Math.cos(theta);
    y = radius * Math.sin(theta);
    planeMesh.rotation.set(0, 0, theta - Math.PI / 2);
    planeMesh.position.set(x, y, 0);
    planeMesh.castShadow = true;
    // const theta = startAngle + i * angleIncrement;
    theta += angleIncrement;
    group.add(planeMesh);
  }
  scene.add(group);
}
let scrollSpeed = 0;
let targetRotationZ = 0;
let currentRotationZ = 0;
const rotationSpeed = 0.1;
var wheelDistance = function (evt) {
  if (!evt) evt = event;
  var w = evt.wheelDelta,
    d = evt.detail;
  if (d) {
    if (w) return (w / d / 40) * d > 0 ? 1 : -1; // Opera
    else return -d / 3; // Firefox;         TODO: do not /3 for OS X
  } else return w / 120; // IE/Safari/Chrome TODO: /3 for Chrome OS X
};
function addWheelEvent() {
  addEventListener("wheel", (event) => {
    // console.log("currentRotationZ initial", currentRotationZ);
    let delta = event.wheelDeltaY;
    console.log(
      "event.wheelDelta,event.detail",
      event.wheelDelta,
      event.detail
    );
    // delta = delta % 120 == 0 ? delta / 120 : delta % 3 == 0 ? delta / 3 : delta;
    console.log("delta", delta);
    const rotationAmount = delta / 1000; // Adjust rotation speed
    // console.log("rotationAmount", rotationAmount);
    scrollSpeed = rotationAmount * 100;
    // console.log("targetRotationZ initial", targetRotationZ);
    targetRotationZ -= rotationAmount;
    // console.log("targetRotationZ", targetRotationZ);
    currentRotationZ += (targetRotationZ - currentRotationZ) * rotationSpeed;
    // console.log("currentRotationZ", currentRotationZ);
    gsap.to(group.rotation, {
      z: group.rotation.z - rotationAmount,
      // ease: "sine.inOut",
    });

    // ---- CHANGE X POSITION OF BACKGROUND IMAGES ON SCROLL
    bgImagesGroup.children.forEach((e) => {
      let newX = e.position.x + rotationAmount * 10;
      if (newX <= -8 + e.position.z) {
        // If image goes out of view on -ve x reset it to end of +ve x
        newX = 9 - e.position.z;
        e.position.set(newX, e.position.y, e.position.z);
      } else if (newX >= 9 - e.position.z) {
        // If image goes out of view on +ve x reset it to end of -ve x
        newX = -10 + e.position.z;
        e.position.set(newX, e.position.y, e.position.z);
      } else gsap.to(e.position, { x: newX });
      // e.position.set(newX, e.position.y, e.position.z);
    });

    // group.rotation.z -= rotationAmount;
    // let index = Math.floor(group.rotation.z / angleIncrement) % n;

    // console.log("index", index);
    // document.querySelector("#img-caption").innerHTML =
    //   imageCaptions[Math.abs(index)];
  });
}
function createBGImages() {
  let minZ = 0,
    maxZ = -100000;
  for (let i = 0; i <= 70; i++) {
    let imgNumber = i % 10 == 0 ? 10 : i % 10;
    const texture = new THREE.TextureLoader().load(`bg-${imgNumber}.jpeg`);
    const z = Math.random() * -11.5;
    if (z < minZ) minZ = z;
    else if (z >= maxZ) maxZ = z;
    const geometry11 = new THREE.PlaneGeometry(1.2, 0.8, 16, 16);
    const material11 = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
    });
    const plane11 = new THREE.Mesh(geometry11, material11);
    plane11.position.set((Math.random() - 0.5) * 20, Math.random() * 10, z);
    bgImagesGroup.add(plane11);
  }

  // Change opacity of images based on the z value
  bgImagesGroup.children.forEach((e) => {
    let opacity = (e.position.z - minZ) / (maxZ - minZ);
    if (opacity < 0.1) opacity = 0.1;
    if (opacity >= 1) opacity = 0.7;
    e.material.opacity = opacity;
  });
  scene.add(bgImagesGroup);
}

const mouse = {
  x: undefined,
  y: undefined,
};
function addMouseEvent() {
  addEventListener("mousemove", (e) => {
    mouse.x = (e.clientX / innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / innerHeight) * 2 + 1;
  });
}
function handlepPlaneHover() {
  // Raycaster checks intersection on plane and apply hover effect on mouse cursor
  rayCaster.setFromCamera(mouse, camera);
  const intersects = rayCaster.intersectObject(group);
  const cursor = document.querySelector(".cursor");
  const arrow = document.querySelector(".arrow:first-of-type");
  const arrowRight = document.querySelector(".arrow:nth-of-type(2)");
  if (intersects.length > 0) {
    cursor.style.height = "75px";
    cursor.style.width = "75px";
    arrow.style.marginLeft = "10px";
    arrowRight.style.marginRight = "10px";
  } else {
    cursor.style.height = "63px";
    cursor.style.width = "63px";
    cursor.style.padding = "0px";
    arrow.style.marginLeft = "5px";
    arrowRight.style.marginRight = "5px";
  }
}

function carouselRotation(ts) {
  //------ FOR SHADER ------
  // group.children.forEach((e) => {
  //   const positions = e.geometry.attributes.position.array;
  //   for (let i = 2; i < positions.length; i += 3) {
  //     positions[i] = Math.sin((i % (30 * 5)) / 50 + ts / 1000) * 0.02;
  //   }
  //   e.geometry.attributes.position.needsUpdate = true;
  //   // e.material.uniforms.time.value += 0.005;
  //   // e.material.uniforms.scrollSpeed.value = Math.min(scrollSpeed, 1.0);
  // });
  // ------ ROTATE CAROUSEL GROUP BASED ON SCROLL AMOUNT ---------
  // currentRotationZ += (targetRotationZ - currentRotationZ) * rotationSpeed;
  // group.rotation.z = currentRotationZ;
  // ------- CREATE SINE WAVE ON CAROUSEL ITEMS ON SCROLL ----------
  // group.children.forEach((e) => {
  //   const positions = e.geometry.attributes.position.array;
  //   const numVertices = positions.length / 3;
  //   for (let i = 0; i < numVertices; i++) {
  //     const x = positions[i * 3];
  //     const y = positions[i * 3 + 1];
  //     const zIndex = i * 3 + 2;
  //     const flutter = Math.sin((x + y) * 3 + ts / 1000) * scrollSpeed * 0.02;
  //     positions[zIndex] = flutter;
  //   }
  //   e.geometry.attributes.position.needsUpdate = true;
  // });
}
function bgImageAnimation() {
  // ------- CONTINUOUSLY MOVE BACKGROUND IMAGES ON Y AXIS --------
  bgImagesGroup.children.forEach((e) => {
    let newY = e.position.y + 0.005;
    // If image moves out of view from top add back to bottom
    if (newY >= 10.8 - e.position.z) newY = 7 + e.position.z;
    e.position.set(e.position.x, newY, e.position.z);
  });
}
function animate(ts) {
  requestAnimationFrame(animate);
  carouselRotation(ts);
  bgImageAnimation();
  renderer.render(scene, camera);
  handlepPlaneHover();
}
createCarouselItems();
addWheelEvent();
createBGImages();
addMouseEvent();
animate(0);
