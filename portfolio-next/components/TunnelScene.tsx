'use client';
import { useEffect, useRef } from 'react';

/**
 * Three.js tunnel scene with 3D cards positioned along the path.
 * Cards snap to positions as user scrolls through the tunnel.
 */
type TunnelCardData = {
  id: number;
  title: string;
  excerpt?: string;
  content?: string;
};

type TunnelSceneProps = {
  scrollTriggerSelector?: string;
  scrollDistanceSlides?: number;
  cards?: TunnelCardData[];
  onCardChange?: (cardIndex: number) => void;
};

export default function TunnelScene({
  scrollTriggerSelector = '.tunnel-content',
  scrollDistanceSlides,
  cards = [],
  onCardChange,
}: TunnelSceneProps) {
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
      renderer.autoClear = false;

      // ── Scene ────────────────────────────────────────────────────────────
      const scene = new THREE.Scene();
      scene.fog = new THREE.Fog(0x194794, 0, 100);
      const cardScene = new THREE.Scene();

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

      const tunnelMesh = new THREE.Mesh(new THREE.TubeGeometry(path, 300, 5, 32, false), material);
      scene.add(tunnelMesh);

      const tunnelEdges = new THREE.LineSegments(
        new THREE.EdgesGeometry(new THREE.TubeGeometry(path, 150, 4, 32, false)),
        new THREE.LineBasicMaterial({ linewidth: 2, opacity: 0.2, transparent: true })
      );
      scene.add(tunnelEdges);

      const light = new THREE.PointLight(0xffffff, 0.35, 4, 0);
      light.castShadow = true;
      scene.add(light);
      const depthOnlyMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
      depthOnlyMaterial.colorWrite = false;

      const getCardMetrics = () => {
        const size = 2;
        const canvasSize = 1024;
        const padding = 72;
        const titleFontSize = 54;
        const bodyFontSize = 34;
        const titleLineHeight = 64;
        const bodyLineHeight = 46;
        const sectionGap = 52;
        const opacity = 0.8;

        return {
          width: size,
          height: size,
          canvasWidth: canvasSize,
          canvasHeight: canvasSize,
          padding,
          titleFontSize,
          bodyFontSize,
          titleLineHeight,
          bodyLineHeight,
          sectionGap,
          opacity,
        };
      };

      // ── Helper to create card texture from text ──────────────────────────
      const createCardTexture = (card: TunnelCardData) => {
        const metrics = getCardMetrics();
        const canvas = document.createElement('canvas');
        canvas.width = metrics.canvasWidth;
        canvas.height = metrics.canvasHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) return null;

        // Background
        ctx.fillStyle = '#1a3a5c';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Title
        ctx.fillStyle = '#88ce02';
        ctx.font = `bold ${metrics.titleFontSize}px Arial, sans-serif`;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        let y = metrics.padding;
        const titleText = card.title || 'Card';
        const titleLines = titleText.split('\n');
        for (const line of titleLines) {
          ctx.fillText(line, metrics.padding, y);
          y += metrics.titleLineHeight;
        }

        // Excerpt/Content
        ctx.fillStyle = '#ffffff';
        ctx.font = `${metrics.bodyFontSize}px Arial, sans-serif`;
        y += metrics.sectionGap;
        const contentText = card.content || 'No content';
        // Wrap text
        const maxWidth = canvas.width - metrics.padding * 2;
        const lineHeight = metrics.bodyLineHeight;
        const words = contentText.split(' ');
        let line = '';
        for (const word of words) {
          const testLine = line + word + ' ';
          const measuredText = ctx.measureText(testLine);
          if (measuredText.width > maxWidth && line) {
            ctx.fillText(line, metrics.padding, y);
            line = word + ' ';
            y += lineHeight;
          } else {
            line = testLine;
          }
        }
        if (line) ctx.fillText(line, metrics.padding, y);

        const texture = new THREE.CanvasTexture(canvas);
        texture.colorSpace = 'srgb';
        texture.magFilter = THREE.LinearFilter;
        texture.minFilter = THREE.LinearFilter;
        return texture;
      };

      // ── Card positioning along path ──────────────────────────────────────
      const cardCount = Math.max(cards.length, 1);
      const cardPercentages: number[] = [];
      const cardMeshes: any[] = [];

      // Calculate evenly spaced card positions along path
      // Keep the intro card closer to the camera, but leave a larger gap before card 2.
      const firstCardPathPosition = 0.025;
      const remainingCardsStart = 0.12;
      const pathEnd = 0.95;
      
      for (let i = 0; i < cardCount; i++) {
        let adjustedPct = firstCardPathPosition;

        if (cardCount > 1 && i > 0) {
          const pct = (i - 1) / Math.max(cardCount - 2, 1);
          adjustedPct = remainingCardsStart + pct * (pathEnd - remainingCardsStart);
        }

        cardPercentages.push(adjustedPct);

        // Create card plane with texture
        const cardMetrics = getCardMetrics();
        const cardGeometry = new THREE.PlaneGeometry(cardMetrics.width, cardMetrics.height);
        const cardTexture = createCardTexture(cards[i]);
        const cardMaterial = new THREE.MeshBasicMaterial({
          map: cardTexture,
          side: THREE.FrontSide,
        });
        const cardMesh = new THREE.Mesh(cardGeometry, cardMaterial);
        
        // Get position on path for this card
        const pos = path.getPointAt(adjustedPct);
        const tangent = path.getTangentAt(adjustedPct);
        
        cardMesh.position.copy(pos);
        // Rotate card to face outward from tunnel center
        cardMesh.lookAt(pos.clone().sub(tangent.multiplyScalar(2)));
        
        cardScene.add(cardMesh);
        cardMeshes.push(cardMesh);
      }

      // ── Camera path scroll ───────────────────────────────────────────────
      let p1: any = new THREE.Vector3();
      let p2: any = new THREE.Vector3();
      let currentCardIndex = 0;

      function updateCameraPercentage(pct: number) {
        p1 = path.getPointAt(pct % 1);
        p2 = path.getPointAt((pct + 0.03) % 1);
        c.position.set(p1.x, p1.y, p1.z);
        c.lookAt(p2);
        light.position.set(p2.x, p2.y, p2.z);

        // Track which card is closest to camera
        let closestIdx = 0;
        let closestDist = Infinity;
        for (let i = 0; i < cardPercentages.length; i++) {
          const cardPct = cardPercentages[i];
          const dist = Math.abs(pct - cardPct);
          if (dist < closestDist) {
            closestDist = dist;
            closestIdx = i;
          }
        }
        if (closestIdx !== currentCardIndex) {
          currentCardIndex = closestIdx;
          onCardChange?.(closestIdx);
        }
      }

      let cameraTargetPercentage = 0;
      let currentCameraPercentage = 0;
      const tubePerc = { percent: 0 };

      // Map scroll to card snapping
      const totalCards = Math.max(cards.length, 1);
      const scrollSteps = Math.max(totalCards - 1, 1);
      const cameraOffsetFraction = 0.01; // Distance between snap position and card position along path

      // Pre-calculate snap targets
      // Keep the initial scroll position at the top and only offset later cards.
      const snapTargets = cardPercentages.map((cardPct, idx) => {
        if (idx === 0) {
          return 0;
        }

        const isLast = idx === cardPercentages.length - 1;
        const offsetToApply = isLast ? 0 : cameraOffsetFraction;
        const snapTarget = Math.max(0, cardPct - offsetToApply);
        return Math.min(1, snapTarget);
      });

      const tl = gsap.timeline({
        scrollTrigger: {
          id: 'portfolio-tunnel-camera-path',
          trigger: scrollTriggerSelector,
          start: 'top top',
          end: () => {
            if (typeof scrollDistanceSlides === 'number') {
              const navHeight = document.querySelector<HTMLElement>('nav.navbar')?.offsetHeight ?? 0;
              const distance = Math.max(scrollDistanceSlides, 1) * window.innerHeight;
              return `+=${distance + navHeight}`;
            }
            const el = document.querySelector<HTMLElement>(scrollTriggerSelector);
            return `+=${el?.offsetHeight ?? window.innerHeight}`;
          },
          markers: false,
          scrub: 2,
          invalidateOnRefresh: true,
          snap: {
            snapTo: snapTargets,
            duration: { min: 0.2, max: 0.45 },
            ease: 'power1.inOut',
          },
        },
      });
      tl.to(tubePerc, {
        percent: 1,
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
        
        // Update card opacity based on distance to camera
        for (let i = 0; i < cardMeshes.length; i++) {
          const cardMaterial = cardMeshes[i].material as any;
          const dist = Math.abs(currentCameraPercentage - cardPercentages[i]);
          const opacity = Math.max(0.2, getCardMetrics().opacity/(1+dist));
          cardMaterial.opacity = opacity;
          cardMaterial.transparent = opacity < 1;
        }

        renderer.clear();
        composer.render();
        renderer.clearDepth();
        scene.overrideMaterial = depthOnlyMaterial;
        renderer.render(scene, camera);
        scene.overrideMaterial = null;
        renderer.render(cardScene, camera);
        animationId = requestAnimationFrame(render);
      }
      animationId = requestAnimationFrame(render);

      // ── Events ───────────────────────────────────────────────────────────
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

        cardMeshes.forEach((mesh, index) => {
          const cardMetrics = getCardMetrics();
          mesh.geometry.dispose();
          mesh.geometry = new THREE.PlaneGeometry(cardMetrics.width, cardMetrics.height);

          const material = mesh.material as any;
          material.map?.dispose?.();
          material.map = createCardTexture(cards[index]);
          material.needsUpdate = true;
        });
      };
      window.addEventListener('resize', onResize);

      // ── Cleanup stored on the ref for the return callback ────────────────
      (canvasRef as React.MutableRefObject<HTMLCanvasElement & { _cleanup?: () => void }>)
        .current!._cleanup = () => {
        tl.kill();
        document.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('resize', onResize);
        depthOnlyMaterial.dispose();
        cardMeshes.forEach(mesh => {
          mesh.geometry.dispose();
          (mesh.material as any).dispose();
        });
        renderer.dispose();
      };
    })();

    return () => {
      cancelAnimationFrame(animationId);
      (canvasRef as React.MutableRefObject<HTMLCanvasElement & { _cleanup?: () => void }>)
        .current?._cleanup?.();
    };
  }, [scrollDistanceSlides, scrollTriggerSelector, cards, onCardChange]);

  return <canvas ref={canvasRef} />;
}
