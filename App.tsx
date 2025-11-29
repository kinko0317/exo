
import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';
import { initializeHandLandmarker, getHandLandmarker } from './services/visionService';
import { analyzeSpell } from './services/geminiService';
import { MagicScene } from './components/MagicScene';
import { CyberHUD } from './components/CyberHUD';
import { AppState, SpellAnalysis, HandPosition } from './types';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [spellData, setSpellData] = useState<SpellAnalysis | null>(null);
  const [fps, setFps] = useState(0);
  const [handDetected, setHandDetected] = useState(false);
  
  // Refs for non-react state logic
  const videoRef = useRef<HTMLVideoElement>(null);
  const lastVideoTimeRef = useRef(-1);
  const handPosRef = useRef<HandPosition>({ 
    x: 0.5, y: 0.5, z: 0, 
    quaternion: { x: 0, y: 0, z: 0, w: 1 }, 
    isActive: false 
  });
  const requestRef = useRef<number>(0);
  const frameCountRef = useRef(0);
  const lastFpsTimeRef = useRef(0);
  const spellTimerRef = useRef(0);

  const startVision = async () => {
    try {
      setAppState(AppState.LOADING_MODEL);
      await initializeHandLandmarker();
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: 1280, 
          height: 720,
          facingMode: "user" 
        } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.addEventListener('loadeddata', predictWebcam);
      }
      
      setAppState(AppState.ACTIVE);
    } catch (err) {
      console.error(err);
      setAppState(AppState.ERROR);
    }
  };

  const predictWebcam = useCallback(async () => {
    const handLandmarker = getHandLandmarker();
    const video = videoRef.current;

    if (!handLandmarker || !video) return;

    const now = performance.now();
    
    // FPS Calculation
    frameCountRef.current++;
    if (now - lastFpsTimeRef.current >= 1000) {
      setFps(frameCountRef.current);
      frameCountRef.current = 0;
      lastFpsTimeRef.current = now;
    }

    // MediaPipe Prediction
    if (video.videoWidth > 0 && video.currentTime !== lastVideoTimeRef.current) {
      lastVideoTimeRef.current = video.currentTime;
      const result = handLandmarker.detectForVideo(video, now);

      if (result.landmarks && result.landmarks.length > 0 && result.worldLandmarks && result.worldLandmarks.length > 0) {
        setHandDetected(true);
        const landmarks = result.landmarks[0];
        const worldLandmarks = result.worldLandmarks[0];

        // 1. Calculate Position (Screen Space -> Normalized)
        // Use Palm Centroid (Average of Wrist, Index MCP, Pinky MCP) for stable center
        const wrist = landmarks[0];
        const indexMCP = landmarks[5];
        const pinkyMCP = landmarks[17];
        
        const avgX = (wrist.x + indexMCP.x + pinkyMCP.x) / 3;
        const avgY = (wrist.y + indexMCP.y + pinkyMCP.y) / 3;
        const avgZ = (wrist.z + indexMCP.z + pinkyMCP.z) / 3;

        // 2. Calculate Rotation (World Space)
        // Create vectors from Wrist to Index and Wrist to Pinky to determine plane
        const w = new THREE.Vector3(worldLandmarks[0].x, worldLandmarks[0].y, worldLandmarks[0].z);
        const i = new THREE.Vector3(worldLandmarks[5].x, worldLandmarks[5].y, worldLandmarks[5].z);
        const p = new THREE.Vector3(worldLandmarks[17].x, worldLandmarks[17].y, worldLandmarks[17].z);

        const v1 = new THREE.Vector3().subVectors(i, w).normalize(); // Wrist -> Index
        const v2 = new THREE.Vector3().subVectors(p, w).normalize(); // Wrist -> Pinky
        
        // Calculate Palm Normal
        const normal = new THREE.Vector3().crossVectors(v1, v2).normalize();
        
        // Construct Basis Matrix
        // We want the object's Z axis to align with the negative normal (facing out of palm)
        const zAxis = normal.negate(); 
        const yAxis = v1;
        const xAxis = new THREE.Vector3().crossVectors(yAxis, zAxis).normalize();
        
        const rotationMatrix = new THREE.Matrix4().makeBasis(xAxis, yAxis, zAxis);
        const quaternion = new THREE.Quaternion().setFromRotationMatrix(rotationMatrix);

        // Update Ref
        handPosRef.current = {
          x: avgX,
          y: avgY,
          z: avgZ,
          quaternion: { x: quaternion.x, y: quaternion.y, z: quaternion.z, w: quaternion.w },
          isActive: true
        };

        // Spell Logic
        spellTimerRef.current += 16;
        if (spellTimerRef.current > 3000 && !spellData) {
            spellTimerRef.current = -10000;
            // Trigger spell analysis
            analyzeSpell("Mystic Shield Formation", 3.0).then(data => {
                setSpellData(data);
            });
        }

      } else {
        setHandDetected(false);
        handPosRef.current.isActive = false;
        spellTimerRef.current = 0;
      }
    }

    requestRef.current = requestAnimationFrame(predictWebcam);
  }, [spellData]);

  useEffect(() => {
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black">
      {/* Hidden Video Element for MediaPipe - ScaleX(-1) mirrors it visually if we were showing it, 
          but for MP input we pass the element directly. 
          Important: User expects mirror behavior. MP processes raw frames.
          If we want mirror interaction: Moving Hand Right -> Screen Right. 
          Raw: Moving Hand Right -> Camera Left. 
          So logic in MagicScene must invert X. */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="absolute top-0 left-0 w-[320px] h-[180px] opacity-0 pointer-events-none z-0"
        style={{ transform: 'scaleX(-1)' }} 
      />
      
      <MagicScene handPos={handPosRef} />
      
      <CyberHUD 
        appState={appState} 
        spellData={spellData} 
        fps={fps} 
        onInit={startVision}
        handDetected={handDetected}
      />
    </div>
  );
};

export default App;
