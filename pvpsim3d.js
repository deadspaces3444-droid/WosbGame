/* ============================================================
   pvpsim3d.js — 3D-визуализация попадания
   Мульти-CDN загрузка Three.js + процедурная модель корабля.
============================================================ */

const ZONE_COLORS = {
    bow:            0x0ea5e9,
    stern:          0x0ea5e9,
    port:           0x8b5cf6,
    starboard:      0x8b5cf6,
    superstructure: 0xf59e0b,
    core:           0xdc2626
};

const COL = {
    hull:     0x2a1e12,
    deck:     0x6b4f2a,
    mast:     0x3d2a17,
    sail:     0xdcd0b3,
    cannon:   0x1a1a1a,
    trim:     0xc9a227,
    sea:      0x0a1626
};

/* --- Мульти-CDN загрузка Three.js + OrbitControls --- */
const CDN_CANDIDATES = [
    {
        name: 'esm.sh',
        three: 'https://esm.sh/three@0.160.0',
        orbit: 'https://esm.sh/three@0.160.0/examples/jsm/controls/OrbitControls.js'
    },
    {
        name: 'unpkg',
        three: 'https://unpkg.com/three@0.160.0/build/three.module.js',
        orbit: 'https://unpkg.com/three@0.160.0/examples/jsm/controls/OrbitControls.js'
    },
    {
        name: 'jsdelivr',
        three: 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js',
        orbit: 'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/controls/OrbitControls.js'
    },
    {
        name: 'cdnjs',
        three: 'https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js',
        orbit: null
    }
];

async function loadThree() {
    let lastErr = null;
    for (const cdn of CDN_CANDIDATES) {
        try {
            console.log('[pvpsim3d] пробую CDN:', cdn.name);
            const THREE = await import(/* @vite-ignore */ cdn.three);
            let OrbitControls = null;
            if (cdn.orbit) {
                try {
                    const mod = await import(/* @vite-ignore */ cdn.orbit);
                    OrbitControls = mod.OrbitControls || null;
                } catch (e) {
                    console.warn('[pvpsim3d] OrbitControls не загрузились с', cdn.name, e.message);
                }
            }
            console.log('[pvpsim3d] ✓ Three.js загружен с', cdn.name);
            return { THREE, OrbitControls, cdn: cdn.name };
        } catch (e) {
            console.warn('[pvpsim3d] CDN', cdn.name, 'не сработал:', e.message);
            lastErr = e;
        }
    }
    throw new Error('Все CDN недоступны. Последняя ошибка: ' + (lastErr?.message || '—'));
}

