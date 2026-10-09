"use client";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import styles from "./Dhruva3DIntro.module.css";

const CAPTIONS = [
  "So, hello. I see you — a weary traveller lost in the chaos of the city, confused about choices to take. In this darkened doom…",
  "…there’s one light of hope — the ever unchanging, constantly guiding — “DHRUV”.",
  "And let’s start the way any kid would — play the game, explore, and call me right back when you need."
];

export default function Dhruva3DIntro({ onStartGame, onStartNormal }) {
  const canvasRef = useRef(null);
  const [gateActive, setGateActive] = useState(true);
  const [stage, setStage] = useState(0); // 0=gate, 1=torch, 2=star, 3=explore
  const [captionText, setCaptionText] = useState("");
  const [captionVisible, setCaptionVisible] = useState(false);
  const [hintVisible, setHintVisible] = useState(false);
  const [brandVisible, setBrandVisible] = useState(false);
  const [exploreVisible, setExploreVisible] = useState(false);
  const [glitchActive, setGlitchActive] = useState(false);

  const sceneStateRef = useRef({
    stage: 0,
    tmx: 0,
    tmy: -0.05,
    mx: 0,
    my: -0.05,
    animId: null
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    /* ─── Renderer Setup ─── */
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    scene.fog = new THREE.FogExp2(0x010102, 0.03);

    const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 400);
    camera.rotation.order = "YXZ";
    const CAM_Z = 12;
    camera.position.set(0, 1.7, CAM_Z);

    /* ─── Texture Helpers ─── */
    function canvasTex(size, draw, repeat) {
      const c = document.createElement("canvas");
      c.width = c.height = size;
      const g = c.getContext("2d");
      draw(g, size);
      const t = new THREE.CanvasTexture(c);
      t.wrapS = t.wrapT = THREE.RepeatWrapping;
      if (repeat) t.repeat.set(repeat[0], repeat[1]);
      t.colorSpace = THREE.SRGBColorSpace;
      return t;
    }

    function speckle(g, s, n, rgb, aMax, maxSize = 2) {
      for (let i = 0; i < n; i++) {
        g.fillStyle = `rgba(${rgb},${Math.random() * aMax})`;
        g.fillRect(Math.random() * s, Math.random() * s, 1 + Math.random() * maxSize, 1 + Math.random() * maxSize);
      }
    }

    function cracks(g, s, n) {
      g.strokeStyle = "rgba(0,0,0,.55)";
      g.lineWidth = 1;
      for (let i = 0; i < n; i++) {
        let x = Math.random() * s, y = Math.random() * s;
        g.beginPath();
        g.moveTo(x, y);
        for (let k = 0; k < 7; k++) {
          x += (Math.random() - 0.5) * 40;
          y += (Math.random() - 0.5) * 40;
          g.lineTo(x, y);
        }
        g.stroke();
      }
    }

    const asphaltBase = canvasTex(256, (g, s) => {
      g.fillStyle = "#2c2c30";
      g.fillRect(0, 0, s, s);
      speckle(g, s, 4000, "160,160,165", 0.35);
      speckle(g, s, 4000, "0,0,0", 0.5);
      cracks(g, s, 4);
    });

    const concreteBase = canvasTex(128, (g, s) => {
      g.fillStyle = "#4a4a4c";
      g.fillRect(0, 0, s, s);
      speckle(g, s, 1500, "210,210,210", 0.22);
      speckle(g, s, 1500, "0,0,0", 0.3);
      g.strokeStyle = "rgba(0,0,0,.6)";
      g.lineWidth = 2;
      g.strokeRect(0, 0, s, s);
    });

    function tiled(base, rx, ry) {
      const t = base.clone();
      t.needsUpdate = true;
      t.repeat.set(rx, ry);
      return t;
    }

    function facade(baseColor) {
      return canvasTex(128, (g, s) => {
        g.fillStyle = baseColor;
        g.fillRect(0, 0, s, s);
        speckle(g, s, 1000, "255,255,255", 0.06);
        for (const x of [20, 74]) {
          g.fillStyle = "#1b2026";
          g.fillRect(x - 3, 20, 44, 72);
          g.fillStyle = "#06090d";
          g.fillRect(x, 24, 38, 64);
        }
      });
    }

    const FACADES = [facade("#2a2d34"), facade("#3b2b27"), facade("#34332e")];
    const facadeMats = {};
    function facadeMat(variant, floors) {
      const key = `${variant}|${floors}`;
      if (!facadeMats[key]) {
        const t = FACADES[variant].clone();
        t.needsUpdate = true;
        t.repeat.set(2, floors);
        facadeMats[key] = new THREE.MeshStandardMaterial({ map: t, roughness: 0.6, metalness: 0.05 });
      }
      return facadeMats[key];
    }
    const roofMat = new THREE.MeshStandardMaterial({ color: 0x0c0c0e, roughness: 1 });

    /* ─── Ground & Roads ─── */
    const hits = [];
    const ROAD_W = 10, ROAD_L = 200;

    const baseGround = new THREE.Mesh(
      new THREE.PlaneGeometry(400, 400),
      new THREE.MeshStandardMaterial({ color: 0x0b0b0c, roughness: 1 })
    );
    baseGround.rotation.x = -Math.PI / 2;
    baseGround.position.y = -0.03;
    baseGround.receiveShadow = true;
    scene.add(baseGround);

    function road(w, l, rx, ry, rotY, y) {
      const m = new THREE.Mesh(
        new THREE.PlaneGeometry(w, l),
        new THREE.MeshStandardMaterial({
          map: tiled(asphaltBase, rx, ry),
          roughness: 0.78,
          metalness: 0.06
        })
      );
      m.rotation.x = -Math.PI / 2;
      m.rotation.z = rotY;
      m.position.y = y;
      m.receiveShadow = true;
      scene.add(m);
      hits.push(m);
      return m;
    }
    road(ROAD_W, ROAD_L, 2.5, 50, 0, 0); // North-South
    road(ROAD_W, ROAD_L, 2.5, 50, Math.PI / 2, 0.006); // East-West

    // Zebra Crossings
    const zebraMat = new THREE.MeshStandardMaterial({ color: 0xb9b6a6, roughness: 0.85 });
    function zebra(cx, cz, alongX) {
      for (let i = -3; i <= 3; i++) {
        const stripe = new THREE.Mesh(new THREE.PlaneGeometry(alongX ? 3 : 0.6, alongX ? 0.6 : 3), zebraMat);
        stripe.rotation.x = -Math.PI / 2;
        stripe.position.set(cx + (alongX ? 0 : i * 1.05), 0.016, cz + (alongX ? i * 1.05 : 0));
        stripe.receiveShadow = true;
        scene.add(stripe);
      }
    }
    zebra(0, 7.5, false);
    zebra(0, -7.5, false);

    /* ─── Sidewalks & Buildings ─── */
    const SLAB = 60;
    const slabMat = new THREE.MeshStandardMaterial({ map: tiled(concreteBase, SLAB / 3, SLAB / 3), roughness: 0.92 });
    let seed = 7;
    const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;

    for (const sx of [-1, 1]) {
      for (const sz of [-1, 1]) {
        const slab = new THREE.Mesh(new THREE.BoxGeometry(SLAB, 0.16, SLAB), slabMat);
        slab.position.set(sx * (5 + SLAB / 2), 0.08, sz * (5 + SLAB / 2));
        slab.receiveShadow = true;
        scene.add(slab);
        hits.push(slab);

        for (let i = 0; i < 3; i++) {
          for (let j = 0; j < 3; j++) {
            const floors = 4 + Math.floor(rnd() * 6);
            const h = floors * 4, variant = Math.floor(rnd() * 3);
            const sm = facadeMat(variant, floors);
            const b = new THREE.Mesh(new THREE.BoxGeometry(11, h, 11), [sm, sm, roofMat, roofMat, sm, sm]);
            b.position.set(sx * (8 + 6 + i * 15), 0.16 + h / 2, sz * (8 + 6 + j * 15));
            b.castShadow = true;
            b.receiveShadow = true;
            scene.add(b);
            hits.push(b);
          }
        }
      }
    }

    /* ─── Lighting ─── */
    const ambient = new THREE.AmbientLight(0x1a2438, 0.025);
    scene.add(ambient);

    const torch = new THREE.SpotLight(0xffe2b4, 2.5, 60, 0.22, 0.8, 1.1);
    torch.castShadow = true;
    torch.shadow.mapSize.set(512, 512);
    torch.shadow.camera.near = 0.3;
    torch.shadow.camera.far = 70;
    scene.add(torch, torch.target);

    const torchGlow = new THREE.PointLight(0xffd9a0, 0.45, 10, 2);
    scene.add(torchGlow);

    /* ─── The Pole Star (Dhruv) ─── */
    function starTexture() {
      const s = 256;
      const c = document.createElement("canvas");
      c.width = c.height = s;
      const g = c.getContext("2d");
      const gr = g.createRadialGradient(128, 128, 0, 128, 128, 128);
      gr.addColorStop(0, "rgba(255,255,255,1)");
      gr.addColorStop(0.08, "rgba(240,246,255,.9)");
      gr.addColorStop(0.2, "rgba(165,200,255,.4)");
      gr.addColorStop(0.6, "rgba(110,150,255,.08)");
      gr.addColorStop(1, "rgba(0,0,0,0)");
      g.fillStyle = gr;
      g.fillRect(0, 0, s, s);

      g.fillStyle = "rgba(255,255,255,0.95)";
      g.fillRect(0, 126, s, 4);
      g.fillRect(126, 0, 4, s);

      const t = new THREE.CanvasTexture(c);
      t.colorSpace = THREE.SRGBColorSpace;
      return t;
    }

    const STAR_POS = new THREE.Vector3(0, 68, -90);
    const star = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: starTexture(),
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
    );
    star.position.copy(STAR_POS);
    star.scale.set(12, 12, 1);
    scene.add(star);

    const starLight = new THREE.PointLight(0xb7cfff, 0, 400, 1);
    starLight.position.copy(STAR_POS);
    scene.add(starLight);

    /* ─── Pointer Event Handlers ─── */
    const updatePointer = (clientX, clientY) => {
      sceneStateRef.current.tmx = (clientX / window.innerWidth) * 2 - 1;
      sceneStateRef.current.tmy = -(clientY / window.innerHeight) * 2 + 1;
    };

    const handlePointerMove = (e) => updatePointer(e.clientX, e.clientY);
    const handleTouchMove = (e) => {
      if (e.touches && e.touches[0]) {
        updatePointer(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("touchmove", handleTouchMove, { passive: true });

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", handleResize);

    /* ─── Animation Loop ─── */
    let yaw = 0, pitch = 0, torchLevel = 1, starLevel = 0;
    const clock = new THREE.Clock();
    const ray = new THREE.Raycaster();
    const ndc = new THREE.Vector2();
    const tgt = new THREE.Vector3(0, 0, -20);
    const aim = new THREE.Vector3();
    const tmp = new THREE.Vector3();

    const animate = () => {
      sceneStateRef.current.animId = requestAnimationFrame(animate);
      const dt = Math.min(clock.getDelta(), 0.05);
      const t = clock.elapsedTime;
      const k = (r) => 1 - Math.exp(-dt * r);

      const state = sceneStateRef.current;
      state.mx += (state.tmx - state.mx) * k(6);
      state.my += (state.tmy - state.my) * k(6);

      let ty, tp, rate;
      if (state.stage < 2) {
        ty = -state.mx * 0.6 + Math.sin(t * 0.35) * 0.06;
        tp = state.my * 0.22 - 0.02;
        rate = 6;
      } else {
        ty = 0;
        tp = 0.42; // Smooth camera pan up to Dhruv
        rate = 1.2;
      }
      yaw += (ty - yaw) * k(rate);
      pitch += (tp - pitch) * k(rate);

      camera.position.set(Math.sin(t * 0.9) * 0.02, 1.7 + Math.sin(t * 1.7) * 0.015, CAM_Z);
      camera.rotation.set(pitch, yaw, 0);
      camera.updateMatrixWorld();

      // Torch tracks pointer
      ndc.set(state.tmx, state.tmy);
      ray.setFromCamera(ndc, camera);
      const hit = ray.intersectObjects(hits, false)[0];
      aim.copy(hit ? hit.point : ray.ray.at(40, tmp));
      tgt.lerp(aim, k(14));

      torch.position.copy(camera.localToWorld(new THREE.Vector3(0.3, -0.3, -0.2)));
      torch.target.position.copy(tgt);
      torchGlow.position.copy(tgt).lerp(camera.position, 0.08);

      torchLevel += ((state.stage >= 2 ? 0.3 : 1) - torchLevel) * k(1.6);
      torch.intensity = 2.5 * torchLevel;
      torchGlow.intensity = 0.45 * torchLevel;

      starLevel += ((state.stage >= 2 ? 1 : 0) - starLevel) * k(0.9);
      star.material.opacity = starLevel;
      const tw = 1 + Math.sin(t * 2.3) * 0.05 + Math.sin(t * 5.1) * 0.025;
      star.scale.set(12 * tw, 12 * tw, 1);
      starLight.intensity = 0.35 * starLevel;
      ambient.intensity = 0.025 + 0.08 * starLevel;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("resize", handleResize);
      if (sceneStateRef.current.animId) cancelAnimationFrame(sceneStateRef.current.animId);
      renderer.dispose();
    };
  }, []);

  /* ─── Story Progression ─── */
  const playPart = (index, fallbackSec) => {
    return new Promise((resolve) => {
      const audio = new Audio(`/audio/part${index + 1}.mp3`);
      let resolved = false;
      const done = () => {
        if (!resolved) {
          resolved = true;
          resolve();
        }
      };
      const fallbackTimer = setTimeout(done, fallbackSec * 1000);
      audio.addEventListener("ended", () => {
        clearTimeout(fallbackTimer);
        done();
      });
      audio.addEventListener("error", done);
      audio.play().catch(done);
    });
  };

  const showCaption = (text) => {
    setCaptionVisible(false);
    setTimeout(() => {
      setCaptionText(text);
      setCaptionVisible(true);
    }, 250);
  };

  const handleStartGame = async () => {
    setGateActive(false);
    setGlitchActive(true);
    setTimeout(() => setGlitchActive(false), 700);

    // Geolocation detection
    if (typeof navigator !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (p) => {
          if (typeof window !== "undefined") {
            window.dhruvaLocation = { lat: p.coords.latitude, lng: p.coords.longitude };
          }
        },
        () => {},
        { timeout: 6000 }
      );
    }

    // Step 1: Torch & Caption 0
    sceneStateRef.current.stage = 1;
    setStage(1);
    setHintVisible(true);
    showCaption(CAPTIONS[0]);
    setTimeout(() => setHintVisible(false), 6000);
    await playPart(0, 7);

    // Step 2: Camera pans up, Star glows, Brand reveals
    sceneStateRef.current.stage = 2;
    setStage(2);
    showCaption(CAPTIONS[1]);
    setBrandVisible(true);
    await playPart(1, 6);

    // Step 3: Explore button
    sceneStateRef.current.stage = 3;
    setStage(3);
    showCaption(CAPTIONS[2]);
    setExploreVisible(true);
    await playPart(2, 6);
  };

  return (
    <div className={styles.container}>
      <canvas
        ref={canvasRef}
        className={`${styles.canvas} ${glitchActive ? styles.canvasGlitch : ""}`}
      />

      {/* Skip Button */}
      {!gateActive && (
        <button
          className={styles.skipBtn}
          onClick={onStartGame}
          aria-label="Skip cinematic intro"
        >
          Skip Intro ➔
        </button>
      )}

      {/* Brand Reveal */}
      <div className={`${styles.brand} ${brandVisible ? styles.brandOn : ""}`} aria-hidden="true">
        <svg className={styles.brandMark} viewBox="0 0 100 100" fill="none">
          <circle cx="50" cy="50" r="44" stroke="#bcd4ff" strokeOpacity=".55" strokeWidth="1.5" />
          <path d="M50 8 L57 43 L92 50 L57 57 L50 92 L43 57 L8 50 L43 43 Z" fill="#eef4ff" />
        </svg>
        <h1 className={styles.brandTitle}>DHRUV</h1>
        <p className={styles.brandTag}>
          <span>From City Chaos to Confidence,</span>
          <span>Anxiety to Adventure</span>
          <span>&amp; Doomed Dark to Light of “DHRUV”.</span>
        </p>
      </div>

      {/* Dynamic Hint & Caption */}
      <div className={`${styles.hint} ${hintVisible ? styles.hintOn : ""}`}>
        Your cursor is the torch. Move it.
      </div>
      <div className={`${styles.caption} ${captionVisible ? styles.captionOn : ""}`}>
        {captionText}
      </div>

      {/* Explore Button */}
      <button
        className={`${styles.exploreBtn} ${exploreVisible ? styles.exploreBtnOn : ""}`}
        onClick={onStartGame}
        aria-label="Enter Dhruva Ludic Odyssey"
      >
        ⚔️ Explore Now!
      </button>

      {/* Initial Entry Gate */}
      <div className={`${styles.gate} ${!gateActive ? styles.gateOff : ""}`}>
        <h2 className={styles.gateTitle}>Dhruva (ध्रुव)</h2>
        <p className={styles.gateDesc}>
          Turn on game mode? Sound and spatial exploration are part of the story.
        </p>
        <div className={styles.gateButtons}>
          <button
            className={`${styles.gateBtn} ${styles.gateBtnPrimary}`}
            onClick={handleStartGame}
            id="intro-game-on"
            aria-label="Turn on game mode"
          >
            ⚔️ Game mode on
          </button>
          <button
            className={styles.gateBtn}
            onClick={onStartNormal}
            id="intro-game-off"
            aria-label="Turn on normal map mode"
          >
            🧭 Game mode off
          </button>
        </div>
      </div>
    </div>
  );
}
