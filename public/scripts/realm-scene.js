/* =========================================================================
   The Astrolabe Reliquary
   A brass astrolabe suspended over a sealed customs letter. The scene should
   read as a mounted archive object, not as a large ring over a flat block.
   ========================================================================= */
(function () {
  const root = document.querySelector('[data-realm-scene]');
  const canvas = document.getElementById('realm-scene');
  const THREE = window.THREE;
  if (!root || !canvas || !THREE) return;

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  } catch (err) {
    return;
  }

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
  camera.position.set(0, 0.15, 7.4);
  camera.lookAt(0, 0.05, 0);

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.08;

  const brass = new THREE.MeshStandardMaterial({
    color: 0xb89146,
    roughness: 0.34,
    metalness: 0.86
  });
  const brassDark = new THREE.MeshStandardMaterial({
    color: 0x6f542b,
    roughness: 0.48,
    metalness: 0.78
  });
  const brassLine = new THREE.MeshStandardMaterial({
    color: 0xd2ad61,
    roughness: 0.38,
    metalness: 0.72
  });
  const cobaltGlass = new THREE.MeshPhysicalMaterial({
    color: 0x244965,
    roughness: 0.12,
    metalness: 0.02,
    transparent: true,
    opacity: 0.78,
    clearcoat: 0.65
  });
  const parchment = new THREE.MeshStandardMaterial({
    color: 0xcab98e,
    roughness: 0.88,
    metalness: 0
  });
  const ink = new THREE.MeshBasicMaterial({
    color: 0x47371f,
    transparent: true,
    opacity: 0.62
  });
  const wax = new THREE.MeshStandardMaterial({
    color: 0x7d1b18,
    roughness: 0.52,
    metalness: 0.03
  });
  const shadow = new THREE.MeshBasicMaterial({
    color: 0x020304,
    transparent: true,
    opacity: 0.26,
    depthWrite: false
  });

  const artifact = new THREE.Group();
  artifact.position.set(0, 0.04, 0);
  scene.add(artifact);

  // A quiet parchment base, smaller and angled so it supports the instrument.
  const letter = new THREE.Group();
  letter.position.set(0.18, -0.78, -0.58);
  letter.rotation.z = -0.035;
  artifact.add(letter);

  const letterFace = new THREE.Mesh(new THREE.BoxGeometry(3.1, 1.46, 0.045), parchment);
  letterFace.position.set(0, 0, 0);
  letter.add(letterFace);

  const letterShadow = new THREE.Mesh(new THREE.PlaneGeometry(3.18, 1.54), shadow);
  letterShadow.position.set(0.08, -0.08, -0.05);
  letter.add(letterShadow);

  for (let i = 0; i < 7; i++) {
    const width = i % 3 === 0 ? 1.08 : 0.62;
    const line = new THREE.Mesh(new THREE.BoxGeometry(width, 0.012, 0.012), ink);
    line.position.set(-0.86 + (i % 2) * 0.08, 0.46 - i * 0.15, 0.045);
    letter.add(line);
  }

  const redMark = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.035, 0.014), wax);
  redMark.position.set(0.96, 0.18, 0.052);
  redMark.rotation.z = -0.28;
  letter.add(redMark);

  const seal = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.24, 0.09, 36), wax);
  seal.position.set(1.04, -0.35, 0.11);
  seal.rotation.x = Math.PI / 2;
  letter.add(seal);

  const sealStamp = new THREE.Mesh(new THREE.TorusGeometry(0.105, 0.01, 8, 36), brassDark);
  sealStamp.position.set(1.04, -0.35, 0.162);
  letter.add(sealStamp);

  // The instrument faces the camera, with a small tilt for depth.
  const astrolabe = new THREE.Group();
  astrolabe.position.set(-0.02, 0.34, 0.42);
  astrolabe.rotation.set(-0.08, 0.12, -0.08);
  artifact.add(astrolabe);

  const backShadow = new THREE.Mesh(new THREE.CircleGeometry(1.55, 96), shadow);
  backShadow.position.set(0.08, -0.1, -0.13);
  backShadow.scale.set(1.05, 0.95, 1);
  astrolabe.add(backShadow);

  const outer = new THREE.Mesh(new THREE.TorusGeometry(1.28, 0.055, 18, 128), brass);
  astrolabe.add(outer);

  const inner = new THREE.Mesh(new THREE.TorusGeometry(1.04, 0.028, 12, 96), brassDark);
  inner.position.z = 0.03;
  astrolabe.add(inner);

  const plate = new THREE.Mesh(new THREE.CircleGeometry(0.98, 96), cobaltGlass);
  plate.position.z = -0.02;
  astrolabe.add(plate);

  for (let i = 0; i < 48; i++) {
    const angle = (i / 48) * Math.PI * 2;
    const major = i % 6 === 0;
    const tick = new THREE.Mesh(
      new THREE.BoxGeometry(major ? 0.018 : 0.011, major ? 0.18 : 0.105, 0.018),
      major ? brassLine : brassDark
    );
    tick.position.set(Math.cos(angle) * 1.18, Math.sin(angle) * 1.18, 0.07);
    tick.rotation.z = angle;
    astrolabe.add(tick);
  }

  const rete = new THREE.Group();
  rete.position.z = 0.11;
  astrolabe.add(rete);

  const reteRing = new THREE.Mesh(new THREE.TorusGeometry(0.74, 0.018, 10, 84), brassLine);
  rete.add(reteRing);

  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2 + 0.18;
    const spoke = new THREE.Mesh(new THREE.BoxGeometry(1.35, 0.018, 0.018), brass);
    spoke.rotation.z = angle;
    rete.add(spoke);
  }

  const rule = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.032, 0.032), brassLine);
  rule.rotation.z = -0.34;
  rete.add(rule);

  const pointer = new THREE.Mesh(new THREE.ConeGeometry(0.075, 0.2, 4), brassLine);
  pointer.position.set(0.91 * Math.cos(-0.34), 0.91 * Math.sin(-0.34), 0.01);
  pointer.rotation.z = -0.34 - Math.PI / 2;
  rete.add(pointer);

  const pivot = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.075, 0.08, 32), brassDark);
  pivot.rotation.x = Math.PI / 2;
  pivot.position.z = 0.17;
  astrolabe.add(pivot);

  const bail = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.022, 10, 42), brass);
  bail.position.set(0, 1.43, 0.04);
  astrolabe.add(bail);

  const bar = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.045, 0.035), brassDark);
  bar.position.set(0, 1.25, 0.05);
  astrolabe.add(bar);

  const dustCount = 80;
  const dustPositions = new Float32Array(dustCount * 3);
  const dustData = [];
  for (let i = 0; i < dustCount; i++) {
    dustPositions[i * 3] = -2.1 + Math.random() * 4.2;
    dustPositions[i * 3 + 1] = -1.75 + Math.random() * 3.55;
    dustPositions[i * 3 + 2] = -0.35 + Math.random() * 0.9;
    dustData.push({
      x: dustPositions[i * 3],
      y: dustPositions[i * 3 + 1],
      speed: 0.04 + Math.random() * 0.11,
      phase: Math.random() * Math.PI * 2
    });
  }
  const dustGeometry = new THREE.BufferGeometry();
  dustGeometry.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));
  const dust = new THREE.Points(
    dustGeometry,
    new THREE.PointsMaterial({
      color: 0xd2ad61,
      size: 0.022,
      transparent: true,
      opacity: 0.58,
      depthWrite: false
    })
  );
  scene.add(dust);

  scene.add(new THREE.AmbientLight(0xe8dec5, 0.42));

  const key = new THREE.PointLight(0xf2d49a, 2.6, 12);
  key.position.set(-2.4, 2.6, 3.2);
  scene.add(key);

  const fill = new THREE.PointLight(0x315b7d, 0.72, 10);
  fill.position.set(2.4, 0.8, 2.6);
  scene.add(fill);

  const ember = new THREE.PointLight(0x983231, 0.5, 5);
  ember.position.set(1.25, -1.0, 2.0);
  scene.add(ember);

  const target = { rx: 0, ry: 0 };
  const current = { rx: 0, ry: 0 };
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  root.addEventListener('pointermove', function (event) {
    const rect = root.getBoundingClientRect();
    const nx = (event.clientX - rect.left) / rect.width - 0.5;
    const ny = (event.clientY - rect.top) / rect.height - 0.5;
    target.ry = nx * 0.16;
    target.rx = -ny * 0.10;
  });

  root.addEventListener('pointerleave', function () {
    target.rx = 0;
    target.ry = 0;
  });

  function resize() {
    const width = root.clientWidth || 1;
    const height = root.clientHeight || 1;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
  }

  if ('ResizeObserver' in window) {
    new ResizeObserver(resize).observe(root);
  } else {
    window.addEventListener('resize', resize);
  }
  resize();

  function render(time) {
    const t = time * 0.001;

    current.rx += (target.rx - current.rx) * 0.055;
    current.ry += (target.ry - current.ry) * 0.055;

    artifact.rotation.x = current.rx;
    artifact.rotation.y = current.ry;
    artifact.position.y = 0.03 + Math.sin(t * 0.55) * 0.035;

    rete.rotation.z = -t * 0.17;
    rule.rotation.z = -0.34 + Math.sin(t * 0.5) * 0.06;
    key.intensity = 2.55 + Math.sin(t * 5.3) * 0.08 + Math.sin(t * 11.7) * 0.04;

    const positions = dust.geometry.attributes.position.array;
    for (let i = 0; i < dustCount; i++) {
      const idx = i * 3;
      const item = dustData[i];
      positions[idx] = item.x + Math.sin(t * 0.35 + item.phase) * 0.035;
      positions[idx + 1] += item.speed * 0.004;
      if (positions[idx + 1] > 1.8) positions[idx + 1] = -1.75;
    }
    dust.geometry.attributes.position.needsUpdate = true;

    renderer.render(scene, camera);
    root.classList.add('is-ready');

    if (!reduceMotion) requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
})();