export async function initPvpSim3D(container, opts = {}) {
    if (!container) throw new Error('initPvpSim3D: нет контейнера');

    const { THREE, OrbitControls, cdn } = await loadThree();

    /* --- СЦЕНА --- */
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050810);
    scene.fog = new THREE.Fog(0x050810, 20, 45);

    const W = container.clientWidth  || 800;
    const H = container.clientHeight || 420;

    const camera = new THREE.PerspectiveCamera(38, W / H, 0.1, 200);
    camera.position.set(6.5, 5.2, 8.5);
    camera.lookAt(0, 0.4, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    if (THREE.PCFSoftShadowMap) renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    if (THREE.ACESFilmicToneMapping) {
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.05;
    }
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.borderRadius = '12px';
    renderer.domElement.style.width  = '100%';
    renderer.domElement.style.height = '100%';

    /* --- СВЕТ --- */
    scene.add(new THREE.HemisphereLight(0x8ea8c8, 0x1a120a, 0.55));

    const key = new THREE.DirectionalLight(0xffe0b0, 1.6);
    key.position.set(6, 9, 6);
    key.castShadow = true;
    if (key.shadow) {
        key.shadow.mapSize.set(1024, 1024);
        key.shadow.camera.left = -8; key.shadow.camera.right = 8;
        key.shadow.camera.top  =  8; key.shadow.camera.bottom = -8;
    }
    scene.add(key);

    const rim = new THREE.DirectionalLight(0x4a7ec8, 0.6);
    rim.position.set(-8, 4, -6);
    scene.add(rim);

    /* --- МОРЕ + СЕТКА --- */
    const sea = new THREE.Mesh(
        new THREE.PlaneGeometry(60, 60),
        new THREE.MeshStandardMaterial({ color: COL.sea, roughness: 0.35, metalness: 0.15 })
    );
    sea.rotation.x = -Math.PI / 2;
    sea.position.y = -1.35;
    sea.receiveShadow = true;
    scene.add(sea);

    if (THREE.GridHelper) {
        const grid = new THREE.GridHelper(30, 30, 0x1a3050, 0x0e1e34);
        grid.position.y = -1.34;
        if (grid.material) { grid.material.transparent = true; grid.material.opacity = 0.35; }
        scene.add(grid);
    }

    /* --- КОРПУС --- */
    const shipGroup = new THREE.Group();
    scene.add(shipGroup);

    const hullShape = new THREE.Shape();
    hullShape.moveTo(-2.20,  0.00);
    hullShape.lineTo(-1.90,  0.55);
    hullShape.lineTo( 1.40,  0.62);
    hullShape.lineTo( 2.10,  0.30);
    hullShape.lineTo( 2.35,  0.00);
    hullShape.lineTo( 2.10, -0.30);
    hullShape.lineTo( 1.40, -0.62);
    hullShape.lineTo(-1.90, -0.55);
    hullShape.closePath();

    const HULL_DEPTH = 0.75;
    const hullGeo = new THREE.ExtrudeGeometry(hullShape, {
        depth: HULL_DEPTH,
        bevelEnabled: true,
        bevelThickness: 0.05,
        bevelSize: 0.06,
        bevelSegments: 3,
        curveSegments: 4
    });
    hullGeo.rotateX(-Math.PI / 2);
    hullGeo.translate(0, -0.05, 0);

    const hullMat = new THREE.MeshStandardMaterial({
        color: COL.hull, roughness: 0.85, metalness: 0.05
    });
    const hull = new THREE.Mesh(hullGeo, hullMat);
    hull.castShadow = true;
    hull.receiveShadow = true;
    shipGroup.add(hull);

    const deckGeo = new THREE.ShapeGeometry(hullShape);
    deckGeo.rotateX(-Math.PI / 2);
    deckGeo.translate(0, HULL_DEPTH - 0.05, 0);
    const deck = new THREE.Mesh(deckGeo, new THREE.MeshStandardMaterial({
        color: COL.deck, roughness: 0.9, metalness: 0.02
    }));
    deck.receiveShadow = true;
    shipGroup.add(deck);

    const waterline = new THREE.Mesh(
        new THREE.BoxGeometry(4.30, 0.045, 1.35),
        new THREE.MeshStandardMaterial({ color: COL.trim, metalness: 0.7, roughness: 0.35 })
    );
    waterline.position.y = 0.02;
    shipGroup.add(waterline);

    /* --- ЗОНЫ --- */
    const zoneMeshes = {};
    function addZone(name, mesh) {
        mesh.userData.zone = name;
        const m = mesh.material;
        m.transparent = true;
        m.opacity = 0.32;
        m.depthWrite = false;
        m.emissive = new THREE.Color(ZONE_COLORS[name]);
        m.emissiveIntensity = 0.35;
        shipGroup.add(mesh);
        zoneMeshes[name] = mesh;
    }

    const bowGeo = new THREE.ConeGeometry(0.62, 1.1, 4, 1, false);
    bowGeo.rotateZ(-Math.PI / 2);
    bowGeo.rotateY(Math.PI / 4);
    const bowMesh = new THREE.Mesh(bowGeo, new THREE.MeshStandardMaterial({ color: ZONE_COLORS.bow }));
    bowMesh.position.set(1.75, 0.35, 0);
    addZone('bow', bowMesh);

    const sternGeo = new THREE.ConeGeometry(0.55, 0.9, 4, 1, false);
    sternGeo.rotateZ(Math.PI / 2);
    sternGeo.rotateY(Math.PI / 4);
    const sternMesh = new THREE.Mesh(sternGeo, new THREE.MeshStandardMaterial({ color: ZONE_COLORS.stern }));
    sternMesh.position.set(-1.95, 0.35, 0);
    addZone('stern', sternMesh);

    const portMesh = new THREE.Mesh(
        new THREE.BoxGeometry(2.5, 0.55, 0.14),
        new THREE.MeshStandardMaterial({ color: ZONE_COLORS.port })
    );
    portMesh.position.set(-0.2, 0.42, -0.68);
    addZone('port', portMesh);

    const stbMesh = new THREE.Mesh(
        new THREE.BoxGeometry(2.5, 0.55, 0.14),
        new THREE.MeshStandardMaterial({ color: ZONE_COLORS.starboard })
    );
    stbMesh.position.set(-0.2, 0.42, 0.68);
    addZone('starboard', stbMesh);

    const superMesh = new THREE.Mesh(
        new THREE.BoxGeometry(0.9, 0.35, 0.6),
        new THREE.MeshStandardMaterial({ color: ZONE_COLORS.superstructure })
    );
    superMesh.position.set(-0.6, 0.90, 0);
    addZone('superstructure', superMesh);

    const coreMesh = new THREE.Mesh(
        new THREE.SphereGeometry(0.28, 16, 12),
        new THREE.MeshStandardMaterial({
            color: ZONE_COLORS.core,
            emissive: ZONE_COLORS.core,
            emissiveIntensity: 0.6
        })
    );
    coreMesh.position.set(0.2, 0.45, 0);
    addZone('core', coreMesh);

    /* --- МАЧТЫ + ПАРУСА + ФЛАГ --- */
    function makeMast(x, height, sailSize) {
        const g = new THREE.Group();

        const mast = new THREE.Mesh(
            new THREE.CylinderGeometry(0.045, 0.06, height, 8),
            new THREE.MeshStandardMaterial({ color: COL.mast, roughness: 0.85 })
        );
        mast.position.y = height / 2 + 0.75;
        mast.castShadow = true;
        g.add(mast);

        [0, 1].forEach(i => {
            const rail = new THREE.Mesh(
                new THREE.CylinderGeometry(0.03, 0.03, sailSize * 1.1, 6),
                new THREE.MeshStandardMaterial({ color: COL.mast })
            );
            rail.rotation.z = Math.PI / 2;
            rail.position.y = 0.75 + height * (0.35 + i * 0.45);
            g.add(rail);

            const sailGeo = new THREE.PlaneGeometry(sailSize, sailSize * 0.55, 12, 4);
            const pos = sailGeo.attributes.position;
            for (let vi = 0; vi < pos.count; vi++) {
                const px = pos.getX(vi);
                const py = pos.getY(vi);
                pos.setZ(vi, Math.cos(px / sailSize * Math.PI) * 0.14 + Math.sin(py / sailSize * 8) * 0.02);
            }
            sailGeo.computeVertexNormals();

            const sail = new THREE.Mesh(sailGeo, new THREE.MeshStandardMaterial({
                color: COL.sail, roughness: 0.95, side: THREE.DoubleSide
            }));
            sail.rotation.y = Math.PI / 2;
            sail.position.y = 0.75 + height * (0.35 + i * 0.45) - sailSize * 0.28;
            sail.castShadow = true;
            g.add(sail);
        });

        const flagGeo = new THREE.PlaneGeometry(0.35, 0.2, 4, 1);
        const fpos = flagGeo.attributes.position;
        for (let vi = 0; vi < fpos.count; vi++) {
            fpos.setZ(vi, Math.sin(fpos.getX(vi) * 6) * 0.04);
        }
        flagGeo.computeVertexNormals();
        const flag = new THREE.Mesh(flagGeo, new THREE.MeshStandardMaterial({
            color: 0xc0392b, side: THREE.DoubleSide, roughness: 0.9
        }));
        flag.position.set(0.18, 0.75 + height + 0.05, 0);
        g.add(flag);

        g.position.x = x;
        return g;
    }

    shipGroup.add(makeMast( 1.1, 2.2, 1.10));
    shipGroup.add(makeMast( 0.0, 2.7, 1.40));
    shipGroup.add(makeMast(-1.2, 1.9, 0.95));

    /* --- ПУШКИ --- */
    const cannonGeo = new THREE.CylinderGeometry(0.055, 0.075, 0.35, 8);
    const cannonMat = new THREE.MeshStandardMaterial({ color: COL.cannon, metalness: 0.65, roughness: 0.4 });
    [-0.75, -0.25, 0.25, 0.75].forEach(x => {
        [-0.65, 0.65].forEach(z => {
            const c = new THREE.Mesh(cannonGeo, cannonMat);
            c.rotation.x = Math.PI / 2;
            c.position.set(x, 0.62, z * 1.05);
            c.castShadow = true;
            shipGroup.add(c);
        });
    });

    /* --- МАРКЕР ПОПАДАНИЯ --- */
    const hitMark = new THREE.Group();
    const ringMat = new THREE.MeshBasicMaterial({ color: 0xfbbf24 });
    hitMark.add(new THREE.Mesh(new THREE.TorusGeometry(0.35, 0.035, 8, 32), ringMat));
    hitMark.add(new THREE.Mesh(new THREE.SphereGeometry(0.09, 12, 10), new THREE.MeshBasicMaterial({ color: 0xef4444 })));

    const crossMat = new THREE.LineBasicMaterial({ color: 0xfbbf24 });
    [[-1,0],[1,0],[0,-1],[0,1]].forEach(([dx, dy]) => {
        const g = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(dx * 0.40, dy * 0.40, 0),
            new THREE.Vector3(dx * 0.62, dy * 0.62, 0)
        ]);
        hitMark.add(new THREE.Line(g, crossMat));
    });
    hitMark.visible = false;
    scene.add(hitMark);

    /* --- ORBIT (если есть) --- */
    let controls = null;
    if (OrbitControls) {
        controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.08;
        controls.minDistance = 6;
        controls.maxDistance = 22;
        controls.maxPolarAngle = Math.PI / 2 - 0.05;
        controls.minPolarAngle = 0.15;
        controls.target.set(0, 0.6, 0);
        controls.enablePan = false;
    } else {
        /* Резерв: ручное вращение мышью */
        let isDown = false, lx = 0, ly = 0;
        const target = new THREE.Vector3(0, 0.6, 0);
        renderer.domElement.addEventListener('mousedown', e => { isDown = true; lx = e.clientX; ly = e.clientY; });
        window.addEventListener('mouseup', () => { isDown = false; });
        window.addEventListener('mousemove', e => {
            if (!isDown) return;
            const dx = (e.clientX - lx) / 200;
            const dy = (e.clientY - ly) / 200;
            lx = e.clientX; ly = e.clientY;
            const r = camera.position.length();
            let theta = Math.atan2(camera.position.x - target.x, camera.position.z - target.z);
            let phi = Math.acos((camera.position.y - target.y) / r);
            theta -= dx;
            phi = Math.max(0.15, Math.min(Math.PI / 2 - 0.05, phi + dy));
            camera.position.set(
                target.x + r * Math.sin(phi) * Math.sin(theta),
                target.y + r * Math.cos(phi),
                target.z + r * Math.sin(phi) * Math.cos(theta)
            );
            camera.lookAt(target);
        });
        renderer.domElement.addEventListener('wheel', e => {
            e.preventDefault();
            const dir = camera.position.clone().sub(target).normalize();
            const nd = Math.max(6, Math.min(22, camera.position.distanceTo(target) + (e.deltaY > 0 ? 0.6 : -0.6)));
            camera.position.copy(target).add(dir.multiplyScalar(nd));
            camera.lookAt(target);
        }, { passive: false });
    }

    /* --- RAYCASTER --- */
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    let hitCallback = opts.onHit || null;
    const zoneList = Object.values(zoneMeshes);

    function onPointerDown(ev) {
        const rect = renderer.domElement.getBoundingClientRect();
        pointer.x = ((ev.clientX - rect.left) / rect.width) * 2 - 1;
        pointer.y = -((ev.clientY - rect.top) / rect.height) * 2 + 1;

        raycaster.setFromCamera(pointer, camera);
        const hits = raycaster.intersectObjects(zoneList, false);
        if (!hits.length) return;

        const hit = hits[0];
        const zoneName = hit.object.userData.zone;
        if (!zoneName) return;

        hitMark.position.copy(hit.point);
        hitMark.lookAt(camera.position);
        hitMark.visible = true;
        hitMark.userData.zone = zoneName;

        if (typeof hitCallback === 'function') hitCallback(zoneName, hit.point.clone());

        hitMark.scale.setScalar(0.4);
        const t0 = performance.now();
        (function anim() {
            const t = Math.min(1, (performance.now() - t0) / 300);
            hitMark.scale.setScalar(0.4 + t * 0.6);
            if (t < 1) requestAnimationFrame(anim);
        })();
    }
    renderer.domElement.addEventListener('pointerdown', onPointerDown);

    /* --- LOOP --- */
    let running = true;
    const clock = new THREE.Clock();
    (function loop() {
        if (!running) return;
        const t = clock.getElapsedTime();
        shipGroup.rotation.z = Math.sin(t * 0.7) * 0.018;
        shipGroup.position.y = Math.sin(t * 1.1) * 0.025;
        if (controls) controls.update();
        renderer.render(scene, camera);
        requestAnimationFrame(loop);
    })();

    function onResize() {
        const w = container.clientWidth, h = container.clientHeight;
        if (!w || !h) return;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
    }
    window.addEventListener('resize', onResize);

    console.log('[pvpsim3d] ✓ Сцена готова, CDN:', cdn);

    /* --- API --- */
    return {
        setRotation(deg) { shipGroup.rotation.y = (deg || 0) * Math.PI / 180; },
        setShip(shipData) {
            if (shipData && shipData.name) hullMat.color.setHex(COL.hull);
        },
        fireFlash() {
            if (!hitMark.visible) return;
            ringMat.color.setHex(0xffd479);
            setTimeout(() => ringMat.color.setHex(0xfbbf24), 200);
        },
        getZone() { return hitMark.userData.zone || null; },
        onHit(cb) { hitCallback = cb; },
        reset() {
            hitMark.visible = false;
            hitMark.userData.zone = null;
            shipGroup.rotation.set(0, 0, 0);
        },
        dispose() {
            running = false;
            window.removeEventListener('resize', onResize);
            renderer.domElement.removeEventListener('pointerdown', onPointerDown);
            if (controls) controls.dispose();
            renderer.dispose();
            container.innerHTML = '';
        }
    };
}
