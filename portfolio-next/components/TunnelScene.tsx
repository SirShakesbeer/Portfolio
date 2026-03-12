'use client';
import { useEffect, useRef } from 'react';
import type { Vector3 } from 'three';

/**
 * Three.js tunnel scene.
 * Dynamically imported inside useEffect to avoid SSR issues with WebGL.
 * Replaces the original scene.js / scene.min.js.
 */
export default function TunnelScene() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    let animationId: number;

    (async () => {
      const THREE = await import('three');
      const { EffectComposer } = await import(
        'three/examples/jsm/postprocessing/EffectComposer.js'
      );
      const { RenderPass } = await import(
        'three/examples/jsm/postprocessing/RenderPass.js'
      );
      const { UnrealBloomPass } = await import(
        'three/examples/jsm/postprocessing/UnrealBloomPass.js'
      );
      const { gsap } = await import('gsap');
      const { ScrollTrigger } = await import('gsap/ScrollTrigger');

      gsap.registerPlugin(ScrollTrigger);

      // ── Helper math ──────────────────────────────────────────────────────
      const Mathutils = {
        normalize: (v: number, min: number, max: number) => (v - min) / (max - min),
        interpolate: (n: number, min: number, max: number) => min + (max - min) * n,
        map(v: number, min1: number, max1: number, min2: number, max2: number) {
          const clamped = Math.max(min1, Math.min(max1, v));
          return this.interpolate(this.normalize(clamped, min1, max1), min2, max2);
        },
      };

      // ── Renderer ─────────────────────────────────────────────────────────
      let ww = window.innerWidth;
      let wh = window.innerHeight;

      const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current!, antialias: true });
      renderer.setSize(ww, wh);

      // ── Scene ────────────────────────────────────────────────────────────
      const scene = new THREE.Scene();
      scene.fog = new THREE.Fog(0x194794, 0, 100);

      // ── Camera ───────────────────────────────────────────────────────────
      let cameraRotationProxyX = 3.14159;
      let cameraRotationProxyY = 0;

      const camera = new THREE.PerspectiveCamera(45, ww / wh, 0.001, 200);
      camera.rotation.y = cameraRotationProxyX;
      camera.rotation.z = cameraRotationProxyY;

      const c = new THREE.Group();
      c.position.z = 400;
      c.add(camera);
      scene.add(c);

      // ── Post-processing ──────────────────────────────────────────────────
      const bloomPass = new UnrealBloomPass(new THREE.Vector2(ww, wh), 1.5, 0.4, 0.85);
      bloomPass.threshold = 0;
      bloomPass.strength = 0.9;
      bloomPass.radius = 0;

      const composer = new EffectComposer(renderer);
      composer.setSize(ww, wh);
      composer.addPass(new RenderPass(scene, camera));
      composer.addPass(bloomPass);

      // ── Tube path ────────────────────────────────────────────────────────
      const rawPoints = [
        [10, 89, 0], [50, 88, 10], [76, 139, 20], [126, 141, 12],
        [150, 112, 8], [157, 73, 0], [180, 44, 5], [207, 35, 10],
        [232, 36, 0], [240, 70, 10],
      ];
      const path = new THREE.CatmullRomCurve3(
        rawPoints.map(([x, z, y]) => new THREE.Vector3(x, y, z))
      );
      path.tension = 0.1;

      const loadTex = (url: string) =>
        new THREE.TextureLoader().load(url, (t) => {
          t.wrapS = t.wrapT = THREE.RepeatWrapping;
          t.repeat.set(15, 2);
        });

      const material = new THREE.MeshPhongMaterial({
        side: THREE.BackSide,
        map: loadTex('/background/3d_space_5.jpg'),
        shininess: 20,
        bumpMap: loadTex('/background/waveform-bump3.jpg'),
        bumpScale: -0.03,
        specular: 0x0b2349,
      });

      scene.add(new THREE.Mesh(new THREE.TubeGeometry(path, 300, 5, 32, false), material));
      scene.add(
        new THREE.LineSegments(
          new THREE.EdgesGeometry(new THREE.TubeGeometry(path, 150, 4, 32, false)),
          new THREE.LineBasicMaterial({ linewidth: 2, opacity: 0.2, transparent: true })
        )
      );

      const light = new THREE.PointLight(0xffffff, 0.35, 4, 0);
      light.castShadow = true;
      scene.add(light);

      // ── Camera path scroll ───────────────────────────────────────────────
      let p1: Vector3 = new THREE.Vector3();
      let p2: Vector3 = new THREE.Vector3();

      function updateCameraPercentage(pct: number) {
        p1 = path.getPointAt(pct % 1);
        p2 = path.getPointAt((pct + 0.03) % 1);
        c.position.set(p1.x, p1.y, p1.z);
        c.lookAt(p2);
        light.position.set(p2.x, p2.y, p2.z);
      }

      let cameraTargetPercentage = 0;
      let currentCameraPercentage = 0;
      const tubePerc = { percent: 0 };

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: '.tunnel-content',
          start: 'top top',
          end: 'bottom 100%',
          pin: '#tunnelCanvas',
          markers: false,
          scrub: 2,
        },
      });
      tl.to(tubePerc, {
        percent: 0.96,
        ease: 'none',
        duration: 10,
        onUpdate: () => { cameraTargetPercentage = tubePerc.percent; },
      });

      // ── Render loop ──────────────────────────────────────────────────────
      function render() {
        currentCameraPercentage = cameraTargetPercentage;
        camera.rotation.y += (cameraRotationProxyX - camera.rotation.y) / 15;
        camera.rotation.x += (cameraRotationProxyY - camera.rotation.x) / 15;
        updateCameraPercentage(currentCameraPercentage);
        composer.render();
        animationId = requestAnimationFrame(render);
      }
      animationId = requestAnimationFrame(render);

      // ── Events ───────────────────────────────────────────────────────────
      const markers: Vector3[] = [];
      canvasRef.current?.addEventListener('click', () => {
        markers.push(p1);
        console.log(JSON.stringify(markers));
      });

      const onMouseMove = (evt: MouseEvent) => {
        cameraRotationProxyX = Mathutils.map(evt.clientX, 0, window.innerWidth, 3.24, 3.04);
        cameraRotationProxyY = Mathutils.map(evt.clientY, 0, window.innerHeight, -0.1, 0.1);
      };
      document.addEventListener('mousemove', onMouseMove);

      const onResize = () => {
        ww = window.innerWidth;
        wh = window.innerHeight;
        camera.aspect = ww / wh;
        camera.updateProjectionMatrix();
        renderer.setSize(ww, wh);
        composer.setSize(ww, wh);
      };
      window.addEventListener('resize', onResize);

      // ── Cleanup stored on the ref for the return callback ────────────────
      (canvasRef as React.MutableRefObject<HTMLCanvasElement & { _cleanup?: () => void }>)
        .current!._cleanup = () => {
        document.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('resize', onResize);
        renderer.dispose();
      };
    })();

    return () => {
      cancelAnimationFrame(animationId);
      (canvasRef as React.MutableRefObject<HTMLCanvasElement & { _cleanup?: () => void }>)
        .current?._cleanup?.();
    };
  }, []);

  return <canvas ref={canvasRef} />;
}
