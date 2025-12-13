import React, { useMemo, useEffect } from "react";
import { useGLTF, Center } from "@react-three/drei";
import * as THREE from "three";

const DynamicModel = React.memo(({ url, meshTextures, materialProps, setMeshList, onMeshLoaded }) => {
    const { scene } = useGLTF(url);
    const clonedScene = useMemo(() => scene.clone(), [scene]);

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
    useEffect(() => {
        clonedScene.traverse((child) => {
            if (child.isMesh) {
                if (meshTextures[child.name]) {
                    const newMap = meshTextures[child.name];
                    if (child.material.map?.uuid !== newMap.uuid) {
                        const mat = child.userData.originalMat.clone();
                        mat.map = newMap;
                        mat.map.flipY = false;
                        mat.map.colorSpace = THREE.SRGBColorSpace;
                        mat.roughness = materialProps.roughness;
                        mat.metalness = materialProps.metalness;
                        if (materialProps.color) mat.color.set(materialProps.color);
                        child.material = mat;
                        child.material.needsUpdate = true;
                    }
                } else {
                    // Revert / Default properties
                    child.material.roughness = materialProps.roughness;
                    child.material.metalness = materialProps.metalness;
                    child.material.color.set(materialProps.color || "#ffffff");
                    // Note: We don't revert the 'map' here to original because we assume the editor controls the whole look once started.
                    // But we should ensure color is correct.
                }
            }
        });
    }, [clonedScene, meshTextures, materialProps]);

    return (
        <Center>
            <primitive object={clonedScene} />
        </Center>
    );
});

export default DynamicModel;
