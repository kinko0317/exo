
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { HandPosition } from '../types';

interface MagicSceneProps {
  handPos: React.MutableRefObject<HandPosition>;
}

export const MagicScene: React.FC<MagicSceneProps> = ({ handPos }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!mountRef.current) return;

    // --- SCENE SETUP ---
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x050505, 0.05);

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 8;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false }); // Antialias off for post-processing
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    mountRef.current.appendChild(renderer.domElement);

    // --- POST PROCESSING (BLOOM) ---
    const renderScene = new RenderPass(scene, camera);
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      1.5, // Strength
      0.4, // Radius
      0.1  // Threshold
    );
    
    // Bloom configuration for "Cinematic Glow"
    bloomPass.strength = 1.2;
    bloomPass.radius = 0.5;
    bloomPass.threshold = 0.1;

    const composer = new EffectComposer(renderer);
    composer.addPass(renderScene);
    composer.addPass(bloomPass);

    // --- LIGHTING ---
    const ambientLight = new THREE.AmbientLight(0x404040, 2);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 4);
    dirLight.position.set(2, 5, 5);
    scene.add(dirLight);

    const pointLight = new THREE.PointLight(0x00ffaa, 5, 20); // Emerald light
    scene.add(pointLight);

    // --- MATERIALS ---
    // High-end Silver Material
    const silverMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      metalness: 1.0,
      roughness: 0.15,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
      emissive: 0x002211,
      emissiveIntensity: 0.2
    });

    // Emerald Material
    const emeraldMat = new THREE.MeshPhysicalMaterial({
      color: 0x00ff66,
      metalness: 0.8,
      roughness: 0.1,
      transmission: 0.6,
      thickness: 1,
      emissive: 0x004411,
      emissiveIntensity: 0.5
    });

    // --- GEOMETRIES ---
    // 1. Heart Geometry
    const heartShape = new THREE.Shape();
    heartShape.moveTo(0.25, 0.25);
    heartShape.bezierCurveTo(0.25, 0.25, 0.20, 0, 0, 0);
    heartShape.bezierCurveTo(-0.30, 0, -0.30, 0.35, -0.30, 0.35);
    heartShape.bezierCurveTo(-0.30, 0.55, -0.10, 0.77, 0.25, 0.95);
    heartShape.bezierCurveTo(0.60, 0.77, 0.80, 0.55, 0.80, 0.35);
    heartShape.bezierCurveTo(0.80, 0.35, 0.80, 0, 0.50, 0);
    heartShape.bezierCurveTo(0.35, 0, 0.25, 0.25, 0.25, 0.25);
    const heartGeo = new THREE.ExtrudeGeometry(heartShape, { depth: 0.1, bevelEnabled: true, bevelSegments: 2, steps: 2, bevelSize: 0.05, bevelThickness: 0.05 });
    heartGeo.center(); // Center the geometry
    heartGeo.scale(0.3, 0.3, 0.3);

    // 2. Coffee Cup Geometry (Cylinder + Torus)
    const cupGroup = new THREE.Group();
    // Since we need a single geometry for InstancedMesh, we merge them.
    // However, merging effectively inside standard Three.js without BufferGeometryUtils imported is verbose.
    // Simpler approach: Create a Cylinder, and we'll just use Cylinders to represent "Cups" for stability 
    // or use a LatheGeometry to make a nice cup shape in one go.
    const cupPoints = [];
    for ( let i = 0; i < 10; i ++ ) {
        cupPoints.push( new THREE.Vector2( Math.sin( i * 0.2 ) * 0.2 + 0.3, ( i - 5 ) * 0.1 ) );
    }
    const cupGeo = new THREE.LatheGeometry( cupPoints, 20 );
    cupGeo.scale(0.5, 0.5, 0.5);

    // 3. Shards/Dust
    const shardGeo = new THREE.OctahedronGeometry(0.05);

    // --- POSITIONS GENERATION ---
    const generateEXOPoints = (count: number) => {
        const points: THREE.Vector3[] = [];
        const letterScale = 2.0; 
        
        for(let i=0; i<count; i++) {
            const r = Math.random();
            const section = Math.floor(Math.random() * 3); // 0=E, 1=X, 2=O
            let p = new THREE.Vector3();

            if(section === 0) { // E
                // Positioned at x = -2.5
                const seg = Math.random();
                if (seg < 0.4) { // Vertical bar
                    p.set(-2.5, (Math.random()-0.5)*3, 0);
                } else if (seg < 0.6) { // Top
                    p.set(-2.5 + Math.random()*1.2, 1.5, 0);
                } else if (seg < 0.8) { // Mid
                    p.set(-2.5 + Math.random()*1.0, 0, 0);
                } else { // Bot
                    p.set(-2.5 + Math.random()*1.2, -1.5, 0);
                }
            } else if (section === 1) { // X
                // Positioned at x = 0
                const arm = Math.random() > 0.5 ? 1 : -1;
                const t = (Math.random()-0.5) * 3;
                p.set(t * 0.8, t * arm, 0);
            } else { // O
                // Positioned at x = 2.5
                const angle = Math.random() * Math.PI * 2;
                p.set(2.5 + Math.cos(angle)*1.2, Math.sin(angle)*1.5, 0);
            }

            // Add some jitter
            p.x += (Math.random()-0.5) * 0.2;
            p.y += (Math.random()-0.5) * 0.2;
            p.z += (Math.random()-0.5) * 0.5; // Depth volume
            points.push(p);
        }
        return points;
    };

    const generateScatterPoints = (count: number) => {
        const points: THREE.Vector3[] = [];
        for(let i=0; i<count; i++) {
            const u = Math.random();
            const v = Math.random();
            const theta = 2 * Math.PI * u;
            const phi = Math.acos(2 * v - 1);
            const r = 4 + Math.random() * 4; // Scatter radius
            
            points.push(new THREE.Vector3(
                r * Math.sin(phi) * Math.cos(theta),
                r * Math.sin(phi) * Math.sin(theta),
                r * Math.cos(phi)
            ));
        }
        return points;
    };

    // --- INSTANCED MESHES ---
    const PARTICLE_COUNT = 1500;
    const DECO_COUNT = 200; // Hearts and Cups

    // 1. Silver Hearts
    const heartsMesh = new THREE.InstancedMesh(heartGeo, silverMat, DECO_COUNT/2);
    // 2. Emerald Cups
    const cupsMesh = new THREE.InstancedMesh(cupGeo, emeraldMat, DECO_COUNT/2);
    // 3. Glitter Shards (Mixed)
    const shardsMesh = new THREE.InstancedMesh(shardGeo, silverMat, PARTICLE_COUNT);

    const exoPointsDeco = generateEXOPoints(DECO_COUNT);
    const scatterPointsDeco = generateScatterPoints(DECO_COUNT);
    
    const exoPointsShards = generateEXOPoints(PARTICLE_COUNT);
    const scatterPointsShards = generateScatterPoints(PARTICLE_COUNT);

    // Store data for animation
    const decoData: { velocity: THREE.Vector3, rotationAxis: THREE.Vector3 }[] = [];
    for(let i=0; i<DECO_COUNT; i++) {
        decoData.push({
            velocity: new THREE.Vector3((Math.random()-0.5)*0.01, (Math.random()-0.5)*0.01, (Math.random()-0.5)*0.01),
            rotationAxis: new THREE.Vector3(Math.random(), Math.random(), Math.random()).normalize()
        });
    }

    const shardData: { velocity: THREE.Vector3, speed: number }[] = [];
    for(let i=0; i<PARTICLE_COUNT; i++) {
        shardData.push({
            velocity: new THREE.Vector3(),
            speed: 0.5 + Math.random() * 1.5
        });
    }

    const mainGroup = new THREE.Group();
    mainGroup.add(heartsMesh);
    mainGroup.add(cupsMesh);
    mainGroup.add(shardsMesh);
    scene.add(mainGroup);

    // --- ANIMATION STATE ---
    const dummy = new THREE.Object3D();
    const targetPos = new THREE.Vector3();
    const targetQuat = new THREE.Quaternion();
    let transitionFactor = 0; // 0 = Scattered, 1 = EXO
    let time = 0;

    const animate = () => {
      requestAnimationFrame(animate);
      time += 0.01;

      // Update Hand Logic
      const { x, y, quaternion, isActive } = handPos.current;

      // Transition Logic
      if (isActive) {
        transitionFactor = THREE.MathUtils.lerp(transitionFactor, 1, 0.05);
        
        // Hand Follow (Position)
        const vFOV = THREE.MathUtils.degToRad(camera.fov);
        const height = 2 * Math.tan(vFOV / 2) * 8; // z=8
        const width = height * camera.aspect;

        // Mirror interaction mapping
        targetPos.set(
            (0.5 - x) * width * 1.5,
            (0.5 - y) * height * 1.5,
            0
        );
        targetQuat.set(quaternion.x, quaternion.y, quaternion.z, quaternion.w);

        mainGroup.position.lerp(targetPos, 0.1);
        mainGroup.quaternion.slerp(targetQuat, 0.1);
      } else {
        transitionFactor = THREE.MathUtils.lerp(transitionFactor, 0, 0.03);
        
        // Idle Float
        mainGroup.position.lerp(new THREE.Vector3(0,0,0), 0.05);
        mainGroup.quaternion.slerp(new THREE.Quaternion(), 0.05);
        mainGroup.rotation.y = Math.sin(time * 0.2) * 0.1;
      }

      // Update Decorations (Hearts & Cups)
      for (let i = 0; i < DECO_COUNT; i++) {
         const isHeart = i < DECO_COUNT / 2;
         const mesh = isHeart ? heartsMesh : cupsMesh;
         const idx = isHeart ? i : i - DECO_COUNT/2;

         const scat = scatterPointsDeco[i];
         const exo = exoPointsDeco[i];
         
         // Interpolate Position
         dummy.position.lerpVectors(scat, exo, transitionFactor);
         
         // Add noise
         dummy.position.x += Math.sin(time + i) * 0.05 * (1-transitionFactor); // More noise when scattered
         dummy.position.y += Math.cos(time + i * 2) * 0.05 * (1-transitionFactor);

         // Rotation
         dummy.rotation.x = time * decoData[i].rotationAxis.x;
         dummy.rotation.y = time * decoData[i].rotationAxis.y;
         
         // Scale pulse
         const scale = 1.0 + Math.sin(time * 2 + i) * 0.2;
         dummy.scale.setScalar(scale);

         dummy.updateMatrix();
         mesh.setMatrixAt(idx, dummy.matrix);
      }
      heartsMesh.instanceMatrix.needsUpdate = true;
      cupsMesh.instanceMatrix.needsUpdate = true;

      // Update Shards
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const scat = scatterPointsShards[i];
        const exo = exoPointsShards[i];

        dummy.position.lerpVectors(scat, exo, transitionFactor);
        
        // Orbit noise when in EXO shape to make it look alive
        if (transitionFactor > 0.8) {
             dummy.position.x += Math.sin(time * shardData[i].speed + i) * 0.02;
             dummy.position.y += Math.cos(time * shardData[i].speed + i) * 0.02;
        } else {
             // Drifting when scattered
             dummy.position.y += Math.sin(time + i)*0.01;
        }

        dummy.rotation.set(time*i, time, 0);
        
        const scale = transitionFactor > 0.5 ? 1 : 0.5; // Smaller when scattered
        dummy.scale.setScalar(scale);
        
        dummy.updateMatrix();
        shardsMesh.setMatrixAt(i, dummy.matrix);
      }
      shardsMesh.instanceMatrix.needsUpdate = true;

      // Light Animation
      pointLight.position.x = Math.sin(time) * 5;
      pointLight.position.y = Math.cos(time * 0.7) * 5;
      pointLight.intensity = 2 + Math.sin(time * 3) * 1;

      composer.render();
    };

    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      composer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      mountRef.current?.removeChild(renderer.domElement);
      renderer.dispose();
      composer.dispose();
    };
  }, []);

  return <div ref={mountRef} className="absolute inset-0 pointer-events-none" />;
};
