// --- 1) Setup básico ---
const container = document.getElementById('canvas-container');
const scene     = new THREE.Scene();
const camera    = new THREE.PerspectiveCamera(
  45,
  1,    // provisional, se ajusta luego
  0.1,
  100
);
camera.position.set(0, 1.5, 3);

// --- 2) Renderer ---
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
container.appendChild(renderer.domElement);

// --- 3) Ajustar tamaño al contenedor ---
function fitRendererToContainer() {
  const w = container.clientWidth;
  const h = container.clientHeight;
  renderer.setSize(w, h);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}
fitRendererToContainer();
window.addEventListener('resize', fitRendererToContainer);

// --- 4) Luces ---
scene.add(new THREE.AmbientLight(0xffffff, 0.5));
const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
dirLight.position.set(5, 10, 7);
scene.add(dirLight);

// --- 5) OrbitControls ---
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// --- 6) Carga de modelo GLB ---
const loader = new THREE.GLTFLoader();
loader.load(
  'male_head_base_mesh.glb',
  gltf => {
    console.log('✅ GLB cargado:', gltf);
    const model = gltf.scene;
    model.scale.set(3.5, 3.5, 3.5);
    model.position.set(0, -2.8, 1.3);
    scene.add(model);
  },
  xhr => {
    const pct = ((xhr.loaded / xhr.total) * 100).toFixed(1);
    console.log(`⚙️ Progreso GLB: ${pct}%`);
  },
  err => {
    console.error('❌ Error al cargar GLB:', err);
  }
);

// --- 7) Puntos de referencia 10-20 ---
const refPositions = {
  Nasion: { x: 0,   y: -0.4, z:  1.05 },
  Vertex: { x: 0,   y:  0.65, z: 0    },
  Inion:  { x: 0,   y: -0.4, z: -1.05 },
  EarL:   { x: -0.8,y: -0.4, z: 0    },
  EarR:   { x: 0.8, y: -0.4, z: -0.1 }
};
const sphereGeo = new THREE.SphereGeometry(0.04, 16, 16);
const redMat    = new THREE.MeshPhongMaterial({ color: 0xff0000 });

for (let key in refPositions) {
  const p      = refPositions[key];
  const marker = new THREE.Mesh(sphereGeo, redMat);
  marker.position.set(p.x, p.y, p.z);
  scene.add(marker);

  const sprite = makeTextSprite(key);
  sprite.position.set(p.x * 1.1, p.y * 1.1, p.z * 1.1);
  scene.add(sprite);
}

function makeTextSprite(message) {
  const canvas = document.createElement('canvas');
  const ctx    = canvas.getContext('2d');
  ctx.font     = '24px Arial';
  ctx.fillStyle= 'black';
  ctx.fillText(message, 0, 24);
  const tex    = new THREE.CanvasTexture(canvas);
  return new THREE.Sprite(
    new THREE.SpriteMaterial({ map: tex, transparent: true })
  );
}

// --- 8) Círculos de medición ---
const torusGeo = new THREE.TorusGeometry(1, 0.05, 16, 100);

// Anillo verde
const ring1 = new THREE.Mesh(
  torusGeo,
  new THREE.MeshBasicMaterial({ color: 0x00cc00, opacity: 0.6, transparent: true })
);
ring1.rotation.x = Math.PI / 2;
ring1.position.set(0, -0.4, 0);
scene.add(ring1);

// Anillo azul
const ring2 = new THREE.Mesh(
  torusGeo,
  new THREE.MeshBasicMaterial({ color: 0x0000ff, opacity: 0.6, transparent: true })
);
ring2.rotation.y = Math.PI / 2;
ring2.position.set(0, -0.4, -0.01);
scene.add(ring2);

// Anillo rojo
const ring3 = new THREE.Mesh(
  torusGeo,
  new THREE.MeshBasicMaterial({ color: 0xff0000, opacity: 0.6, transparent: true })
);
ring3.rotation.y = Math.PI;
ring3.position.set(0, -0.4, -0.01);
scene.add(ring3);

// --- 9) Animación ---
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
animate();
