import React, { useState, useCallback } from "react";
import * as THREE from "three";
import SetupPhase from "./components/SetupPhase";
import DesignPhase from "./components/DesignPhase";

import { optimizeImage } from "../utils/imageOptimizer";

/* =========================================================
   MAIN APP ORCHESTRATOR
   ========================================================= */
export default function ProTShirtStudio() {
  const [phase, setPhase] = useState('setup'); // 'setup' | 'design'

  // -- Project Data --
  const [glbUrl, setGlbUrl] = useState(null);
  const [meshList, setMeshList] = useState([]);
  const [meshConfig, setMeshConfig] = useState({}); // { meshName: { maskUrl } }

  // -- Editor State --
  const [meshTextures, setMeshTextures] = useState({});
  const [globalMaterial, setGlobalMaterial] = useState({ color: "#ffffff", roughness: 0.5, metalness: 0, wireframe: false });
  const [activeStickerUrl, setActiveStickerUrl] = useState(null);

  // --- Handlers ---
  const handleGlb = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (glbUrl) URL.revokeObjectURL(glbUrl);
      setGlbUrl(URL.createObjectURL(file));
      setMeshList([]);
      setMeshConfig({});
    }
  };

  const handleMaskUpload = (meshName, e) => {
    const file = e.target.files[0];
    if (file) {
      // Optimize the image before using it
      // Reduces 7MB -> ~100KB by resizing to max 1024px
      optimizeImage(file, 1024, 0.8) // Max 1024px
        .then(blob => {
          const optimizedUrl = URL.createObjectURL(blob);
          setMeshConfig(prev => ({
            ...prev,
            [meshName]: { ...prev[meshName], maskUrl: optimizedUrl }
          }));
        })
        .catch(err => {
          console.error("Optimization failed, falling back to original", err);
          // Fallback
          setMeshConfig(prev => ({
            ...prev,
            [meshName]: { ...prev[meshName], maskUrl: URL.createObjectURL(file) }
          }));
        });
    }
  };



  const applyTexture = useCallback((meshName, dataUrl) => {
    if (!dataUrl) {
      setMeshTextures(prev => {
        const next = { ...prev };
        delete next[meshName];
        return next;
      });
      return;
    }

    // COMPOSITE WITH BACKGROUND COLOR
    // The 2D Editor sends a transparent PNG (so white mask is visible on dark UI).
    // The 3D Model needs a SOLID texture (so transparent parts aren't black).
    // We fill the texture background with the global material color.
    const img = new Image();
    img.src = dataUrl;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');

      // 1. Fill with Material Color (e.g. White)
      // Use the current state color. Note: useCallback closure might have stale state.
      // We can pass color as arg or use ref, but usually standard white is safe default if stale.
      // Better: Use the color from the component scope. 
      // NOTE: useCallback dependency needs to include globalMaterial.color if we use it directly.
      // BUT changing color would trigger re-creation of texture? 
      // Ideally DynamicModel handles color change, but here we bake it into texture.
      // If we bake it, we need to re-bake when color changes? 
      // DynamicModel mixes color * map. If map is solid white, color * white = color.
      // If map is solid white, result is color.

      // Wait! If DynamicModel does `color * map`, and map is white, we get color.
      // If map is transparent (0), we get 0 (Black).
      // So we just need to fill transparency with WHITE (1,1,1).
      // Then `MaterialColor * 1 = MaterialColor`.
      // Perfect. We ALWAYS fill with WHITE, regardless of Material Color.

      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 2. Draw the transparent image on top
      ctx.drawImage(img, 0, 0);

      // 3. Create Texture from this composite
      const solidDataUrl = canvas.toDataURL();
      const loader = new THREE.TextureLoader();
      const tex = loader.load(solidDataUrl);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.flipY = false;

      setMeshTextures(prev => ({ ...prev, [meshName]: tex }));
    };
  }, []);

  return (
    <div className="w-full h-screen bg-[#f8f9fc] text-zinc-900 font-sans overflow-hidden">
      {phase === 'setup' ? (
        <SetupPhase
          glbUrl={glbUrl}
          meshList={meshList}
          meshConfig={meshConfig}
          globalMaterial={globalMaterial}
          setGlbUrl={setGlbUrl}
          handleGlb={handleGlb}
          handleMaskUpload={handleMaskUpload}
          setMeshList={setMeshList}
          onLaunch={() => setPhase('design')}
        />
      ) : (
        <DesignPhase
          glbUrl={glbUrl}
          meshConfig={meshConfig}
          meshTextures={meshTextures}
          globalMaterial={globalMaterial}
          activeStickerUrl={activeStickerUrl}
          setGlobalMaterial={setGlobalMaterial}
          setActiveStickerUrl={setActiveStickerUrl}
          onBack={() => setPhase('setup')}
          onUpdateTexture={applyTexture}
        />
      )}
    </div>
  );
}
