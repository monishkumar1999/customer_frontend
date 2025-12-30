import React, { useMemo, useEffect } from "react";
import { useGLTF, Center } from "@react-three/drei";
import { useStore } from "../../store/useStore";
import * as THREE from "three";
import { generateFabricNormalMap } from "../utils/textureUtils";

const DynamicModel = React.memo(React.forwardRef(({ url, meshTextures, meshNormals, meshColors, materialProps, setMeshList, onMeshLoaded }, ref) => {
    const { scene } = useGLTF(url);
    const clonedScene = useMemo(() => scene.clone(), [scene]);

    // Expose scene via ref
    React.useImperativeHandle(ref, () => ({
        scene: clonedScene
    }), [clonedScene]);

    // Memoize loader to prevent recreation
    const textureLoader = useMemo(() => new THREE.TextureLoader(), []);

    // Generate Fabric Normal Map once
    const materialSettings = useStore(state => state.materialSettings);
    const fabricMapUrl = useMemo(() => {
        // Default to 'plain' if not set
        const type = materialSettings.fabricType || 'plain';
        return generateFabricNormalMap(512, 512, 8, type);
    }, [materialSettings.fabricType]);
    // Load it as a texture
    // using raw THREE loader for manual control or useLoader if consistent
    // Since it's a data URL, we can load it directly. 
    // Ideally useLoader(THREE.TextureLoader, fabricMapUrl) but useMemo manual load is fine for Data URIs to avoid suspense jitter on re-gen
    const [fabricTexture, setFabricTexture] = React.useState(null);

    useEffect(() => {
        if (fabricMapUrl) {
            new THREE.TextureLoader().load(fabricMapUrl, (tex) => {
                tex.wrapS = THREE.RepeatWrapping;
                tex.wrapT = THREE.RepeatWrapping;
                tex.repeat.set(4, 4); // Repeat 4 times
                setFabricTexture(tex);
            });
        }
    }, [fabricMapUrl]);


    // Initial Mesh Discovery
    useEffect(() => {
        const meshes = [];
        clonedScene.traverse((child) => {
            if (child.isMesh) {
                meshes.push(child.name);
                if (!child.userData.originalMat) child.userData.originalMat = child.material.clone();
            }
        });
        setMeshList((prev) => (prev.length === meshes.length ? prev : [...new Set(meshes)]));
        if (onMeshLoaded) onMeshLoaded(clonedScene);
    }, [clonedScene, setMeshList, onMeshLoaded]);

    // Texture & Material Updates
    // materialSettings is already declared at the top

    useEffect(() => {
        clonedScene.traverse((child) => {
            if (child.isMesh) {
                // 1. Handle Texture Map
                if (meshTextures[child.name]) {
                    const newMap = meshTextures[child.name];

                    // Only clone/replace material if the MAP actually changes significantly
                    // or if we haven't set up our custom material yet.
                    // However, to be safe and responsive, we can just update the map on the existing material
                    // if it's already a clone, or clone it once.

                    // Simplified: Ensure we are working on a clone
                    if (!child.userData.isCloned) {
                        child.material = child.userData.originalMat ? child.userData.originalMat.clone() : child.material.clone();
                        child.userData.isCloned = true;
                    }

                    // Update Map if different
                    if (child.material.map?.uuid !== newMap.uuid) {
                        child.material.map = newMap;
                        child.material.map.flipY = false;
                        child.material.map.colorSpace = THREE.SRGBColorSpace;
                        child.material.map.minFilter = THREE.LinearMipMapLinearFilter;
                        child.material.map.magFilter = THREE.LinearFilter;
                        child.material.map.anisotropy = 16;
                        child.material.map.generateMipmaps = true;
                        child.material.needsUpdate = true;
                    }
                } else {
                    // No texture? Revert to original? 
                    // For now, keep as is or ensure specific behavior.
                    if (child.userData.originalMat && child.userData.isCloned) {
                        // Optional: Revert to original if that's the desired flow, 
                        // but usually we just clear the map.
                        child.material.map = null;
                        child.material.needsUpdate = true;
                    }
                }

                // 2. Upgrade to MeshPhysicalMaterial if needed (for Sheen support)
                if (child.material.type !== "MeshPhysicalMaterial") {
                    const newMat = new THREE.MeshPhysicalMaterial();
                    const source = child.material;

                    // Copy basic properties safely
                    newMat.name = source.name;
                    if (source.color) newMat.color.copy(source.color);
                    if (source.map) newMat.map = source.map;
                    if (source.opacity !== undefined) newMat.opacity = source.opacity;
                    if (source.transparent !== undefined) newMat.transparent = source.transparent;
                    if (source.alphaTest !== undefined) newMat.alphaTest = source.alphaTest;
                    if (source.side !== undefined) newMat.side = source.side;

                    child.material = newMat;
                    child.userData.isCloned = true;
                }

                // 3. Always Apply Material Properties (Admin Config)
                const mat = child.material;
                mat.side = THREE.DoubleSide;

                // Dynamic Admin Controls
                mat.roughness = materialSettings.roughness;
                mat.metalness = materialSettings.metalness;
                mat.sheen = materialSettings.sheen;
                mat.sheenRoughness = materialSettings.sheenRoughness;

                // Apply Normals (Baked Mesh Specific or Global Fabric)
                if (meshNormals && meshNormals[child.name]) {
                    // If we have a baked normal map for this mesh, use it.
                    textureLoader.load(meshNormals[child.name], (normMap) => {
                        normMap.flipY = false;
                        mat.normalMap = normMap;
                        // Use global strength setting for consistency, assuming baked map is just vectors.
                        mat.normalScale.set(materialSettings.fabricStrength, materialSettings.fabricStrength);
                        mat.needsUpdate = true;
                    });
                } else if (fabricTexture && materialSettings.fabricStrength > 0) {
                    // Otherwise, use the global tiled fabric map if strength is > 0
                    mat.normalMap = fabricTexture;
                    mat.normalScale = new THREE.Vector2(materialSettings.fabricStrength, materialSettings.fabricStrength);
                } else {
                    // No normal map
                    mat.normalMap = null;
                }

                mat.flatShading = false;
                mat.clearcoat = 0; // Keeping clearcoat off for now as requested

                // CRITICAL FIX: Only apply mesh/material colors when NO texture is present
                // When a texture exists, the material color multiplies with it.
                // We must use white (#ffffff) to preserve the texture's original colors.
                if (meshTextures[child.name]) {
                    // Texture is present - use white to avoid color multiplication
                    mat.color.set('#ffffff');
                } else if (meshColors && meshColors[child.name]) {
                    // No texture - apply mesh-specific color
                    mat.color.set(meshColors[child.name]);
                } else if (materialProps.color) {
                    // No texture - apply global material color
                    mat.color.set(materialProps.color);
                } else {
                    // Fallback to white
                    mat.color.set('#ffffff');
                }

                mat.needsUpdate = true;
            }
        });
    }, [clonedScene, meshTextures, meshNormals, meshColors, materialProps, materialSettings, fabricTexture]);

    return (
        <Center>
            <primitive object={clonedScene} />
        </Center>
    );
}));

export default DynamicModel;
